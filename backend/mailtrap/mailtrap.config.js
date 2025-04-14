const { MailtrapClient } = require("mailtrap");

exports.mailtrapClient = new MailtrapClient({
  endpoint: process.env.MAILTRAP_ENDPOINT,
  token: process.env.MAILTRAP_TOKEN,
});

exports.sender = {
  email: "mailtrap@demomailtrap.co",
  name: "Melos Simeneh",
};
