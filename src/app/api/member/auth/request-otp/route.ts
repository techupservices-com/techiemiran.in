import { z } from "zod";
import { createOtp } from "@/lib/otp-store";
import { findMemberByIdentifier } from "@/lib/mock-store";
import { sendOtpMessage } from "@/lib/techup";

export async function POST(request: Request) {
  const schema = z.object({ identifier: z.string().min(3) });
  const body = schema.parse(await request.json());
  const member = findMemberByIdentifier(body.identifier);

  if (!member) {
    return Response.json({ error: "No member found with that membership ID or mobile." }, { status: 404 });
  }

  const { record, code } = createOtp(member.id, member.currentMobile, "login");
  const delivery = await sendOtpMessage({
    mobile: member.currentMobile,
    otp: code,
    memberName: member.fullName,
    purpose: "login",
    clientReference: record.id,
  });

  return Response.json({
    profileId: member.id,
    mobile: member.currentMobile,
    previewCode: "previewCode" in delivery ? delivery.previewCode : undefined,
  });
}
