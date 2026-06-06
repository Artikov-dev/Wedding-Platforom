import nodemailer from 'nodemailer';

type EmailPayload = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
};

function getSmtpConfig() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_SECURE } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP configuration is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    from: SMTP_FROM || SMTP_USER,
  };
}

export async function sendEmail(payload: EmailPayload) {
  const { to, subject, text, html, from } = payload;
  if (!to || !subject || (!text && !html)) {
    throw new Error('Email payload must include to, subject, and text or html.');
  }

  const config = getSmtpConfig();

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.sendMail({
    from: from || config.from,
    to,
    subject,
    text,
    html,
  });
}
