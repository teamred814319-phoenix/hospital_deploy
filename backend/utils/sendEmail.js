const nodemailer = require("nodemailer");

const sendEmail = async (
  email,
  subject,
  message
) => {
  const host =
    process.env.EMAIL_HOST ||
    "smtp.gmail.com";
  const port = parseInt(
    process.env.EMAIL_PORT,
    10
  ) || 587;
  const secure =
    process.env.EMAIL_SECURE ===
    "true";
  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

  if (!user || !pass) {
    throw new Error(
      "Email configuration missing. Please set EMAIL_USER and EMAIL_PASS."
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  await transporter.sendMail({
    from: `PHOENIX Hospital <${user}>`,
    to: email,
    subject,
    text: message,
  });
};

module.exports = sendEmail;