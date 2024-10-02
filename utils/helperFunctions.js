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

module.exports = { formatCurrency, formatDateToAEDT };
