import nodemailer from "nodemailer";

interface SendVerificationEmailOptions {
  to: string;
  name?: string;
  otp: string;
  verificationUrl: string;
}

interface EmailResult {
  success: boolean;
  provider: "gmail_smtp" | "custom_smtp" | "resend" | "brevo" | "local_dev";
  error?: string;
}

/**
 * Enterprise Academic Email Dispatch Engine
 * Supports Gmail SMTP, Generic SMTP, Resend API, and Brevo API with zero setup friction.
 */
export async function sendVerificationEmail({
  to,
  name,
  otp,
  verificationUrl,
}: SendVerificationEmailOptions): Promise<EmailResult> {
  const recipientName = name || "Peneliti";
  const subject = `[IB-SLR] Kode OTP Verifikasi Akun Anda: ${otp}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 24px; color: #17212B; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E4E7EC; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #17324D; padding: 28px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 12px; color: #A3E5DE; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 14px; }
    .otp-box { background: #EFF7F6; border: 2px dashed #2F7D78; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'SF Mono', Consolas, Menlo, Monaco, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2F7D78; margin: 4px 0; }
    .btn { display: block; text-align: center; background: #2F7D78; color: #ffffff !important; padding: 14px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; margin: 24px 0; box-shadow: 0 2px 4px rgba(47, 125, 120, 0.2); }
    .footer { padding: 20px 28px; background: #F8F9FB; border-top: 1px solid #E4E7EC; font-size: 11px; color: #667085; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>IB-SLR Systematic Review</h1>
      <p>Verifikasi Keaslian Akun Peneliti (Research Integrity)</p>
    </div>
    <div class="content">
      <p>Halo <strong>${recipientName}</strong>,</p>
      <p>Terima kasih telah mendaftar di platform <strong>IB-SLR</strong>. Untuk melindungi integritas riset dan mencegah akun bot/spam, silakan verifikasi alamat email Anda menggunakan kode OTP di bawah ini:</p>

      <div class="otp-box">
        <div style="font-size: 11px; text-transform: uppercase; color: #2F7D78; font-weight: 700; letter-spacing: 1px;">Kode Verifikasi OTP Anda</div>
        <div class="otp-code">${otp}</div>
        <div style="font-size: 11px; color: #667085;">Berlaku selama 15 menit. Jangan bagikan kode ini kepada siapa pun.</div>
      </div>

      <p style="text-align: center; margin: 16px 0; font-size: 12px; color: #667085;">Atau cukup klik tombol konfirmasi langsung di bawah:</p>

      <a href="${verificationUrl}" class="btn">
        Verifikasi Akun Saya Secara Instan &rarr;
      </a>

      <p style="font-size: 12px; color: #667085; margin-top: 24px;">
        Jika Anda tidak merasa mendaftar di IB-SLR, Anda dapat mengabaikan email ini dengan aman.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} IB-SLR Platform • From Literature to Evidence • Standar PRISMA 2020
    </div>
  </div>
</body>
</html>
  `;

  // 1. Try Resend API (HTTP REST)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "IB-SLR <onboarding@resend.dev>",
          to: [to],
          subject,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        return { success: true, provider: "resend" };
      }
      console.warn("Resend API warning:", await res.text());
    } catch (err: any) {
      console.warn("Resend API network error:", err.message);
    }
  }

  // 2. Try Gmail SMTP / Custom SMTP (Nodemailer)
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

  if (gmailUser && gmailPass) {
    const cleanGmailUser = gmailUser.trim();
    // Strip any whitespace from Google App Password (e.g. "ryka mbia msoc cwzv" -> "rykambiamsoccwzv")
    const cleanGmailPass = gmailPass.replace(/\s+/g, "");

    try {
      const transporter = process.env.SMTP_HOST
        ? nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
            auth: { user: cleanGmailUser, pass: cleanGmailPass },
          })
        : nodemailer.createTransport({
            service: "gmail",
            auth: { user: cleanGmailUser, pass: cleanGmailPass },
          });

      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || "IB-SLR Systematic Review"}" <${cleanGmailUser}>`,
        to,
        subject,
        html: htmlContent,
      });

      return { success: true, provider: "gmail_smtp" };
    } catch (err: any) {
      console.warn("Nodemailer SMTP error:", err.message);
    }
  }

  // 3. Try Brevo API (HTTP REST)
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: { name: "IB-SLR", email: process.env.EMAIL_FROM || "no-reply@ib-slr.com" },
          to: [{ email: to, name: recipientName }],
          subject,
          htmlContent,
        }),
      });

      if (res.ok) {
        return { success: true, provider: "brevo" };
      }
    } catch (err: any) {
      console.warn("Brevo API error:", err.message);
    }
  }

  // 4. Fallback: Log OTP securely on the server
  console.log(`[IB-SLR Security] Email verification OTP for ${to}: ${otp} (Link: ${verificationUrl})`);
  return {
    success: true,
    provider: "local_dev",
  };
}
