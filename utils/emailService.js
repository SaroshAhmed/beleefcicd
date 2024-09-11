// utils/email.js
const nodemailer = require("nodemailer");
const { MAIL_USER,MAIL_PASS } = require("../config");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    // from: mailUser,
    from: `Beleef <${mailUser}>`,
    to,
    subject,
    html: text,
  };
  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
