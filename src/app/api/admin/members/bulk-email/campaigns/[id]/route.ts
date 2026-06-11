import { getAdminSession } from "@/lib/auth";
import { getBroadcastEmailCampaign } from "@/lib/services/broadcast-email-service";

export async function GET(_request: Request, context: RouteContext<"/api/admin/members/bulk-email/campaigns/[id]">) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const campaign = await getBroadcastEmailCampaign(id);
  if (!campaign) return Response.json({ error: "Campaign not found." }, { status: 404 });
  return Response.json({ campaign });
}
