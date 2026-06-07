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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const identifierType = useMemo(() => detectIdentifierType(identifier), [identifier]);
  const deliveryChannel = identifierType === "email" ? "email" : "mobile";

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

    if (!response.ok) {
      setIsLoading(false);
      setError(payload.error ?? "Unable to send OTP.");
      return;
    }

    setIsLoading(false);
    setIsRedirecting(true);

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
        {identifierType === "mobile"
          ? "A 4-digit OTP will be sent to your mobile number by both SMS and WhatsApp."
          : "A 4-digit OTP will be sent directly to your email inbox."}
      </div>

      {error ? <p className="text-sm text-red-600 font-semibold">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading || isRedirecting}
        className="w-full rounded-2xl bg-[#3c589e] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2f467e] disabled:opacity-60"
      >
        {isRedirecting
          ? "Redirecting..."
          : isLoading
          ? deliveryChannel === "email"
            ? "Sending email OTP..."
            : "Sending OTP..."
          : deliveryChannel === "email"
            ? "Send Email OTP"
            : "Send OTP"}
      </button>
    </form>
  );
}
