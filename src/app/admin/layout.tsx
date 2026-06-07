import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/shared/admin-logout-button";
import { PortalShell } from "@/components/shared/portal-shell";
import { getAdminSession } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/audit", label: "Audit" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/login/admin");

  return (
    <PortalShell
      title="Admin dashboard"
      subtitle="Search, review, and edit member records in a responsive grid or list without manual verification overrides."
      nav={nav}
      headerRightAction={<AdminLogoutButton />}
    >
      {children}
    </PortalShell>
  );
}
