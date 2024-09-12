const { google } = require("googleapis");
const Booking = require("../../models/Booking");
const calendar = google.calendar("v3");
const { sendEmail } = require("../../utils/emailService");

exports.createBooking = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/auth/google");
  }

  const nameArray = req.user.name.toString().split(" ");
  const firstName = nameArray[0];
  const lastName = nameArray.length > 1 ? nameArray[1] : "";

  const { vendors, startTime, endTime, address } = req.body;

  const agent = {
    firstName,
    lastName,
    email: req.user.email,
    mobile: "61415778969",
  };

  const name = "Book Appraisal";
  const description = "";

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: req.user.accessToken,
  });

  const calendarId = "primary";

  try {
    // Check for existing events in the given time slot
    const { data } = await calendar.events.list({
      auth: oauth2Client,
      calendarId: calendarId,
      timeMin: startTime,
      timeMax: endTime,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = data.items;

    if (events.length > 0) {
      return res.status(409).json({ message: "Time slot is already booked." });
    }

    // Create a new event in Google Calendar
    const event = {
      summary: "Reserved Time Slot",
      start: { dateTime: startTime, timeZone: "Australia/Sydney" },
      end: { dateTime: endTime, timeZone: "Australia/Sydney" },
      reminders: {
        useDefault: false,
        overrides: [{ method: "popup", minutes: 60 }],
      },
    };

    const eventResponse = await calendar.events.insert({
      auth: oauth2Client,
      calendarId: calendarId,
      resource: event,
    });

    // Extract the Google event ID
    const googleEventId = eventResponse.data.id;

    // Save the booking in MongoDB with the Google event ID
    const booking = new Booking({
      name,
      address,
      vendors,
      agent,
      startTime,
      endTime,
      googleEventId, // Save the Google event ID
      status: "Active",
    });

    await booking.save();

    const recipientEmail = "recipient@example.com";
    const subject = "Meeting Reminder";
    const htmlContent =
      "<h1>Reminder</h1><p>This is a reminder for your upcoming meeting.</p>";

    sendEmail(recipientEmail, subject, htmlContent)
      .then(() => console.log("Email sent successfully"))
      .catch((err) => console.log("Error sending email", err));

    const recipient = "61415778969";
    const date = "seems like event Date";

    sendSms("create", recipient.mobile,sender.mobile, date, link, address)
      .then(() => console.log("SMS sent successfully"))
      .catch((err) => console.log("Error sending SMS", err));

    res
      .status(201)
      .json({ message: "Booking created", event: eventResponse.data, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// reschedule event
exports.rescheduleBooking = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/auth/google");
  }

  const { eventId } = req.params; // This should be the Google event ID
  const { startTime, endTime } = req.body;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: req.user.accessToken,
  });

  try {
    // Reschedule the event in Google Calendar
    const eventResponse = await calendar.events.patch({
      auth: oauth2Client,
      calendarId: "primary",
      eventId,
      resource: {
        start: { dateTime: startTime, timeZone: "Australia/Sydney" },
        end: { dateTime: endTime, timeZone: "Australia/Sydney" },
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: 60 }],
        },
      },
    });

    // Update the booking in MongoDB
    const booking = await Booking.findOneAndUpdate(
      { googleEventId: eventId }, // Use the Google event ID for the lookup
      { startTime, endTime },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      message: "Booking rescheduled",
      event: eventResponse.data,
      booking,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel Booking
exports.cancelBooking = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/auth/google");
  }

  const { eventId } = req.params; // This should be the Google event ID

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: req.user.accessToken,
  });

  try {
    // Delete the event in Google Calendar
    await calendar.events.delete({
      auth: oauth2Client,
      calendarId: "primary",
      eventId,
    });

    // Update the booking status in MongoDB
    const booking = await Booking.findOneAndUpdate(
      { googleEventId: eventId }, // Use the Google event ID for the lookup
      { status: "Cancelled" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking canceled", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//will come from db
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId });

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }

    res.status(200).json({ bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
