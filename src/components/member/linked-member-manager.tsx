"use client";

import { useRouter } from "next/navigation";
import { MobileOtpFlow } from "@/components/member/mobile-otp-flow";
import type { MemberWithVerification } from "@/lib/types";
import { formatMobile } from "@/lib/utils";
import { StatusChip } from "@/components/shared/status-chip";

export function LinkedMemberManager({ members }: { members: MemberWithVerification[] }) {
  const router = useRouter();

  return (
    <div className="grid gap-4">
      {members.length > 1 ? (
        <div className="rounded-[22px] border border-[#d7e0f4] bg-[#eef2fb]/60 px-4 py-4 text-sm leading-6 text-[var(--muted)]">
          One member can continue using the shared number as the active login owner. Every other linked family member must be moved to a unique number and verified separately.
        </div>
      ) : null}
      {members.map((member) => (
        <div key={member.id} className="soft-card rounded-[24px] p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">{member.fullName}</h3>
                <StatusChip label={member.mobileVerified ? "Verified" : "Action needed"} tone={member.mobileVerified ? "success" : "warning"} />
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {member.membershipId} · {formatMobile(member.currentMobile)}
              </p>
            </div>
            {!member.mobileVerified ? (
              <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">
                Assign a unique number for this household member. They will receive their own WhatsApp verification OTP.
              </p>
            ) : (
              <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">
                This member already has a verified number, so no more action is needed here.
              </p>
            )}
          </div>

          {!member.mobileVerified ? (
            <div className="mt-4 rounded-[22px] border border-[var(--border)] bg-white px-4 py-4">
              <MobileOtpFlow
                title={`Update ${member.fullName}'s mobile number`}
                description="Enter a unique mobile number for this family member. After sending the OTP, verify it in the next step using SMS or WhatsApp."
                mobileLabel="New mobile number"
                requestEndpoint={`/api/member/linked-members/${member.id}/assign-mobile`}
                verifyEndpoint="/api/member/linked-members/verify-mobile"
                verifyButtonLabel="Verify member OTP"
                requestPayloadBuilder={(mobile, deliveryChannel) => ({ newMobile: mobile, deliveryChannel })}
                onVerified={() => router.refresh()}
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
