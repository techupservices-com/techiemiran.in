import { after } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { createBroadcastEmailCampaign, listBroadcastEmailCampaigns } from "@/lib/services/broadcast-email-service";
import { triggerBroadcastProcessing } from "@/lib/services/broadcast-email-processor";

const createSchema = z.object({
  selectionMode: z.enum(["selected_visible", "all_filtered"]),
  selectedIds: z.array(z.string().uuid()).optional(),
  query: z.string().optional(),
  filters: z.array(z.enum(["verified", "shared", "inprogress", "notstarted"])).optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await listBroadcastEmailCampaigns(6);
  return Response.json({ campaigns });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = createSchema.parse(await request.json());
  const campaign = await createBroadcastEmailCampaign({
    adminId: session.subject,
    selectionMode: body.selectionMode,
    selectedIds: body.selectedIds,
    query: body.query,
    filters: body.filters,
  });
  if (!campaign) {
    return Response.json({ error: "Unable to create the email campaign." }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  if (campaign.totalBatches > 0) {
    after(async () => {
      await triggerBroadcastProcessing(origin, campaign.id);
    });
  }

  return Response.json({ campaign }, { status: 201 });
}
