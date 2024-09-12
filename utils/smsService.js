const axios = require("axios");
const moment = require("moment");

// Function to send SMS
const sendSms = async (event, recipient, sender, date, link, property_addr) => {
  const smsTemplate = getSmsTemplate(
    event,
    recipient,
    sender,
    date,
    link,
    property_addr
  );

  const url = `https://mc5.smartmessagingservices.net/services/rest/message/sendSingle2`;
  const params = {
    username: process.env.SMS_USERNAME,
    password: process.env.SMS_PASSWORD,
    text: smsTemplate,
    recipient: recipient.mobile,
    sender: sender.mobile,
  };

  try {
    console.log(url)
    const response = await axios.post(url, null, { params });
    console.log(`SMS sent successfully: ${response.data}`);
    return response.data;
  } catch (error) {
    console.error(`Error sending SMS to ${recipient.mobile}: ${error.message}`);
    throw error;
  }
};

// Function to get SMS template based on event type
const getSmsTemplate = (
  event,
  recipient,
  sender,
  date,
  link,
  property_addr
) => {
  const formattedDate = moment(date).format("dddd, Do MMMM [at] h:mm A");
  // Example HTML anchor tag for the link
  const formattedLink = link; // Just the link in plain text

  let msg;

  switch (event) {
    case "cancel":
      msg = `Hi ${recipient.firstName} ${recipient.lastName}, our meeting on ${formattedDate} for the property ${property_addr} has been cancelled. Thank you.\nRegards \n${sender.firstName} ${sender.lastName}`;
      break;

    case "update":
      msg = `Hi ${recipient.firstName}, your meeting has been updated to ${formattedDate} for the property ${property_addr}. \nFurther details can be found here: ${formattedLink} \n${sender.firstName} ${sender.lastName}`;
      break;

    case "reminder":
      msg = `Hi ${recipient.firstName}, this is a reminder for your meeting on ${formattedDate} for the property at ${property_addr}. \nFurther details can be found here: ${formattedLink}. \nRegards, ${sender.firstName} ${sender.lastName}`;
      break;

    case "create":
      msg = `Hi ${recipient.firstName} ${recipient.lastName}, appreciate your time, looking forward to meeting you on ${formattedDate} for the property at ${property_addr}. \nFurther details can be found here: ${formattedLink} \nRegards, ${sender.firstName} ${sender.lastName}`;
      break;

    default:
      msg = `Hi ${recipient.firstName}, appreciate your time, looking forward to meeting you on ${formattedDate} for the property at ${property_addr}. \nFurther details can be found here: ${formattedLink} \nRegards, ${sender.firstName} ${sender.lastName}`;
      break;
  }

  return msg;
};

module.exports = { sendSms };
