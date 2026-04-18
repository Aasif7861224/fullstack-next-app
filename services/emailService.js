import nodemailer from "nodemailer";
import { env } from "@/lib/env";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.mail.host || !env.mail.user || !env.mail.pass) return null;

  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: false,
    auth: {
      user: env.mail.user,
      pass: env.mail.pass,
    },
  });
  return transporter;
}

export async function sendInquiryNotifications({ ownerEmail, senderEmail, propertyTitle, message, name }) {
  const mailer = getTransporter();
  if (!mailer) {
    return { ownerEmailSent: false, senderEmailSent: false, reason: "mail_config_missing" };
  }

  let ownerEmailSent = false;
  let senderEmailSent = false;

  try {
    await mailer.sendMail({
      from: env.mail.from,
      to: ownerEmail,
      subject: `New Inquiry for ${propertyTitle}`,
      text: `You received a new inquiry from ${name}. Message: ${message}`,
    });
    ownerEmailSent = true;
  } catch (err) {
    console.error("Owner email failed", err);
  }

  try {
    await mailer.sendMail({
      from: env.mail.from,
      to: senderEmail,
      subject: "Inquiry Received",
      text: `Your inquiry for ${propertyTitle} has been received.`,
    });
    senderEmailSent = true;
  } catch (err) {
    console.error("Sender confirmation email failed", err);
  }

  return { ownerEmailSent, senderEmailSent };
}

