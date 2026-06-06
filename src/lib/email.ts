import nodemailer from "nodemailer";

interface SendEmailOtpInput {
  email: string;
  otp: string;
  memberName: string;
}

export async function sendEmailOtp(input: SendEmailOtpInput) {
  const host = process.env.SMTP_HOST ?? "smtp.hostinger.com";
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER ?? "support@techupservices.com";
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? user;
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

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: input.email,
    subject: "Your Poona Club verification code",
    text: `Hello ${input.memberName}, your Poona Club verification code is ${input.otp}. It is valid for 10 minutes.`,
    html: `<p>Hello ${input.memberName},</p><p>Your <strong>Poona Club</strong> verification code is <strong>${input.otp}</strong>.</p><p>It is valid for 10 minutes.</p>`,
  });

  return { provider: "email", accepted: true };
}
