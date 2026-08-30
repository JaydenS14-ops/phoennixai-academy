import { createHash, randomInt } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { createAdminRecoveryToken, getAdminRecoveryToken, markAdminRecoveryTokenUsed, saveAdminPasswordHash } from "./db";
import { ENV } from "./_core/env";
import { hashAdminPassword } from "./adminAuth";

const RECOVERY_TTL_MS = 15 * 60 * 1000;
const GENERIC_MESSAGE = "If the account details are eligible, recovery instructions have been sent.";

export function hashRecoveryCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export function createRecoveryCode() {
  return randomInt(100000, 1000000).toString();
}

export async function sendAdminRecoveryEmail(code: string) {
  if (!ENV.resendApiKey || !ENV.adminRecoveryEmail || !ENV.adminRecoveryFromEmail) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Recovery email is not configured." });
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${ENV.resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: ENV.adminRecoveryFromEmail,
      to: [ENV.adminRecoveryEmail],
      subject: "Verification code to reset your password",
      text: `Hi Admin,\n\nWe received a request to reset the password for your PhoennixAI Academy account.\n\nTo proceed, enter the following 6-digit verification code on the recovery screen:\n\n[ ${code.slice(0, 3)}  ${code.slice(3)} ]\n\nThis code is only valid for the next 15 minutes.\n\nIf you did not request this change, you can safely ignore this email. Your password will remain secure, and no changes will be made to your account.\n\nNeed help? Reply directly to this email or contact support.`,
    }),
  });
  if (!response.ok) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Recovery email could not be sent." });
}

export async function requestAdminPasswordRecovery() {
  const code = createRecoveryCode();
  await createAdminRecoveryToken(hashRecoveryCode(code), new Date(Date.now() + RECOVERY_TTL_MS));
  await sendAdminRecoveryEmail(code);
  return GENERIC_MESSAGE;
}

export async function resetAdminPassword(code: string, newPassword: string) {
  const token = await getAdminRecoveryToken(hashRecoveryCode(code));
  if (!token || token.usedAt || token.expiresAt.getTime() <= Date.now()) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "That recovery code is invalid or has expired." });
  }
  await markAdminRecoveryTokenUsed(token.id);
  await saveAdminPasswordHash(await hashAdminPassword(newPassword));
}
