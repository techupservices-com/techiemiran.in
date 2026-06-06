"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EmailVerificationForm({ initialEmail = "", verified = false }: { initialEmail?: string; verified?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  async function requestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setMessage("Sending email OTP...");

    try {
      const response = await fetch("/api/member/email/request-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.error ?? "Unable to send email OTP.");
        return;
      }

      setRequestId(payload.requestId);
      setEmail(payload.email ?? email);
      setOtp(payload.previewCode ?? "");
      setMessage(`OTP sent to ${payload.email ?? email}.`);
    } finally {
      setIsSending(false);
    }
  }

  async function verifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requestId) return;
    setIsVerifying(true);
    setMessage("Verifying email OTP...");

    try {
      const response = await fetch("/api/member/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, otp }),
      });
      const payload = await response.json();
      setMessage(response.ok ? payload.message : payload.error);
      if (response.ok) {
        router.refresh();
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
          <h3 className="mt-2 text-lg font-semibold">Enter your email address</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {verified
              ? "Your email address is already verified. Send a fresh OTP only if you need to update or re-verify it."
              : "Enter the email address you want to verify for your member account."}
          </p>
          <label className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)]"
              required
            />
          </label>
          <button disabled={isSending} className="mt-4 rounded-2xl bg-[#3c589e] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2f467e] disabled:opacity-60">
            {isSending ? "Sending email OTP..." : "Send email OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="soft-card rounded-[24px] p-5">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#3c589e]">Step 2</p>
          <h3 className="mt-2 text-lg font-semibold">Verify email OTP</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Enter the 4-digit OTP sent to {email} to complete your email verification.
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
            {isVerifying ? "Verifying email OTP..." : "Verify email OTP"}
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
