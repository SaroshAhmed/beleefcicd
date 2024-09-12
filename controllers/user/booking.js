const { google } = require("googleapis");
const Booking = require("../../models/Booking");
const calendar = google.calendar("v3");
const { sendEmail } = require("../../utils/emailService");
const { sendSms } = require("../../utils/smsService");
const { v4: uuidv4 } = require("uuid");
const { REACT_APP_FRONTEND_URL } = require("../../config");

const path = require("path");

// // Initialize the Google API client with the service account for sending emails as keyevents@ausrealty.com.au
const initializeServiceAccountClient = () => {
  const client = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "../../appausrealty-4f25138edcaf.json"), // Path to your service account JSON file
    scopes: ["https://www.googleapis.com/auth/calendar"], // Google Calendar scope
    clientOptions: {
      subject: "keyevents@ausrealty.com.au", // Impersonate keyevents@ausrealty.com.au
    },
  });

  return client;
};

exports.createBooking = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/auth/google");
  }

  // Use the authenticated user's OAuth2 credentials for event creation/checking
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: req.user.accessToken, // Using logged-in user's access token
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // Use the service account for sending invitations as keyevents@ausrealty.com.au
  const serviceAccountClient = initializeServiceAccountClient();
  const serviceOauth2Client = await serviceAccountClient.getClient(); // Get the authenticated client

  // Create a unique identifier for the property (could also be a slug or hash)
  const uniqueId = uuidv4();

  const nameArray = req.user.name.toString().split(" ");
  const firstName = nameArray[0];
  const lastName = nameArray.length > 1 ? nameArray[1] : "";

  const { vendors, startTime, endTime, address } = req.body;

  const agent = {
    firstName,
    lastName,
    email: req.user.email,
    mobile: "61415778969", // This seems hardcoded; change if necessary
  };

  const name = "Book Appraisal";
  const prelistLink = `${REACT_APP_FRONTEND_URL}/prelist/${uniqueId}`;

  try {
    // Check for existing events in the given time slot using the logged-in user's credentials
    const { data } = await calendar.events.list({
      calendarId: "primary",
      timeMin: startTime,
      timeMax: endTime,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = data.items;

    if (events.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Time slot is already booked.",
      });
    }

    // Create a new event in Google Calendar using the logged-in user's calendar
    const event = {
      summary: address,
      description: `Appreciate your time, looking forward to meeting you.

Further details in preparation for our meeting; ${prelistLink}. 
      
Regards,
${agent.firstName} ${agent.lastName}
      `,
      start: { dateTime: startTime, timeZone: "Australia/Sydney" },
      end: { dateTime: endTime, timeZone: "Australia/Sydney" },
      attendees: [
        {
          email: agent.email, // Agent email
          displayName: `${agent.firstName} ${agent.lastName}`, // Agent name
        },
        ...vendors.map((vendor) => ({
          email: vendor.email,
          displayName: `${vendor.firstName} ${vendor.lastName}`,
        })),
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // Send email reminder 1 day before
          { method: "email", minutes: 5 }, // Send email reminder 5 minutes before
          { method: "popup", minutes: 10 }, // Show popup reminder 10 minutes before
        ],
      },
      sendUpdates: "all", // This ensures the invitation email is sent
    };

    // Insert the event using the service account to ensure keyevents@ausrealty.com.au is the sender
    const eventResponse = await calendar.events.insert({
      auth: serviceOauth2Client, // Use the service account for sending invites
      calendarId: "primary",
      resource: event,
      sendUpdates: "all", // Send email invitations to all attendees
    });

    // Extract the Google event ID
    const googleEventId = eventResponse.data.id;

    // Save the booking in MongoDB with the Google event ID
    const booking = new Booking({
      userId: req.user.id,
      name,
      address,
      vendors,
      agent,
      startTime,
      endTime,
      googleEventId, // Save the Google event ID
      prelistLink,
      status: "Active",
    });

    await booking.save();

    try {
      // Sending SMS to each vendor
      const smsPromises = vendors.map((vendor) => {
        const recipient = {
          firstName: vendor.firstName,
          lastName: vendor.lastName,
          mobile: vendor.mobile, // Assuming mobile number is in vendor object
        };
  
        return sendSms("create", recipient, agent, startTime, prelistLink, address)
          .then(() => {
            // console.log(`SMS sent successfully to ${vendor.mobile}`);
          })
          .catch((err) => {
            console.error(`Error sending SMS to ${vendor.mobile}`, err);
          });
      });
  
      // Await all SMS sends
      await Promise.all(smsPromises);
  
      // Sending SMS to the agent/sender
      await sendSms("create", agent, agent, startTime, prelistLink, address);

    } catch (err) {
      console.error("Error during booking creation or SMS sending", err);
      res.status(500).json({ error: err.message });
    }

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
