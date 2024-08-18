// utils/email.js
const nodemailer = require("nodemailer");
const { mailUser, mailPass } = require("../config");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: mailUser,
    pass: mailPass,
  },
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    // from: mailUser,
    from: `Melo <${mailUser}>`,
    to,
    subject,
    html: text,
  };
  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
