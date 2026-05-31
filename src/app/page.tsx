import Link from "next/link";
import { ShieldCheck, Smartphone, Users2 } from "lucide-react";
import { listMembersWithVerification } from "@/lib/mock-store";
import { StatusChip } from "@/components/shared/status-chip";

export default function Home() {
  const members = listMembersWithVerification();
  const verifiedCount = members.filter((member) => member.verification.completed).length;
  const sharedCount = members.filter((member) => member.linkedMemberCount > 1).length;

  return (
    <div className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="shell-panel rounded-[32px] px-6 py-8 md:px-10 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-rose-700">Trusted member verification workflow</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-[var(--foreground)] md:text-6xl">
                Clean up shared numbers, verify every member, and keep the club directory current.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg">
                This portal uses WhatsApp OTP authentication, guided profile completion, and a responsive admin dashboard built around your member verification process.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/login/member" className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700">Member login</Link>
                <Link href="/login/admin" className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] hover:border-rose-300 hover:bg-rose-50">Admin login</Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
              <div className="soft-card rounded-[28px] p-5">
                <div className="flex items-center gap-3 text-rose-700"><ShieldCheck className="h-5 w-5" /><span className="font-medium">System-driven verification</span></div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Verified only when mobile OTP, profile fields, selfie, and document all exist.</p>
              </div>
              <div className="soft-card rounded-[28px] p-5">
                <div className="flex items-center gap-3 text-rose-700"><Smartphone className="h-5 w-5" /><span className="font-medium">WhatsApp OTP on every login</span></div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Members sign in with membership ID or mobile number and re-verify every 24 hours.</p>
              </div>
              <div className="soft-card rounded-[28px] p-5">
                <div className="flex items-center gap-3 text-rose-700"><Users2 className="h-5 w-5" /><span className="font-medium">Household cleanup</span></div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Same-mobile groups are surfaced immediately so each family member can get a unique verified number.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="soft-card rounded-[26px] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-rose-700">Members in sample</p>
            <p className="mt-3 text-4xl font-semibold">{members.length}</p>
          </div>
          <div className="soft-card rounded-[26px] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-rose-700">Completed verification</p>
            <p className="mt-3 text-4xl font-semibold">{verifiedCount}</p>
          </div>
          <div className="soft-card rounded-[26px] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-rose-700">Shared number profiles</p>
            <p className="mt-3 text-4xl font-semibold">{sharedCount}</p>
          </div>
        </section>

        <section className="shell-panel rounded-[32px] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-rose-700">Admin card direction</p>
              <h2 className="mt-2 text-2xl font-semibold">Responsive member cards inspired by your reference grid</h2>
            </div>
            <StatusChip label="UI UX Pro Max guided" tone="success" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {members.slice(0, 3).map((member) => (
              <div key={member.id} className="soft-card rounded-[26px] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{member.fullName}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{member.email}</p>
                  </div>
                  <StatusChip label={member.verification.completed ? "Verified" : "Pending"} tone={member.verification.completed ? "success" : "warning"} />
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{member.address1}, {member.address2}, {member.city}</p>
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">{member.currentMobile}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
