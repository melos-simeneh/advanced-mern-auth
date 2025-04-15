const { timestamp } = require("../utils/date");
const {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} = require("./emailTemlates");

const { transporter, sender } = require("./mailer.config");

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to,
      subject,
      html,
    });
    console.log(`[${timestamp()}][Info] 📧 Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(
      `[${timestamp()}][Error] ❌ Failed to send email to ${to}:`,
      error.message
    );
    throw new Error("Email could not be sent. Please try again later.");
  }
};

exports.sendVerificationEmail = async (email, verificationToken) => {
  const html = VERIFICATION_EMAIL_TEMPLATE.replace(
    "{verificationCode}",
    verificationToken
  );
  await sendEmail({
    to: email,
    subject: "Verify Your Email Address",
    html,
  });
};

exports.sendWelcomeEmail = async (email, name) => {
  const html = WELCOME_EMAIL_TEMPLATE.replace("{userName}", name)
    .replace("{loginUrl}", "https://mern-auth.com/login")
    .replace("{supportUrl}", "https://melos-simeneh.vercel.app/");
  await sendEmail({
    to: email,
    subject: "Welcome to MERN Auth 🎉",
    html,
  });
};

exports.sendPasswordResetEmail = async (email, resetURL) => {
  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL);
  await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html,
  });
};

exports.sendResetSuccessEmail = async (email) => {
  await sendEmail({
    to: email,
    subject: "Your Password Has Been Successfully Reset",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
  });
};
