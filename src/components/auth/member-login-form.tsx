"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function detectIdentifierType(value: string) {
  const trimmed = value.trim();
  return trimmed.includes("@") ? "email" : "mobile";
}

export function MemberLoginForm({ initialIdentifier = "" }: { initialIdentifier?: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [receiveWhatsapp, setReceiveWhatsapp] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const identifierType = useMemo(() => detectIdentifierType(identifier), [identifier]);
  const deliveryChannel =
    identifierType === "email" ? "email" : receiveWhatsapp ? "whatsapp" : "sms";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const response = await fetch("/api/member/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, identifierType, deliveryChannel }),
    });
    const payload = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to send OTP.");
      return;
    }

    const query = new URLSearchParams({
      identifier,
      identifierType,
      deliveryChannel,
      profileId: payload.profileId,
      mobile: payload.mobile ?? "",
      email: payload.email ?? "",
    });

    if (payload.previewCode) {
      query.set("previewCode", payload.previewCode);
    }

    router.push(`/login/member/verify?${query.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="identifier" className="mb-2 block text-sm font-medium text-[var(--foreground)]">
          Mobile number or email address
        </label>
        <input
          id="identifier"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="8237447244 or member@example.com"
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] shadow-sm focus:border-[#6f84ba]"
          required
        />
      </div>

      <div className="rounded-[22px] border border-[var(--border)] bg-white px-4 py-4 text-sm text-[var(--muted)]">
        {identifierType === "mobile" ? (
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={receiveWhatsapp}
              onChange={(event) => setReceiveWhatsapp(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--border)] text-[#3c589e]"
            />
            <span>
              Receive OTP on WhatsApp
              <span className="mt-1 block text-xs text-[var(--muted)]">
                Uncheck this option to receive your OTP by SMS instead.
              </span>
            </span>
          </label>
        ) : (
          <p>Email login sends the OTP directly to your email inbox.</p>
        )}
      </div>

      {error ? <p className="text-sm text-red-600 font-semibold">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-2xl bg-[#3c589e] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2f467e] disabled:opacity-60"
      >
        {isLoading
          ? deliveryChannel === "email"
            ? "Sending email OTP..."
            : deliveryChannel === "sms"
              ? "Sending SMS OTP..."
              : "Sending WhatsApp OTP..."
          : deliveryChannel === "email"
            ? "Send Email OTP"
            : deliveryChannel === "sms"
              ? "Send SMS OTP"
              : "Send WhatsApp OTP"}
      </button>
    </form>
  );
}
