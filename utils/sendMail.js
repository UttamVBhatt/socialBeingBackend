const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = (options) => {
  const msg = {
    to: options.to,
    from: { name: "Uttam V Bhatt", email: process.env.MAIL_FROM },
    subject: options.subject,
    text: options.message,
  };

  const sendEmail = async () => {
    try {
      await sgMail.send(msg);
      console.log("Email send successfully");
    } catch (err) {
      if (err.response) {
        console.log(err.response.body);
      }
    }
  };

  sendEmail();
};

module.exports = sendMail;
