const nodemailer = require("nodemailer");
const { MYSIGN_MAIL_USER,MYSIGN_MAIL_PASS } = require("../config");

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

const sendEmail = (to, subject, post, agent, agentEmail) => {
  const mailOptions = {
    from: `Ausrealty <${process.env.MYSIGN_MAIL_USER}>`,
    to,
    subject,
    html: `
      <html>
      <head>
        <title>eSign</title>
        <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
      </head>
      <body>
        <div style="background-color: #eaeaea; padding: 2%; font-family: Helvetica, Arial, Sans Serif;">
          <table dir="" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
            <tbody>
              <tr>
                <td></td>
                <td width="640">
                  <table style="border-collapse: collapse; background-color: #ffffff; max-width: 640px;">
                    <tbody>
                      <tr>
                        <td style="padding: 25px 24px; height:50px; text-align:center">
                          <img style="border: none; margin-top:30px" src="https://myapp.ausrealty.com.au/img/ausrealtylogo.png" alt="Ausrealty eSign" width="130" />
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0px 24px 30px 24px;">
                          <table style="background-color: #fff; color: #000;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
                            <tbody>
                              <tr>
                                <td style="padding: 28px 36px 36px 36px; border-radius: 2px; color: #ffffff; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; width: 100%; text-align: center;">
                                  <img style="width: 75px; height: 75px;" src="https://myapp.ausrealty.com.au/img/document.png" alt="" width="75" height="75" />
                                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
                                    <tbody>
                                      <tr>
                                        <td style="padding-top: 24px; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; border: none; text-align: center; color: #000;" align="center">
                                          ${post.msg}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                    <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
                                      <tbody>
                                        <tr>
                                          <td style="padding-top: 30px;" align="center">
                                            <a style="font-size: 15px; color: #ffffff; background-color: #000000; font-family: Helvetica, Arial, Sans Serif; font-weight: bold; text-align: center; text-decoration: none; border-radius: 2px; display: inline-block;" href="${post.link}" target="_blank" rel="noopener">
                                              <span style="padding: 0px 24px; line-height: 44px;">${post.title}</span>
                                            </a>
                                          </td>
                                        </tr>                                  
                                      </tbody>
                                    </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0px 24px 24px 24px; color: #000000; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; background-color: white; text-align: center;">
                          <table role="presentation" cellspacing="0" cellpadding="0" style="text-align: center; width: 100%;">
                            <tbody>
                              <tr>
                                <td style="padding-bottom: 20px; text-align: center;">
                                  <div style="font-family: Helvetica, Arial, Sans Serif; font-weight: bold; line-height: 18px; font-size: 15px; color: #333333;">${agent}</div>
                                  <div style="font-family: Helvetica, Arial, Sans Serif; line-height: 18px; font-size: 15px; color: #666666;">
                                    <a href="mailto:${agentEmail}" target="_blank" rel="noopener">${agentEmail}</a>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 30px 24px 45px 24px; background-color: #fff;">
                          <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;"><strong role="heading" aria-level="3">Do Not Share This Email</strong><br /> This email contains a secure link to Ausrealty eSign. Please do not share this email and link with others.</p>
                          <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;"><strong role="heading" aria-level="3">Questions about the Document?</strong><br /> If you need to modify the document or have questions about the details in the document, please reach out to the sender by emailing them directly.</p>
                          <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 10px; color: #666666; line-height: 14px;">This message was sent to you by ${agent} who is using the Ausrealty eSign Electronic Signature Service. If you would rather not receive email from this sender, you may contact the sender with your request.</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};
module.exports = sendEmail;