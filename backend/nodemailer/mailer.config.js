const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sender = {
  email: process.env.EMAIL_USERNAME,
  name: process.env.SMTP_FROM_NAME,
};

module.exports = { transporter, sender };
