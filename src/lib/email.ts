import nodemailer from "nodemailer";

interface SendEmailOtpInput {
  email: string;
  otp: string;
  memberName: string;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
    }),
  ]);
}

export async function sendEmailOtp(input: SendEmailOtpInput) {
  const host = process.env.SMTP_HOST ?? "smtp.hostinger.com";
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER ?? "support@pclprofile.com";
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? "support@pclprofile.com";
  const fromName = process.env.SMTP_FROM_NAME ?? "Poona Club";

  if (!pass) {
    throw new Error("SMTP password is missing.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: { user, pass },
  });

  try {
    await withTimeout(
      transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: input.email,
        subject: "Your Poona Club verification code",
        text: `Hello ${input.memberName}, your Poona Club verification code is ${input.otp}. It is valid for 10 minutes.`,
        html: `<p>Hello ${input.memberName},</p><p>Your <strong>Poona Club</strong> verification code is <strong>${input.otp}</strong>.</p><p>It is valid for 10 minutes.</p>`,
      }),
      6000,
      "SMTP send",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email delivery error";
    console.error(
      JSON.stringify({
        type: "member-email-otp-send-failed",
        host,
        port,
        user,
        fromEmail,
        to: input.email,
        error: message,
      }),
    );
    throw new Error("Unable to send email OTP. Please try again after some time.");
  }

  return { provider: "email", accepted: true };
}
