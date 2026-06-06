import { OTP_LENGTH } from "@/lib/constants";

interface SendSmsOtpInput {
  mobile: string;
  otp: string;
}

export async function sendSmsOtp(input: SendSmsOtpInput) {
  const username = process.env.SMS_USERNAME;
  const password = process.env.SMS_PASSWORD;
  const senderId = process.env.SMS_SENDER_ID ?? "INFOCS";
  const route = process.env.SMS_ROUTE ?? "trans1";
  const baseUrl = process.env.SMS_API_URL ?? "http://173.45.76.227/send.aspx";

  if (!username || !password) {
    throw new Error("SMS provider credentials are missing.");
  }

  const message = `Welcome To The Poona Club Ltd., Please Share OTP For Checked In Your OTP No Is ${input.otp} CSPL`;
  const url = new URL(baseUrl);
  url.searchParams.set("username", username);
  url.searchParams.set("pass", password);
  url.searchParams.set("route", route);
  url.searchParams.set("senderid", senderId);
  url.searchParams.set("numbers", input.mobile);
  url.searchParams.set("message", message);
  url.searchParams.set("ispreapproved", "1");

  const response = await fetch(url.toString());
  const text = (await response.text()).trim();
  const [status, units, messageId] = text.split("|");

  if (!response.ok || status !== "1") {
    const errors: Record<string, string> = {
      "2": "Invalid SMS credentials.",
      "3": "Insufficient SMS balance.",
      "4": "SMS provider returned an error.",
      "5": "Invalid SMS sender id.",
      "6": "Invalid SMS route.",
      "7": "SMS submission error.",
      "10": "SMS template id missing.",
    };
    throw new Error(errors[status] ?? `SMS send failed with status ${status ?? "unknown"}.`);
  }

  return {
    provider: "sms",
    accepted: true,
    units,
    requestId: messageId,
    otpLength: OTP_LENGTH,
  };
}
