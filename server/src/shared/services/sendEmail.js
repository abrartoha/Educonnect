import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "../../config/env.js";

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
 * @returns {Promise<void>}
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

    console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.log("email sending error", error.message);
  }
};