import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { previewBroadcastEmail } from "@/lib/services/broadcast-email-service";

const schema = z.object({
  selectionMode: z.enum(["selected_visible", "all_filtered"]),
  selectedIds: z.array(z.string().uuid()).optional(),
  query: z.string().optional(),
  filters: z.array(z.enum(["verified", "shared", "inprogress", "notstarted"])).optional(),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = schema.parse(await request.json());
  const preview = await previewBroadcastEmail(body);
  return Response.json(preview);
}
