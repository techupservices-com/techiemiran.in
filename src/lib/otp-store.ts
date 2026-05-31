import { OTP_EXPIRY_MINUTES } from "@/lib/constants";
import { generateId, hashValue } from "@/lib/utils";
import type { OtpRecord, VerificationPurpose } from "@/lib/types";

declare global {
  var __POONA_OTP_STATE__: OtpRecord[] | undefined;
}

function getStore() {
  if (!globalThis.__POONA_OTP_STATE__) {
    globalThis.__POONA_OTP_STATE__ = [];
  }
  return globalThis.__POONA_OTP_STATE__;
}

export function createOtp(profileId: string, mobile: string, purpose: VerificationPurpose, referenceId?: string) {
  const store = getStore();
  const code = `${Math.floor(100000 + Math.random() * 900000)}`;
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  for (const entry of store) {
    if (entry.profileId === profileId && entry.purpose === purpose && entry.status === "pending") {
      entry.status = "expired";
    }
  }

  const record: OtpRecord = {
    id: generateId("otp"),
    profileId,
    mobile,
    purpose,
    otpHash: hashValue(code),
    expiresAt: expiresAt.toISOString(),
    createdAt: createdAt.toISOString(),
    attemptCount: 0,
    maxAttempts: 5,
    status: "pending",
    referenceId,
  };

  store.push(record);
  return { record, code };
}

export function verifyOtp(profileId: string, purpose: VerificationPurpose, code: string, referenceId?: string) {
  const store = getStore();
  const record = [...store]
    .reverse()
    .find(
      (entry) =>
        entry.profileId === profileId &&
        entry.purpose === purpose &&
        entry.status === "pending" &&
        (!referenceId || entry.referenceId === referenceId),
    );

  if (!record) {
    return { ok: false, reason: "No pending OTP found." };
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    record.status = "expired";
    return { ok: false, reason: "OTP has expired." };
  }

  record.attemptCount += 1;
  if (record.attemptCount > record.maxAttempts) {
    record.status = "expired";
    return { ok: false, reason: "Too many attempts." };
  }

  if (record.otpHash !== hashValue(code)) {
    return { ok: false, reason: "Incorrect OTP." };
  }

  record.status = "verified";
  return { ok: true, record };
}
