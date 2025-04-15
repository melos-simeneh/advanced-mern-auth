const { timestamp } = require("../utils/date");
const {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} = require("./emailTemlates");

const { mailtrapClient, sender } = require("./mailtrap.config");

// Send verification email
exports.sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];
  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify Your Email Address",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });
    console.log(
      `[${timestamp()}][Info] ✅ Verification email sent to ${email}`
    );
  } catch (error) {
    console.error(
      `[${timestamp()}][Error] ❌ Failed to send verification email to ${email}:`,
      error.message
    );
    throw new Error(
      "Unable to send verification email. Please try again later."
    );
  }
};

// Send welcome email after successful verification
exports.sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];
  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Welcome to MERN Auth 🎉",
      html: WELCOME_EMAIL_TEMPLATE.replace("{userName}", name)
        .replace("{loginUrl}", "https://mern-auth.com/login")
        .replace("{supportUrl}", "https://melos-simeneh.vercel.app/"),
      category: "Welcome Email",
    });
    console.log(`[${timestamp()}] 🎉 Welcome email sent to ${email}`);
  } catch (error) {
    console.error(
      `[${timestamp()}][Error] ❌ Failed to send welcome email to ${email}:`,
      error.message
    );
    throw new Error("Unable to send welcome email. Please try again later.");
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = [{ email }];
  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset Your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset",
    });
    console.log(`[${timestamp()}] 🔐 Password reset email sent to ${email}`);
  } catch (error) {
    console.error(
      `[${timestamp()}][Error] ❌ Failed to send password reset email to ${email}:`,
      error.message
    );
    throw new Error(
      "Unable to send password reset email. Please try again later."
    );
  }
};

exports.sendResetSuccessEmail = async (email) => {
  const recipient = [{ email }];
  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Your Password Has Been Successfully Reset",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });
    console.log(
      `[${timestamp()}][Info] ✅ Password reset confirmation email sent to ${email}`
    );
  } catch (error) {
    console.error(
      `[${timestamp()}][Error] ❌ Failed to send password reset confirmation email to ${email}:`,
      error.message
    );
    throw new Error(
      "Unable to send password reset confirmation email. Please try again later."
    );
  }
};
