import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

// One-time async transporter setup. Two paths:
// 1. SMTP_* env vars provided → use that real SMTP server.
// 2. Otherwise → spin up an Ethereal test inbox (free, no signup) and log a
//    preview URL for every sent email so devs can read it in a browser.
let transporterPromise = null;
let usingEthereal = false;

const buildTransporter = async () => {
  if (env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS) {
    logger.info({ host: env.SMTP_HOST }, 'Email: using configured SMTP server');
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  // Dev fallback — Ethereal hands you a throwaway SMTP account on demand.
  const account = await nodemailer.createTestAccount();
  usingEthereal = true;
  logger.warn(
    { user: account.user },
    'Email: SMTP_* not configured — falling back to Ethereal test inbox. ' +
      'Each sent message will print a preview URL.'
  );
  return nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: { user: account.user, pass: account.pass },
  });
};

const getTransporter = () => {
  if (!transporterPromise) transporterPromise = buildTransporter();
  return transporterPromise;
};

const escapeHtml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Compose + send the enquiry email. Throws on transport failure; the controller
// wraps the call in a fire-and-forget and logs errors.
export const sendEnquiryEmail = async ({
  to,
  targetName,
  studentName,
  studentEmail,
  programme,
  message,
}) => {
  const transporter = await getTransporter();

  const subject = programme
    ? `New EduConnect enquiry — ${programme}`
    : 'New EduConnect enquiry';

  const text = [
    `Hi ${targetName},`,
    '',
    `${studentName} (${studentEmail}) sent you an enquiry via EduConnect.`,
    programme ? `Programme of interest: ${programme}` : null,
    '',
    'Message:',
    message,
    '',
    '— EduConnect',
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family: -apple-system, system-ui, sans-serif; color: #0f172a; max-width: 560px;">
      <p>Hi ${escapeHtml(targetName)},</p>
      <p><strong>${escapeHtml(studentName)}</strong> (<a href="mailto:${escapeHtml(studentEmail)}">${escapeHtml(studentEmail)}</a>) sent you an enquiry via EduConnect.</p>
      ${programme ? `<p style="margin: 0;"><strong>Programme of interest:</strong> ${escapeHtml(programme)}</p>` : ''}
      <div style="margin-top: 16px; padding: 14px 16px; background: #f1f5f9; border-left: 3px solid #7c3aed; border-radius: 4px; white-space: pre-wrap;">${escapeHtml(message)}</div>
      <p style="margin-top: 24px; color: #64748b; font-size: 12px;">— EduConnect</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    replyTo: studentEmail,
    subject,
    text,
    html,
  });

  if (usingEthereal) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info({ to, previewUrl }, 'Enquiry email sent (Ethereal preview)');
    }
  } else {
    logger.info({ to, messageId: info.messageId }, 'Enquiry email sent');
  }
  return info;
};
