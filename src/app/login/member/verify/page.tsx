import { Suspense } from "react";
import { MemberOtpForm } from "@/components/auth/member-otp-form";

export default function MemberVerifyPage() {
  return (
    <div className="min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="shell-panel rounded-[30px] p-6 md:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-rose-700">Verify OTP</p>
          <h1 className="mt-4 text-3xl font-semibold md:text-5xl">Enter the WhatsApp authentication code</h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            Sessions stay active for one day. After that, members authenticate again with a fresh WhatsApp OTP.
          </p>
        </section>
        <section className="soft-card rounded-[30px] p-6 md:p-8">
          <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading verification form...</p>}>
            <MemberOtpForm />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
