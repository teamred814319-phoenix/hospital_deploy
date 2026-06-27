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
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      "Email configuration missing. Please set EMAIL_USER and EMAIL_PASS."
    );
  }

  const transporter =
    nodemailer.createTransport({

      host,

      port,

      secure,

      auth: {
        user,
        pass,
      },

    });

  await transporter.sendMail({

    from: user,

    to: email,

    subject,

    text: message,

  });

};

module.exports = sendEmail;