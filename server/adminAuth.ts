import { SignJWT, jwtVerify } from "jose";
import { parse } from "cookie";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getAdminPasswordHash } from "./db";

const scrypt = promisify(scryptCallback);

export const ADMIN_SESSION_COOKIE = "phoennix_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const failedLoginAttempts = new Map<string, { count: number; resetAt: number }>();

function getSigningKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be configured for administrator sessions");
  return new TextEncoder().encode(secret);
}

function compareSecrets(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return (
    valueBuffer.length === expectedBuffer.length &&
    timingSafeEqual(valueBuffer, expectedBuffer)
  );
}

export function validateAdminCredentials(username: string, password: string) {
  const configuredUsername = process.env.ADMIN_USERNAME;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredUsername || !configuredPassword) return false;
  return compareSecrets(username, configuredUsername) && compareSecrets(password, configuredPassword);
}

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyAdminPassword(password: string, encoded: string) {
  const [, salt, expectedHex] = encoded.split("$");
  if (!salt || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const derived = (await scrypt(password, salt, expected.length)) as Buffer;
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export async function validateAdminCredentialsAsync(username: string, password: string) {
  const configuredUsername = process.env.ADMIN_USERNAME;
  if (!configuredUsername || !compareSecrets(username, configuredUsername)) return false;
  const storedHash = await getAdminPasswordHash();
  return storedHash ? verifyAdminPassword(password, storedHash) : validateAdminCredentials(username, password);
}

export function getAdminRateLimitKey(ip: string | undefined, username: string) {
  return `${ip ?? "unknown"}:${username.trim().toLowerCase()}`;
}

export function checkAdminLoginRateLimit(key: string) {
  const now = Date.now();
  const current = failedLoginAttempts.get(key);
  if (!current || current.resetAt <= now) {
    failedLoginAttempts.set(key, { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (current.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function registerFailedAdminLogin(key: string) {
  const now = Date.now();
  const current = failedLoginAttempts.get(key);
  if (!current || current.resetAt <= now) {
    failedLoginAttempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }
  current.count += 1;
}

export function clearAdminLoginFailures(key: string) {
  failedLoginAttempts.delete(key);
}

export async function createAdminSessionToken() {
  return new SignJWT({ scope: "academy-admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSigningKey());
}

export async function hasAdminSession(cookieHeader?: string) {
  const token = parse(cookieHeader ?? "")[ADMIN_SESSION_COOKIE];
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, getSigningKey());
    return payload.scope === "academy-admin";
  } catch {
    return false;
  }
}

export function getAdminCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS * 1000,
  };
}
