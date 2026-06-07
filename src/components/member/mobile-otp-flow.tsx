"use client";

import { useState } from "react";

export function MobileOtpFlow({
  title,
  description,
  mobileLabel,
  initialMobile = "",
  requestEndpoint,
  verifyEndpoint,
  verifyButtonLabel,
  requestPayloadBuilder,
  verifyPayloadBuilder,
  onVerified,
}: {
  title: string;
  description: string;
  mobileLabel: string;
  initialMobile?: string;
  requestEndpoint: string;
  verifyEndpoint: string;
  verifyButtonLabel: string;
  requestPayloadBuilder?: (mobile: string) => Record<string, unknown>;
  verifyPayloadBuilder?: (requestId: string, otp: string) => Record<string, unknown>;
  onVerified?: () => void;
}) {
  const [mobile, setMobile] = useState(initialMobile);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  async function requestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setMessage("Sending OTP...");

    try {
      const response = await fetch(requestEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          requestPayloadBuilder
            ? requestPayloadBuilder(mobile)
            : { newMobile: mobile },
        ),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Unable to send OTP.");
        return;
      }

      setRequestId(payload.requestId);
      setMobile(payload.mobile ?? mobile);
      setOtp(payload.previewCode ?? "");
      setMessage(`OTP sent to ${payload.mobile ?? mobile} by SMS and WhatsApp.`);
    } finally {
      setIsSending(false);
    }
  }

  async function verifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requestId) return;
    setIsVerifying(true);
    setMessage("Verifying OTP...");

    try {
      const response = await fetch(verifyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          verifyPayloadBuilder ? verifyPayloadBuilder(requestId, otp) : { requestId, otp },
        ),
      });
      const payload = await response.json();
      setMessage(response.ok ? payload.message : payload.error);
      if (response.ok) {
        onVerified?.();
      }
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="grid gap-4">
      {!requestId ? (
        <form onSubmit={requestOtp} className="soft-card rounded-[24px] p-5">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#3c589e]">Step 1</p>
          <h3 className="mt-2 text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
          <label className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
            {mobileLabel}
            <input
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)]"
              required
            />
          </label>
          <div className="mt-4 rounded-[22px] border border-[var(--border)] bg-white px-4 py-4 text-sm text-[var(--muted)]">
            A 4-digit OTP will be sent to this mobile number by both SMS and WhatsApp.
          </div>
          <button disabled={isSending} className="mt-4 rounded-2xl bg-[#3c589e] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2f467e] disabled:opacity-60">
            {isSending ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="soft-card rounded-[24px] p-5">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#3c589e]">Step 2</p>
          <h3 className="mt-2 text-lg font-semibold">Verify OTP</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Enter the 4-digit OTP sent to {mobile} by SMS and WhatsApp.
          </p>
          <label className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
            OTP code
            <input
              inputMode="numeric"
              maxLength={4}
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)]"
              required
            />
          </label>
          <button disabled={isVerifying} className="mt-4 rounded-2xl bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-strong)] disabled:opacity-50">
            {isVerifying ? "Verifying..." : verifyButtonLabel}
          </button>
        </form>
      )}

      {message ? (
        <p className={`text-sm ${!message.toLowerCase().includes("success") && !message.toLowerCase().includes("otp sent") ? "font-semibold text-red-600" : "text-[var(--muted)]"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
