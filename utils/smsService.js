const axios = require("axios");
const moment = require("moment");


// Function to normalize mobile numbers to the format accepted by Intelli SMS
const normalizeMobileNumber = (mobile) => {
  // Remove spaces or any non-numeric characters for consistency
  let cleanedMobile = mobile.replace(/\D/g, '');

  // Check if the mobile number starts with '61' (Australian country code)
  if (cleanedMobile.startsWith("61")) {
    return cleanedMobile; // Already in the correct format
  }

  // If the mobile starts with '0', remove it and prepend '61'
  if (cleanedMobile.startsWith("0")) {
    cleanedMobile = "61" + cleanedMobile.substring(1);
  } else {
    // If the number doesn't start with '0' or '61', just prepend '61'
    cleanedMobile = "61" + cleanedMobile;
  }

  return cleanedMobile;
};

// Function to send SMS
const sendSms = async (event, recipient, sender, date, link, property_addr) => {
  const smsTemplate = getSmsTemplate(
    event,
    recipient,
    sender,
    moment(date).tz('Australia/Sydney').format("dddd, Do MMMM [at] h:mm A"),
    link,
    property_addr
  );

  const url = `https://mc5.smartmessagingservices.net/services/rest/message/sendSingle2`;
  const params = {
    username: process.env.SMS_USERNAME,
    password: process.env.SMS_PASSWORD,
    text: smsTemplate,
    recipient: normalizeMobileNumber(recipient.mobile),
    sender: normalizeMobileNumber(sender.mobile),
  };

  try {
    const response = await axios.post(url, null, { params });
    console.log(`SMS sent successfully: ${recipient.mobile}`);
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
  // Example HTML anchor tag for the link
  const formattedLink = link; // Just the link in plain text

  let msg;

  switch (event) {
    case "authSchedule":
      msg = `${sender.firstName} ${sender.lastName} has sent you a document to review and sign for the property ${property_addr}.\n Document Link ${formattedLink} \n Thank you.\nRegards, \n${sender.firstName} ${sender.lastName}`;
      break;

    case "cancel":
      msg = `Hi ${recipient.firstName} ${recipient.lastName}, our meeting on ${date} for the property ${property_addr} has been cancelled. Thank you.\nRegards, \n${sender.firstName} ${sender.lastName}`;
      break;

    case "update":
      msg = `Hi ${recipient.firstName}, your meeting has been updated to ${date} for the property ${property_addr}. \nFurther details can be found here: ${formattedLink} \n${sender.firstName} ${sender.lastName}`;
      break;

    case "reminder":
      msg = `Hi ${recipient.firstName}, this is a reminder for your meeting on ${date} for the property at ${property_addr}. \nFurther details can be found here: ${formattedLink} \nRegards, \n${sender.firstName} ${sender.lastName}`;
      break;

    case "create":
      msg = `Hi ${recipient.firstName} ${recipient.lastName}, appreciate your time, looking forward to meeting you on ${date} for the property at ${property_addr}. \nFurther details can be found here: ${formattedLink} \nRegards, \n${sender.firstName} ${sender.lastName}`;
      break;

    default:
      msg = `Hi ${recipient.firstName}, appreciate your time, looking forward to meeting you on ${date} for the property at ${property_addr}. \nFurther details can be found here: ${formattedLink} \nRegards, \n${sender.firstName} ${sender.lastName}`;
      break;
  }

  return msg;
};

module.exports = { sendSms };
