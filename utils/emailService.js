const nodemailer = require("nodemailer");
const { MYSIGN_MAIL_USER, MYSIGN_MAIL_PASS } = require("../config");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: MYSIGN_MAIL_USER,
    pass: MYSIGN_MAIL_PASS,
  },
});

// const sendEmail = (to, subject, text) => {
//   const mailOptions = {
//     // from: mailUser,
//     from: `Ausrealty <${MYSIGN_MAIL_USER}>`,
//     to,
//     subject,
//     html: text,
//   };
//   return transporter.sendMail(mailOptions);
// };

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
module.exports = sendEmail;
