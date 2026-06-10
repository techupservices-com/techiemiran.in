"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export interface MemberOtpRequestResult {
  identifier: string;
  identifierType: "mobile" | "email";
  deliveryChannel: "mobile" | "email";
  profileId: string;
  mobile: string;
  email: string;
  previewCode?: string;
}

function detectIdentifierType(value: string) {
  const trimmed = value.trim();
  return trimmed.includes("@") ? "email" : "mobile";
}

export function MemberLoginForm({
  initialIdentifier = "",
  onSuccess,
}: {
  initialIdentifier?: string;
  onSuccess?: (result: MemberOtpRequestResult) => void;
}) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [error, setError] = useState<string | null>(null);
  const [requestState, setRequestState] = useState<"idle" | "checking" | "sending" | "sent" | "redirecting">("idle");

  const identifierType = useMemo(() => detectIdentifierType(identifier), [identifier]);
  const deliveryChannel = identifierType === "email" ? "email" : "mobile";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setRequestState("checking");

    const response = await fetch("/api/member/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, identifierType, deliveryChannel }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setRequestState("idle");
      setError(payload.error ?? "Unable to send OTP.");
      return;
    }

    setRequestState("sending");
    await new Promise((resolve) => setTimeout(resolve, 250));
    setRequestState("sent");
    await new Promise((resolve) => setTimeout(resolve, 250));

    const result: MemberOtpRequestResult = {
      identifier,
      identifierType,
      deliveryChannel,
      profileId: payload.profileId,
      mobile: payload.mobile ?? "",
      email: payload.email ?? "",
      previewCode: payload.previewCode,
    };

    if (onSuccess) {
      setRequestState("idle");
      onSuccess(result);
      return;
    }

    setRequestState("redirecting");

    const query = new URLSearchParams({
      identifier: result.identifier,
      identifierType: result.identifierType,
      deliveryChannel: result.deliveryChannel,
      profileId: result.profileId,
      mobile: result.mobile,
      email: result.email,
    });

    if (result.previewCode) {
      query.set("previewCode", result.previewCode);
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
        disabled={requestState !== "idle"}
        className="w-full rounded-2xl bg-[#3c589e] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2f467e] disabled:opacity-60"
      >
        {requestState === "redirecting"
          ? "Redirecting..."
          : requestState === "sent"
            ? "OTP Sent..."
            : requestState === "sending"
              ? deliveryChannel === "email"
                ? "Sending email OTP..."
                : "Sending OTP..."
              : requestState === "checking"
                ? "Checking record..."
          : deliveryChannel === "email"
            ? "Send Email OTP"
            : "Send OTP"}
      </button>
    </form>
  );
}
