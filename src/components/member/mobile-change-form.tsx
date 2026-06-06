"use client";

import { useRouter } from "next/navigation";
import { MobileOtpFlow } from "@/components/member/mobile-otp-flow";

export function MobileChangeForm() {
  const router = useRouter();

  return (
    <MobileOtpFlow
      title="Request a new personal mobile number"
      description="Enter the new number below. After sending the OTP, you can verify it in the next step using SMS or WhatsApp."
      mobileLabel="New mobile number"
      requestEndpoint="/api/member/mobile/request-change"
      verifyEndpoint="/api/member/mobile/verify-change"
      verifyButtonLabel="Verify mobile"
      requestPayloadBuilder={(mobile, deliveryChannel) => ({ newMobile: mobile, deliveryChannel })}
      onVerified={() => router.refresh()}
    />
  );
}
