interface SendEmailOtpInput {
  email: string;
  otp: string;
  memberName: string;
}

export interface ResendEmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text?: string;
  tags?: Array<{ name: string; value: string }>;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
    }),
  ]);
}

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "support@pclprofile.com";
  const fromName = process.env.RESEND_FROM_NAME ?? "Poona Club";

  if (!apiKey) {
    throw new Error("Resend API key is missing.");
  }

  return {
    apiKey,
    fromEmail,
    fromName,
    from: `${fromName} <${fromEmail}>`,
  };
}

async function resendRequest<T>({
  path,
  payload,
  timeoutMs,
  label,
  idempotencyKey,
}: {
  path: string;
  payload: unknown;
  timeoutMs: number;
  label: string;
  idempotencyKey?: string;
}): Promise<T> {
  const { apiKey } = getResendConfig();
  let raw = "";
  let status = 0;

  try {
    const response = await withTimeout(
      fetch(`https://api.resend.com${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "poonaclub/1.0",
          ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
        },
        body: JSON.stringify(payload),
      }),
      timeoutMs,
      label,
    );

    status = response.status;
    raw = await response.text();

    let parsed: T | null = null;
    try {
      parsed = raw ? (JSON.parse(raw) as T) : null;
    } catch {
      parsed = null;
    }

    if (!response.ok || !parsed) {
      const error = new Error(`Resend request failed with status ${status}`) as Error & {
        status?: number;
        responseText?: string;
      };
      error.status = status;
      error.responseText = raw;
      throw error;
    }

    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email delivery error";
    console.error(
      JSON.stringify({
        type: "resend-request-failed",
        path,
        status: status || null,
        response: raw || null,
        error: message,
      }),
    );
    throw error;
  }
}

export async function sendResendEmail(payload: ResendEmailPayload) {
  const response = await resendRequest<{ id?: string }>({
    path: "/emails",
    payload,
    timeoutMs: 6000,
    label: "Resend email send",
  });

  if (!response.id) {
    throw new Error("Unable to send email.");
  }

  return response;
}

export async function sendResendBatchEmails(payload: ResendEmailPayload[], idempotencyKey?: string) {
  return resendRequest<{ data?: Array<{ id?: string }> }>({
    path: "/emails/batch",
    payload,
    timeoutMs: 12000,
    label: "Resend batch send",
    idempotencyKey,
  });
}

export function getDefaultResendFromAddress() {
  return getResendConfig().from;
}

export async function sendEmailOtp(input: SendEmailOtpInput) {
  try {
    const delivery = await sendResendEmail({
      from: getDefaultResendFromAddress(),
      to: [input.email],
      subject: "Your Poona Club verification code",
      text: `Hello ${input.memberName}, your Poona Club verification code is ${input.otp}.`,
      html: `<p>Hello ${input.memberName},</p><p>Your <strong>Poona Club</strong> verification code is <strong>${input.otp}</strong>.</p>`,
    });

    return {
      provider: "resend",
      accepted: true,
      requestId: delivery.id,
    };
  } catch {
    throw new Error("Unable to send email OTP. Please try again after some time.");
  }
}
