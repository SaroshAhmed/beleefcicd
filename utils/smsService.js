const axios = require("axios");

// Function to send SMS
const sendSms = async (
  event,
  recipient,
  sender,
  date,
  link,
  property_addr
) => {
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
    recipient: recipient,
    sender
  };

  try {
    const response = await axios.post(url, null, { params });
    console.log(`SMS sent: ${response.data}`);
    return response.data;
  } catch (error) {
    console.error(`Error sending SMS: ${error.message}`);
    throw error;
  }
};

// Function to get SMS template based on event type
const getSmsTemplate = (event, recipient, sender, date, link, property_addr) => {
  let msg;

  switch (event) {
    case "cancel":
      msg = `Hi ${recipient}, our meeting on ${date} for the property ${property_addr} has been cancelled. Thank you.\nRegards \n${sender}`;
      break;

    case "update":
      msg = `Hi ${recipient}, your meeting has been updated to ${date} for the property ${property_addr}. Further details can be found here: ${link} \n${sender}`;
      break;

    case "reminder":
      msg = `Hi ${recipient}, this is a reminder for your meeting on ${date} for the property at ${property_addr}. Further details can be found here: ${link}. \nRegards, ${sender}`;
      break;

    case "create":
      msg = `Hi ${recipient}, appreciate your time, looking forward to ${event.msgType} ${date} for the property ${property_addr}. Further details can be found here: ${link} \n${sender}`;
      break;

    default:
      msg = `Hi ${recipient}, appreciate your time, looking forward to ${event.msgType} ${date} for the property ${property_addr}. Further details can be found here: ${link} \n${sender}`;
      break;
  }

  return msg;
};

module.exports = { sendSms };
