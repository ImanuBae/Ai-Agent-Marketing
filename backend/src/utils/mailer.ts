// src/utils/mailer.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendResetPasswordEmail = async (
  toEmail: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"AI Marketing Agent" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: 'Đặt lại mật khẩu',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #2E75B6;">Đặt lại mật khẩu</h2>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn vào nút bên dưới để tiếp tục:</p>
        <a href="${resetUrl}"
          style="display:inline-block; padding: 12px 24px; background:#2E75B6;
                 color:#fff; border-radius:6px; text-decoration:none; font-weight:bold;">
          Đặt lại mật khẩu
        </a>
        <p style="color: #888; margin-top: 16px;">
          Link có hiệu lực trong <strong>15 phút</strong>.<br/>
          Nếu bạn không yêu cầu, hãy bỏ qua email này.
        </p>
      </div>
    `,
  });
};