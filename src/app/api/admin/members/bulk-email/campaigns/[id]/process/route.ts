import { after } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { processBroadcastEmailCampaignWave, getBroadcastProcessToken, triggerBroadcastProcessing } from "@/lib/services/broadcast-email-processor";

export const maxDuration = 60;

function isAuthorizedProcessRequest(request: Request, adminSession: Awaited<ReturnType<typeof getAdminSession>>) {
  const token = request.headers.get("x-broadcast-process-token");
  return token === getBroadcastProcessToken() || Boolean(adminSession);
}

export async function POST(request: Request, context: RouteContext<"/api/admin/members/bulk-email/campaigns/[id]/process">) {
  const session = await getAdminSession();
  if (!isAuthorizedProcessRequest(request, session)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const origin = new URL(request.url).origin;
  const result = await processBroadcastEmailCampaignWave(id);

  if (result.hasMore) {
    after(async () => {
      await triggerBroadcastProcessing(origin, id);
    });
  }

  return Response.json(result);
}
