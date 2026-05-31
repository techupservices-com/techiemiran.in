import { MobileChangeForm } from "@/components/member/mobile-change-form";

export default function MemberMobilePage() {
  return (
    <section className="grid gap-4">
      <div className="soft-card rounded-[28px] p-6">
        <h2 className="text-2xl font-semibold">Manage your mobile number</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Your mobile number only becomes active when the WhatsApp OTP sent to the new number is verified successfully.</p>
      </div>
      <MobileChangeForm />
    </section>
  );
}
