import { sendSmsOtp } from "@/lib/sms";
import { sendOtpMessage } from "@/lib/techup";

type DeliveryChannel = "sms" | "whatsapp";

interface DeliveryResult {
  channel: DeliveryChannel;
  ok: boolean;
  timedOut: boolean;
  durationMs: number;
  requestId?: string;
  error?: string;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
    }),
  ]);
}

async function runChannel(
  channel: DeliveryChannel,
  sender: () => Promise<{ requestId?: string }>,
): Promise<DeliveryResult> {
  const started = Date.now();
  try {
    const result = await sender();
    return {
      channel,
      ok: true,
      timedOut: false,
      durationMs: Date.now() - started,
      requestId: result?.requestId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      channel,
      ok: false,
      timedOut: message.toLowerCase().includes("timed out"),
      durationMs: Date.now() - started,
      error: message,
    };
  }
}

export async function sendMobileOtpWithFallback({
  mobile,
  otp,
  memberName,
  clientReference,
}: {
  mobile: string;
  otp: string;
  memberName: string;
  clientReference: string;
}) {
  const started = Date.now();
  const results = new Map<DeliveryChannel, DeliveryResult>();

  const channelEntries: Array<[DeliveryChannel, Promise<{ channel: DeliveryChannel; result: DeliveryResult }>]> = [
    [
      "sms",
      runChannel("sms", () => withTimeout(sendSmsOtp({ mobile, otp }), 4000, "SMS send")).then((result) => ({
        channel: "sms" as const,
        result,
      })),
    ],
    [
      "whatsapp",
      runChannel(
        "whatsapp",
        () =>
          withTimeout(
            sendOtpMessage({
              mobile,
              otp,
              memberName,
              purpose: "login",
              clientReference,
            }),
            5000,
            "WhatsApp send",
          ),
      ).then((result) => ({ channel: "whatsapp" as const, result })),
    ],
  ];

  const pending = new Map<DeliveryChannel, Promise<{ channel: DeliveryChannel; result: DeliveryResult }>>(channelEntries);

  const allChannelsPromise = Promise.all(channelEntries.map(([, promise]) => promise)).then((entries) => {
    for (const entry of entries) {
      results.set(entry.channel, entry.result);
    }
    return entries.map((entry) => entry.result);
  });

  while (pending.size) {
    const { channel, result } = await Promise.race([...pending.values()]);
    pending.delete(channel);
    results.set(channel, result);

    if (result.ok) {
      void allChannelsPromise.then((finalResults) => {
        console.log(
          JSON.stringify({
            type: "member-login-otp-delivery",
            mobile,
            results: finalResults,
            winner: result.channel,
            totalMs: Date.now() - started,
          }),
        );
      });

      console.log(
        JSON.stringify({
          type: "member-login-otp-delivery-early-success",
          mobile,
          results: Array.from(results.values()),
          winner: result.channel,
          totalMs: Date.now() - started,
        }),
      );

      return {
        accepted: true,
        primaryChannel: result.channel,
        results: Array.from(results.values()),
      };
    }
  }

  const finalResults = await allChannelsPromise;
  console.log(
    JSON.stringify({
      type: "member-login-otp-delivery",
      mobile,
      results: finalResults,
      winner: null,
      totalMs: Date.now() - started,
    }),
  );

  throw new Error("Sending OTP failed. Please try again after some time.");
}
