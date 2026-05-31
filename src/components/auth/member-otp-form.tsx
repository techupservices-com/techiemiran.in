"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function MemberOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState(searchParams.get("previewCode") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const profileId = searchParams.get("profileId") ?? "";
  const identifier = searchParams.get("identifier") ?? "";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const response = await fetch("/api/member/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, identifier, otp }),
    });
    const payload = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "OTP verification failed.");
      return;
    }

    router.push("/member");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="otp" className="mb-2 block text-sm font-medium text-[var(--foreground)]">
          OTP code
        </label>
        <input
          id="otp"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
          placeholder="6 digit code"
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base tracking-[0.35em] text-[var(--foreground)] shadow-sm focus:border-rose-300"
          required
        />
      </div>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
      >
        {isLoading ? "Verifying..." : "Verify and continue"}
      </button>
    </form>
  );
}
