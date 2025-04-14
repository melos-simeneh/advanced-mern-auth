const {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} = require("./emailTemlates");
const { mailtrapClient, sender } = require("./mailtrap.config");

exports.senderVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];
  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });
    console.log(`Email to ${email} Sent Successfully`);
  } catch (error) {
    throw new Error(`Error Sending verification email: ${error}`);
  }
};

exports.senderWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];
  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Welcome to MERN Auth",
      html: WELCOME_EMAIL_TEMPLATE.replace("{userName}", name)
        .replace("{loginUrl}", "https://mern-auth.com/login")
        .replace("{supportUrl}", "https://melos-simeneh.vercel.app/"),

      category: "Welcome Email",
    });
    console.log(`Email to ${email} Sent Successfully`);
  } catch (error) {
    throw new Error(`Error Sending verification email: ${error}`);
  }
};
