import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true", // false for port 587 (STARTTLS), true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${encodeURIComponent(
    token,
  )}&email=${encodeURIComponent(email)}`;

  await transporter.sendMail({
    from: `"Support" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 60 minutes.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#800000;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">
            Reset Password
          </a>
        </p>
        <p style="color:#666;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
