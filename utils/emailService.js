const nodemailer = require("nodemailer");
const {
  MYSIGN_MAIL_USER,
  MYSIGN_MAIL_PASS,
  CONCIERGE_MAIL_USER,
  CONCIERGE_MAIL_PASS,
} = require("../config");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: MYSIGN_MAIL_USER,
    pass: MYSIGN_MAIL_PASS,
  },
});

const transporter2 = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: CONCIERGE_MAIL_USER,
    pass: CONCIERGE_MAIL_PASS,
  },
});

const sendEmail = (to, subject, text, cc = []) => {
  const mailOptions = {
    from: `Ausrealty <${process.env.MYSIGN_MAIL_USER}>`,
    to,
    cc,
    subject,
    html: text,
  };

  return transporter.sendMail(mailOptions);
};

const sendConciergeEmail = (to, subject, text, cc = []) => {
  const mailOptions = {
    from: `Ausrealty <${process.env.CONCIERGE_MAIL_USER}>`,
    to,
    cc,
    subject,
    html: text,
  };

  return transporter2.sendMail(mailOptions);
};

module.exports = { sendEmail, sendConciergeEmail };
