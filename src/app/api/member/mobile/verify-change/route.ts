import { z } from "zod";
import { getMemberSession } from "@/lib/auth";
import { addAuditLog, completeMobileChangeRequest, getMobileChangeRequest } from "@/lib/mock-store";
import { verifyOtp } from "@/lib/otp-store";

export async function POST(request: Request) {
  const session = await getMemberSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const schema = z.object({ requestId: z.string().min(1), otp: z.string().length(6) });
  const body = schema.parse(await request.json());
  const requestRecord = getMobileChangeRequest(body.requestId);
  if (!requestRecord) return Response.json({ error: "Change request not found." }, { status: 404 });

  const result = verifyOtp(session.subject, "mobile_change", body.otp, body.requestId);
  if (!result.ok) return Response.json({ error: result.reason }, { status: 400 });

  completeMobileChangeRequest(body.requestId);
  addAuditLog({ actorType: "member", actorId: session.subject, action: "Verified personal mobile change", targetProfileId: session.subject, metadata: { requestId: body.requestId } });
  return Response.json({ message: "New mobile number verified and activated." });
}
