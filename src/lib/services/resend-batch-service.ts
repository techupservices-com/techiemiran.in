import { getDefaultResendFromAddress, sendResendBatchEmails } from "@/lib/email";
import type { BroadcastEmailRecipient } from "@/lib/types";

export interface BatchSendResult {
  ok: boolean;
  retryable: boolean;
  errorMessage?: string;
  messageIds: Array<string | null>;
}

function isRetryableError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const status = (error as Error & { status?: number }).status;
  return status === 429 || (typeof status === "number" && status >= 500) || error.message.toLowerCase().includes("timed out");
}

export async function sendBroadcastRecipientBatch({
  subject,
  recipients,
  idempotencyKey,
}: {
  subject: string;
  recipients: BroadcastEmailRecipient[];
  idempotencyKey: string;
}): Promise<BatchSendResult> {
  try {
    const response = await sendResendBatchEmails(
      recipients.map((recipient) => ({
        from: getDefaultResendFromAddress(),
        to: [recipient.email],
        subject,
        html: `<p>Hi ${recipient.fullName},</p><p>This is a reminder to complete your Poona Club verification on <a href="https://www.pclprofile.com">pclprofile.com</a>.</p><p>Please log in with your registered email address or mobile number and finish the pending steps at the earliest.</p><p>Thank you,<br />Poona Club</p>`,
        text: `Hi ${recipient.fullName},\n\nThis is a reminder to complete your Poona Club verification on https://www.pclprofile.com. Please log in with your registered email address or mobile number and finish the pending steps at the earliest.\n\nThank you,\nPoona Club`,
        tags: [
          { name: "recipient_id", value: recipient.id },
          { name: "broadcast_id", value: recipient.broadcastEmailId },
          { name: "batch_id", value: recipient.batchId ?? "unassigned" },
        ],
      })),
      idempotencyKey,
    );

    const messageIds = recipients.map((_, index) => response.data?.[index]?.id ?? null);
    return {
      ok: true,
      retryable: false,
      messageIds,
    };
  } catch (error) {
    return {
      ok: false,
      retryable: isRetryableError(error),
      errorMessage: error instanceof Error ? error.message : "Unknown batch send error",
      messageIds: recipients.map(() => null),
    };
  }
}
