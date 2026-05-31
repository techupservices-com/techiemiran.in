import { sleep } from "@/lib/utils";

interface SendOtpMessageInput {
  mobile: string;
  otp: string;
  memberName: string;
  purpose: string;
  clientReference: string;
}

function buildTemplateVariables(input: SendOtpMessageInput) {
  if ((process.env.TECHUP_TEMPLATE_NAME ?? "").trim() === "follow_up_template") {
    return {
      1: input.memberName,
      2: `Poona Club OTP ${input.otp}`,
    };
  }

  return {
    1: input.otp,
    2: "Poona Club",
    3: input.memberName,
  };
}

export async function sendOtpMessage(input: SendOtpMessageInput) {
  const apiKey = process.env.TECHUP_API_KEY;
  const endpoint = "https://api.techupservices.in/api/v1/messages/send";
  const templateName = process.env.TECHUP_TEMPLATE_NAME ?? "club_login_otp";
  const templateLanguage = process.env.TECHUP_TEMPLATE_LANGUAGE ?? "en_US";

  if (!apiKey) {
    await sleep(300);
    return {
      provider: "mock",
      accepted: true,
      previewCode: input.otp,
      clientReference: input.clientReference,
      note: "TECHUP_API_KEY missing, using local mock delivery.",
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: `+91${input.mobile}`,
      type: "template",
      template: {
        name: templateName,
        language: templateLanguage,
        variables: buildTemplateVariables(input),
      },
      client_reference: input.clientReference,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message ?? "TechUpServices send failed.");
  }

  if (!payload.accepted_count) {
    const firstFailure = payload.results?.[0];
    const message = firstFailure?.details || firstFailure?.message || "TechUpServices rejected the template send.";
    throw new Error(message);
  }

  return {
    provider: "techup",
    accepted: payload.accepted_count > 0,
    requestId: payload.request_id,
    clientReference: payload.client_reference,
  };
}
