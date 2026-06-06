import { EmailVerificationForm } from "@/components/member/email-verification-form";
import { StatusChip } from "@/components/shared/status-chip";
import { getMemberSession } from "@/lib/auth";
import { getMemberById } from "@/lib/data";

export default async function MemberEmailPage() {
  const session = await getMemberSession();
  const member = session ? await getMemberById(session.subject) : null;

  return (
    <section className="grid gap-4">
      <div className="soft-card rounded-[28px] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#3c589e]">Email step</p>
            <h2 className="mt-2 text-2xl font-semibold">Verify your email address</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Use this page to verify or update your email with a 4-digit OTP.</p>
          </div>
          <StatusChip label={member?.verification.emailVerified ? "Completed" : "Pending"} tone={member?.verification.emailVerified ? "success" : "warning"} />
        </div>
      </div>
      <EmailVerificationForm initialEmail={member?.email ?? ""} verified={member?.verification.emailVerified} />
    </section>
  );
}
