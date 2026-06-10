import { z } from "zod";
import { ensureMobileLoginOwnerFast, findMemberByEmail, getProfilesByMobileForAuth } from "@/lib/data";
import { sendEmailOtp } from "@/lib/email";
import { createOtp } from "@/lib/otp-store";
import { sendSmsOtp } from "@/lib/sms";
import { sendOtpMessage } from "@/lib/techup";
import { normalizeMobile } from "@/lib/utils";

export async function POST(request: Request) {
  const schema = z.object({
    identifier: z.string().min(3),
    identifierType: z.enum(["mobile", "email"]),
    deliveryChannel: z.enum(["mobile", "email"]),
  });
  const body = schema.parse(await request.json());

  if (body.identifierType === "email" && body.deliveryChannel !== "email") {
    return Response.json({ error: "Email login requires email OTP delivery." }, { status: 400 });
  }

  if (body.identifierType === "mobile" && body.deliveryChannel === "email") {
    return Response.json({ error: "Mobile login cannot use email OTP delivery." }, { status: 400 });
  }

  let member;
  if (body.identifierType === "email") {
    member = await findMemberByEmail(body.identifier);
  } else {
    const normalized = normalizeMobile(body.identifier);
    const profiles = await getProfilesByMobileForAuth(normalized);
    if (!profiles.length) {
      return Response.json({ error: "The entered mobile number is not present in our records. Please re-check your mobile number to continue, or contact the admin for more help." }, { status: 404 });
    }
    member = profiles.length === 1 ? profiles[0] : await ensureMobileLoginOwnerFast(normalized, profiles as never);
  }

  if (!member) {
    return Response.json({ error: body.identifierType === "email" ? "The entered email address is not present in our records. Please re-check your email address to continue, or contact the admin for more help." : "The entered mobile number is not present in our records. Please re-check your mobile number to continue, or contact the admin for more help." }, { status: 404 });
  }

  if (body.identifierType === "email" && !member.email) {
    return Response.json({ error: "This member does not have an email address on record." }, { status: 400 });
  }

  if (body.identifierType === "mobile" && !member.currentMobile) {
    return Response.json({ error: "This member does not have a mobile number on record." }, { status: 400 });
  }

  const destination = body.identifierType === "email" ? member.email : member.currentMobile;
  const { record, code } = await createOtp(
    member.id,
    destination,
    "login",
    body.identifierType,
      body.deliveryChannel,
  );
  try {
    const delivery =
      body.deliveryChannel === "mobile"
        ? await Promise.all([
            sendSmsOtp({ mobile: member.currentMobile, otp: code }),
            sendOtpMessage({
              mobile: member.currentMobile,
              otp: code,
              memberName: member.fullName,
              purpose: "login",
              clientReference: record.id,
            }),
          ]).then(([smsDelivery, whatsappDelivery]) => ({ ...smsDelivery, previewCode: (whatsappDelivery as { previewCode?: string }).previewCode }))
        : await sendEmailOtp({ email: member.email, otp: code, memberName: member.fullName });

    return Response.json({
      profileId: member.id,
      mobile: member.currentMobile,
      email: member.email,
      identifierType: body.identifierType,
      deliveryChannel: body.deliveryChannel,
      previewCode: "previewCode" in delivery ? delivery.previewCode : undefined,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send OTP through WhatsApp provider.",
      },
      { status: 502 },
    );
  }
}
