const {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
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
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error(
      `❌ Failed to send verification email to ${email}:`,
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
    console.log(`🎉 Welcome email sent to ${email}`);
  } catch (error) {
    console.error(
      `❌ Failed to send welcome email to ${email}:`,
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
    console.log(`🔐 Password reset email sent to ${email}`);
  } catch (error) {
    console.error(
      `❌ Failed to send password reset email to ${email}:`,
      error.message
    );
    throw new Error(
      "Unable to send password reset email. Please try again later."
    );
  }
};
