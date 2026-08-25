import { SignJWT, jwtVerify } from "jose";
import { parse } from "cookie";
import { timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "phoennix_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

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
  return (
    compareSecrets(username, configuredUsername) &&
    compareSecrets(password, configuredPassword)
  );
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
