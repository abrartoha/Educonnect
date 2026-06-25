import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

// import { BadRequestError } from "../utils/errors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  secure: true,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  port: Number(env.SMTP_PORT),
  host: env.SMTP_HOST,
});

/**
 * @typedef {Object} Attachment
 * @property {string} filename - Name of the attachment file
 * @property {Buffer|string} content - File content
 * @property {string} contentType - MIME type of the attachment
 */

/**
 * @typedef {Object} SendEmailOptions
 * @property {string} to - Recipient email address
 * @property {string} subject - Email subject
 * @property {string} templateName - EJS template file name without extension
 * @property {Record<string, any>} [templateData] - Data passed to EJS template
 * @property {Attachment[]} [attachments] - Email attachments
 */

/**
 * Send email using EJS template
 *
 * @param {SendEmailOptions} options - Email configuration options
 * @returns {Promise<boolean>} Returns true if email was sent successfully, otherwise false
 * @throws {AppError} Throws error if email sending fails
 */

export const sendEmail = async ({ to, subject, templateName, templateData, attachments }) => {
  try {
    const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);
    console.log("Rendering email template:", templatePath);
    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
      from: env.SMTP_USER,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    // Example info object from nodemailer:{
    //   accepted: [ 'student@example.com' ],
    //   rejected: [],
    //   ehlo: [
    //     'SIZE 35882577',
    //     '8BITMIME',
    //     'AUTH LOGIN PLAIN XOAUTH2 PLAIN-CLIENTTOKEN OAUTHBEARER XOAUTH',
    //     'ENHANCEDSTATUSCODES',
    //     'PIPELINING',
    //     'CHUNKING',
    //     'SMTPUTF8'
    //   ],
    //   envelopeTime: 992,
    //   messageTime: 694,
    //   messageSize: 1728,
    //   response: '250 2.0.0 OK  1779695986 d2e1a72fcca58-84164ea09a9sm9973190b3a.31 - gsmtp',
    //   envelope: { from: 'ami.faisal2018@gmail.com', to: [ 'student@example.com' ] },
    //   messageId: '<0a0c3fa1-0296-fdc7-d862-4d3380039965@gmail.com>'
    // }
    if (info.accepted.length > 0 && info.rejected.length === 0) {
      return true; // Email sent successfully
    }
    // Logger isn't working here.
    logger.info(`✉️ Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    // Logger isn't working here.
    logger.error("email sending error", error.message);
    return false; // Email failed to send
  }
};