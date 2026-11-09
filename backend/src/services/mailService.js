const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const createTransporter = () => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

const generateOtpCode = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

const sendOtpEmail = async ({ to, fullName, otp }) => {
  if (!transporter) {
    throw new Error(
      "SMTP mail service is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and MAIL_FROM in your environment.",
    );
  }

  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER;
  const appName = process.env.APP_NAME || "TicketBox";

  const info = await transporter.sendMail({
    from: `${appName} <${fromEmail}>`,
    to,
    subject: `${appName} - Mã OTP xác thực đăng ký`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>Xin chào ${fullName || "bạn"},</h2>
        <p>Mã OTP để hoàn tất đăng ký tài khoản trên <strong>${appName}</strong> là:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 20px 0; padding: 12px 20px; background: #f3f4f6; display: inline-block; border-radius: 8px;">${otp}</div>
        <p>Mã này sẽ hết hạn sau 5 phút.</p>
        <p>Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.</p>
      </div>
    `,
  });

  return info;
};

module.exports = {
  generateOtpCode,
  sendOtpEmail,
};
