const { google } = require("googleapis");
const Booking = require("../../models/Booking");
const calendar = google.calendar("v3");
const { sendEmail } = require("../../utils/emailService");
const { sendSms } = require("../../utils/smsService");
const { v4: uuidv4 } = require("uuid");
const { REACT_APP_FRONTEND_URL } = require("../../config");
const moment = require("moment-timezone");

// // Initialize the Google API client with the service account for sending emails as keyevents@ausrealty.com.au
// const initializeServiceAccountClient = () => {
//   const client = new google.auth.GoogleAuth({
//     keyFile: path.join(__dirname, "../../appausrealty-4f25138edcaf.json"), // Path to your service account JSON file
//     scopes: ["https://www.googleapis.com/auth/calendar"], // Google Calendar scope
//     clientOptions: {
//       subject: "keyevents@ausrealty.com.au", // Impersonate keyevents@ausrealty.com.au
//     },
//   });

//   return client;
// };
const privateKey = Buffer.from(
  process.env.EVENT_GOOGLE_PRIVATE_KEY,
  "base64"
).toString("utf8");

const initializeServiceAccountClient = () => {
  const client = new google.auth.GoogleAuth({
    credentials: {
      type: "service_account",
      project_id: process.env.EVENT_GOOGLE_PROJECT_ID,
      private_key_id: process.env.EVENT_GOOGLE_PRIVATE_KEY_ID,
      // private_key: process.env.EVENT_GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      private_key: privateKey.replace(/\\n/g, "\n"),
      client_email: process.env.EVENT_GOOGLE_CLIENT_EMAIL,
      client_id: process.env.EVENT_GOOGLE_CLIENT_ID,
      auth_uri: process.env.EVENT_GOOGLE_AUTH_URI,
      token_uri: process.env.EVENT_GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.EVENT_GOOGLE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.EVENT_GOOGLE_CLIENT_CERT_URL,
    },
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

  const { vendors, startTime, endTime, address, property } = req.body;

  const agent = {
    firstName,
    lastName,
    email: req.user.email,
    mobile: req.user.mobile,
    image: req.user.picture,
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

    // if (events.length > 0) {
    //   return res.status(409).json({
    //     success: false,
    //     message: "Time slot is already booked.",
    //     data:events
    //   });
    // }

    // Filter vendors to only include those with a valid email
    const validVendorAttendees = vendors
      .filter((vendor) => vendor.email) // Remove vendors without an email
      .map((vendor) => ({
        email: vendor.email,
        displayName: `${vendor.firstName} ${vendor.lastName}`,
      }));

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
        ...validVendorAttendees, // Only vendors with valid emails are added
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
      prelistId: uniqueId,
      prelistLink,
      status: "Active",
      property,
    });

    await booking.save();

    try {
      // Sending SMS to the agent/sender
      await sendSms("create", agent, agent, startTime, prelistLink, address);

      // Sending SMS to each vendor
      const smsPromises = vendors.map((vendor) => {
        const recipient = {
          firstName: vendor.firstName,
          lastName: vendor.lastName,
          mobile: vendor.mobile, // Assuming mobile number is in vendor object
        };

        return sendSms(
          "create",
          recipient,
          agent,
          startTime,
          prelistLink,
          address
        )
          .then(() => {
            // console.log(`SMS sent successfully to ${vendor.mobile}`);
          })
          .catch((error) => {
            console.error(`Error sending SMS to ${vendor.mobile}`, error);
          });
      });

      // Await all SMS sends
      await Promise.all(smsPromises);
    } catch (error) {
      console.error("Error during booking creation or SMS sending", error);
      res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.rescheduleBooking = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/auth/google");
  }
  const { id } = req.params;
  const { newStartTime, newEndTime } = req.body;
  const bookingId = id;
  try {
    // Find the existing booking by its ID
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const { googleEventId, vendors, address, agent } = booking;

    // Use the authenticated user's OAuth2 credentials for event rescheduling
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: req.user.accessToken, // Using logged-in user's access token
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Use the service account for sending invitations as keyevents@ausrealty.com.au
    const serviceAccountClient = initializeServiceAccountClient();
    const serviceOauth2Client = await serviceAccountClient.getClient(); // Get the authenticated client

    const validVendorAttendees = vendors
    .filter((vendor) => vendor.email) // Remove vendors without an email
    .map((vendor) => ({
      email: vendor.email,
      displayName: `${vendor.firstName} ${vendor.lastName}`,
    }));

    // Update the existing event in Google Calendar
    const updatedEvent = {
      start: { dateTime: newStartTime, timeZone: "Australia/Sydney" },
      end: { dateTime: newEndTime, timeZone: "Australia/Sydney" },
      attendees: [
        {
          email: agent.email, // Agent email
          displayName: `${agent.firstName} ${agent.lastName}`, // Agent name
        },
        ...validVendorAttendees
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // Send email reminder 1 day before
          { method: "email", minutes: 5 }, // Send email reminder 5 minutes before
          { method: "popup", minutes: 10 }, // Show popup reminder 10 minutes before
        ],
      },
      sendUpdates: "all", // Ensure attendees receive an update notification
    };

    const eventResponse = await calendar.events.patch({
      auth: serviceOauth2Client, // Use the service account for rescheduling
      calendarId: "primary",
      eventId: googleEventId, // Use the event ID stored in MongoDB
      resource: updatedEvent,
      sendUpdates: "all", // Notify all attendees of the rescheduling
    });

    // Update the booking in MongoDB with the new startTime and endTime
    booking.startTime = newStartTime;
    booking.endTime = newEndTime;
    await booking.save();

    // Notify vendors and agent via SMS about the rescheduled event
    try {
      // Sending SMS to each vendor about the updated meeting time
      const smsPromises = vendors.map((vendor) => {
        const recipient = {
          firstName: vendor.firstName,
          lastName: vendor.lastName,
          mobile: vendor.mobile, // Assuming mobile number is in vendor object
        };

        return sendSms(
          "update",
          recipient,
          agent,
          newStartTime,
          booking.prelistLink,
          address
        )
          .then(() => {})
          .catch((error) => {
            console.error(`Error sending SMS to ${vendor.mobile}`, error);
          });
      });

      // Await all SMS sends
      await Promise.all(smsPromises);

      // Sending SMS to the agent/sender
      await sendSms(
        "update",
        agent,
        agent,
        newStartTime,
        booking.prelistLink,
        address
      );
    } catch (error) {
      console.error("Error during booking rescheduling or SMS sending", error);
      res.status(500).json({ success: false, message: error.message });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/auth/google");
  }

  const { id } = req.params; // Booking ID to cancel

  try {
    // Find the existing booking by its ID
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const { googleEventId, vendors, agent, address, startTime } = booking;

    // Use the authenticated user's OAuth2 credentials for deleting the event
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: req.user.accessToken, // Using logged-in user's access token
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Use the service account for sending cancellations as keyevents@ausrealty.com.au
    const serviceAccountClient = initializeServiceAccountClient();
    const serviceOauth2Client = await serviceAccountClient.getClient(); // Get the authenticated client

    // Cancel the event in Google Calendar
    try {
      await calendar.events.delete({
        auth: serviceOauth2Client, // Use the service account for cancellation
        calendarId: "primary",
        eventId: googleEventId, // Use the event ID stored in MongoDB
        sendUpdates: "all", // Notify all attendees about the cancellation
      });
    } catch (error) {
      console.error("Error deleting Google Calendar event:", error);
      res.status(500).json({ success: false, message: error.message });
    }

    // Update the booking status to "Cancelled" in MongoDB
    booking.status = "Cancelled";
    await booking.save();

    // Notify vendors and agent via SMS about the cancellation
    try {
      const smsPromises = vendors.map((vendor) => {
        const recipient = {
          firstName: vendor.firstName,
          lastName: vendor.lastName,
          mobile: vendor.mobile, // Assuming mobile number is in vendor object
        };

        return sendSms(
          "cancel",
          recipient,
          agent,
          startTime,
          booking.prelistLink,
          address
        )
          .then(() => {})
          .catch((error) => {
            console.error(`Error sending SMS to ${vendor.mobile}`, error);
          });
      });

      // Await all SMS sends
      await Promise.all(smsPromises);

      // Sending SMS to the agent/sender
      await sendSms(
        "cancel",
        agent,
        agent,
        startTime,
        booking.prelistLink,
        address
      );
    } catch (error) {
      console.error("Error during booking cancellation or SMS sending", error);
      res.status(500).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: error.message });
  }
};

//will come from db
exports.getAllBookings = async (req, res) => {
  try {
    const { id } = req.user;

    const bookings = await Booking.find({
      userId: id,
      status: { $ne: "Cancelled" },
    });

    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controller to get booking by prelistId
exports.getBookingByPrelistId = async (req, res) => {
  try {
    const { prelistId } = req.params;

    // **Atomic increment using $inc**
    const booking = await Booking.findOneAndUpdate(
      { prelistId },
      { $inc: { prelistViewCount: 1 } },
      { new: true }
    );

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// Controller to get bookings by address
exports.getBookingsByAddress = async (req, res) => {
  try {
    const { id } = req.user;
    const { address } = req.params;

    const bookings = await Booking.find({
      userId: id,
      address,
      status: { $ne: "Cancelled" },
    });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
