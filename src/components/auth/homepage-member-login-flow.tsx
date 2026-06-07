"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MemberLoginForm } from "@/components/auth/member-login-form";
import { MemberOtpForm } from "@/components/auth/member-otp-form";
import type { MemberOtpRequestResult } from "@/components/auth/member-login-form";

export function HomepageMemberLoginFlow({ initialIdentifier = "" }: { initialIdentifier?: string }) {
  const router = useRouter();
  const [requestData, setRequestData] = useState<MemberOtpRequestResult | null>(null);

  function handleVerified() {
    router.push("/member");
    router.refresh();
  }

  return requestData ? (
    <>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#3c589e]">Verify OTP</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Enter your 4-digit code</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {requestData.identifierType === "email"
          ? "We have sent a 4-digit verification code to your registered email address."
          : "We have sent a 4-digit verification code to your mobile number by SMS and WhatsApp."}
      </p>
      <div className="mt-6">
        <MemberOtpForm
          data={requestData}
          onEdit={() => setRequestData(null)}
          onVerified={handleVerified}
        />
      </div>
    </>
  ) : (
    <>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#3c589e]">Request OTP</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Access your account</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Enter your registered mobile number or email address to receive your OTP and continue with the verification process.</p>
      <div className="mt-6">
        <MemberLoginForm initialIdentifier={initialIdentifier} onSuccess={setRequestData} />
      </div>
    </>
  );
}
