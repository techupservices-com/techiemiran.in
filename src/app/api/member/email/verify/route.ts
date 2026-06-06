import { z } from "zod";
import { getMemberSession } from "@/lib/auth";
import { addAuditLog } from "@/lib/data";
import { verifyOtp } from "@/lib/otp-store";

export async function POST(request: Request) {
  const session = await getMemberSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const schema = z.object({ requestId: z.string().min(1), otp: z.string().length(4) });
  const body = schema.parse(await request.json());
  const result = await verifyOtp(session.subject, "email_verify", body.otp);
  if (!result.ok) return Response.json({ error: result.reason }, { status: 400 });

  await addAuditLog({ actorType: "member", actorId: session.subject, action: "Verified email via OTP", targetProfileId: session.subject, metadata: { scope: "email-otp" } });
  return Response.json({ message: "Email address verified successfully." });
}
