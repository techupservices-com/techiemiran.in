import { AdminHomeLive } from "@/components/admin/admin-home-live";
import { getAdminHomepageData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const initialData = await getAdminHomepageData();
  return <AdminHomeLive initialData={initialData} />;
}
