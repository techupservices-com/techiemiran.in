"use client";

import { useRouter } from "next/navigation";
import { MobileOtpFlow } from "@/components/member/mobile-otp-flow";

export function MobileChangeForm({ initialMobile = "", verified = false }: { initialMobile?: string; verified?: boolean }) {
  const router = useRouter();

  return (
    <MobileOtpFlow
      title="Enter your mobile number"
      description="Enter the mobile number you want to verify for your member account."
      mobileLabel="Mobile number"
      initialMobile={verified ? "" : initialMobile}
      requestEndpoint="/api/member/mobile/request-change"
      verifyEndpoint="/api/member/mobile/verify-change"
      verifyButtonLabel="Verify mobile"
      requestPayloadBuilder={(mobile) => ({ newMobile: mobile })}
      onVerified={() => router.refresh()}
    />
  );
}
