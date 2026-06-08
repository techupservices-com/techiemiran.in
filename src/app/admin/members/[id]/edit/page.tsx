import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminMemberForm } from "@/components/admin/admin-member-form";
import { StatusChip } from "@/components/shared/status-chip";
import { getMemberByIdBasic, getMemberById } from "@/lib/data";

export default async function AdminMemberEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [member, memberWithVerification] = await Promise.all([getMemberByIdBasic(id), getMemberById(id)]);
  if (!member || !memberWithVerification) notFound();

  return (
    <section className="grid gap-4">
      <div className="soft-card rounded-[28px] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#3c589e]">Admin edit</p>
            <h2 className="mt-2 text-2xl font-semibold">Edit member details</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Correct the member record here. Verification still remains controlled by the system and cannot be manually overridden.</p>
          </div>
          <StatusChip label={memberWithVerification.verification.completed ? "Verified record" : "Needs action"} tone={memberWithVerification.verification.completed ? "success" : "warning"} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/admin/members/${member.id}`} className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-[#6f84ba] hover:bg-[#eef2fb]">View full details</Link>
          <Link href="/admin/members" className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-[#6f84ba] hover:bg-[#eef2fb]">Back to directory</Link>
        </div>
      </div>
      <div className="soft-card rounded-[28px] p-6">
        <AdminMemberForm member={memberWithVerification} />
      </div>
    </section>
  );
}
