const axios = require("axios");
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();

const formatCurrency = (value) => {
  if (value === undefined || value === null) return "N/A";
  return "$" + new Intl.NumberFormat().format(value);
};

function formatDateToAEDT(date) {
  // If date is invalid or null, use current date and time
  const dateObj = date ? new Date(date) : new Date();

  // Options for date formatting
  const dateOptions = {
    timeZone: "Australia/Sydney",
    day: "2-digit",
    month: "short",
    year: "numeric",
  };

  const timeOptions = {
    timeZone: "Australia/Sydney",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZoneName: "short",
  };

  const dateFormatter = new Intl.DateTimeFormat("en-AU", dateOptions);
  const timeFormatter = new Intl.DateTimeFormat("en-AU", timeOptions);

  // Format date and time separately
  const formattedDate = dateFormatter.format(dateObj); // e.g., "17 Jun 2024"
  const formattedTimeWithZone = timeFormatter.format(dateObj); // e.g., "2:15 pm AEDT"

  // Extract time and timezone abbreviation
  const timeWithZoneParts = formattedTimeWithZone.split(" ");
  const time = timeWithZoneParts[0] + timeWithZoneParts[1].toLowerCase(); // "2:15pm"
  const timeZoneAbbreviation = timeWithZoneParts[2]; // "AEDT" or "AEST"

  // Split date into components
  const dateParts = formattedDate.split(" "); // ["17", "Jun", "2024"]
  const day = dateParts[0];
  const month = dateParts[1];
  const year = dateParts[2];

  // Construct the final formatted date
  const finalFormattedDate = `${day}/${month}/${year} ${time}(${timeZoneAbbreviation})`;

  return finalFormattedDate;
}

const getVendorSignatureUrl = async (signatureUrl) => {
  try {

    const urlObj = new URL(signatureUrl);
    // Remove the leading '/' from pathname to get the Key
    const key = urlObj.pathname.startsWith("/")
      ? urlObj.pathname.substring(1)
      : urlObj.pathname;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: 300, // URL expires in 5 minutes
    };

    // Generate signed URL to access the S3 object
    const signedUrl = s3.getSignedUrl("getObject", params);

    // Fetch the image from S3 using the signed URL
    const response = await axios.get(signedUrl, { responseType: 'arraybuffer' });

    // Convert the image buffer to base64
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');

    // Return the base64 image in a data URL format
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error("Error generating base64 from signature URL:", error);
    throw new Error("Could not generate base64 image");
  }
};

module.exports = { formatCurrency, formatDateToAEDT,getVendorSignatureUrl };