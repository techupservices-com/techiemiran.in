import { AdminLoginForm } from "@/components/auth/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="shell-panel rounded-[30px] p-6 md:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-rose-700">Admin control room</p>
          <h1 className="mt-4 text-3xl font-semibold md:text-5xl">Manage member verification with searchable card and list views</h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            The admin portal keeps edits, verification states, and document review inside one responsive dashboard. Verification status remains fully system-driven.
          </p>
        </section>
        <section className="soft-card rounded-[30px] p-6 md:p-8">
          <AdminLoginForm />
        </section>
      </div>
    </div>
  );
}
