const AuthSchedule = require("../../models/AuthSchedule");
const mongoose = require("mongoose");
const connectToDatabase = require("../../config/serviceDB");
const { google } = require("googleapis");
const Booking = require("../../models/Booking");
const calendar = google.calendar("v3");
const { sendEmail } = require("../../utils/emailService");
const { sendSms } = require("../../utils/smsService");
const { v4: uuidv4 } = require("uuid");
const { REACT_APP_FRONTEND_URL } = require("../../config");

const { addDays, subDays, setHours, startOfDay } = require("date-fns");
const moment = require("moment-timezone");

// Timezone for Sydney
const SYDNEY_TZ = "Australia/Sydney";

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

// Helper function to get the next working day, skipping weekends
const addWorkingDays = (startDate, daysToAdd) => {
  let date = startDate.clone(); // Clone the start date to avoid mutating the original
  while (daysToAdd > 0) {
    date.add(1, "day"); // Add one day
    // If the day is a weekday (Monday to Friday), subtract from daysToAdd
    if (date.day() !== 0 && date.day() !== 6) {
      // 0 = Sunday, 6 = Saturday
      daysToAdd -= 1;
    }
  }
  return date;
};

// Utility function to get the next available weekday (Monday - Friday)
const getNextWeekday = (date) => {
  while (date.day() === 0 || date.day() === 6) {
    // Skip Sunday (0) and Saturday (6)
    date.add(1, "day");
  }
  return date;
};

// Utility function to get the next Saturday
const getNextSaturday = (date) => {
  return date.clone().day(6);
};

// Utility function to get the next Wednesday
const getNextWednesday = (date) => {
  return date.clone().day(3);
};

const eventDurations = {
  "Melo Photography - Photography 10 Images": 1.5,
  "Melo Photography - Photography 20 Images": 3,
  "Melo Photography - Photography 7 Images": 1,
  "Melo Photography - Photography 5 Images": 1,
  "Melo Photography - Dusk Photography": 0.5,
  "Melo Photography - Drone Shots": 0.5,
  "Melo - Property Video": 1.5,
  "Melo - Storytelling Videos": 2,
  "Melo - Large Floor Plan": 2,
  "Melo - Medium Floor Plan": 1,
  "Melo - Small Floor Plan": 0.75,
};

// Function to get the selected item from a category
const getSelectedItem = (categoryName, categories) => {
  const category = categories.find((cat) => cat.category === categoryName);
  if (!category) return [];

  // Ensure isChecked is evaluated as a boolean
  const selectedItems = category.items.filter(
    (item) => item.isChecked && !/Virtual|Redraw/i.test(item.name)
  );

  console.log(selectedItems); // Log the filtered selected items
  return selectedItems;
};

// const getContractors = async (calculatedEvents) => {
//   const db = await connectToDatabase();
//   const contractorsCollection = db.collection("contractors");
//   const contractors = await contractorsCollection.find({}).toArray();
//   const contractorBookingsCollection = db.collection("contractorbookings");
//   const contractorBookings = await contractorBookingsCollection
//     .find({})
//     .toArray();

//   // Filter the calculatedEvents to include only those with relevant keywords in summary
//   const filteredEvents = calculatedEvents.filter((event) => {
//     const summaryLowercase = event.summary.toLowerCase();
//     return (
//       summaryLowercase.includes("photography") ||
//       summaryLowercase.includes("video") ||
//       summaryLowercase.includes("floor plan")
//     );
//   });

//   console.log("Filtered Events:", filteredEvents.length, filteredEvents);

//   filteredEvents.forEach((event) => {
//     // Convert event start and end times to Sydney timezone
//     const eventStartTime = moment(event.start).tz(SYDNEY_TZ);
//     const eventEndTime = moment(event.end).tz(SYDNEY_TZ);

//     contractors.forEach((contractor) => {
//       const { availability, services, name, _id } = contractor;
//       const eventDate = eventStartTime.format("ddd").toUpperCase();
//       console.log(eventDate);

//       // Check if contractor is available on the event day
//       const contractorDayAvailability = availability[eventDate];
//       console.log(contractorDayAvailability);

//       if (contractorDayAvailability && contractorDayAvailability.available) {
//         const contractorStartTime = eventStartTime.clone().set({
//           hour: parseInt(contractorDayAvailability.startTime.split(":")[0]),
//           minute: parseInt(contractorDayAvailability.startTime.split(":")[1]),
//           second: 0,
//           millisecond: 0,
//         });

//         const contractorEndTime = eventStartTime.clone().set({
//           hour: parseInt(contractorDayAvailability.endTime.split(":")[0]),
//           minute: parseInt(contractorDayAvailability.endTime.split(":")[1]),
//           second: 0,
//           millisecond: 0,
//         });

//         // Check if the event is within the contractor's available hours
//         const isContractorAvailable =
//           eventStartTime.isBetween(
//             contractorStartTime,
//             contractorEndTime,
//             null,
//             "[]"
//           ) &&
//           eventEndTime.isBetween(
//             contractorStartTime,
//             contractorEndTime,
//             null,
//             "[]"
//           );
//         // Check if contractor provides the required service for the event (photo, video, or floor plan)
//         console.log(isContractorAvailable);

//         const isPhotoEvent =
//           event.summary.toLowerCase().includes("photography") ||
//           event.summary.toLowerCase().includes("photo");
//         const isVideoEvent = event.summary.toLowerCase().includes("video");
//         const isFloorPlanEvent = event.summary
//           .toLowerCase()
//           .includes("floor plan");

//         const includesPhotographerAndVideographer = services.includes(
//           "Photographer and Videographer"
//         );
//         const includesFloorPlanner = services.includes("Floor planner");

//         if (
//           isContractorAvailable &&
//           ((isPhotoEvent && includesPhotographerAndVideographer) ||
//             (isVideoEvent && includesPhotographerAndVideographer) ||
//             (isFloorPlanEvent && includesFloorPlanner))
//         ) {
//           // Check if there are any conflicting bookings for the contractor
//           const conflictingBooking = contractorBookings.some((booking) => {
//             const bookingStartTime = moment(booking.startTime).tz(SYDNEY_TZ);
//             const bookingEndTime = moment(booking.endTime).tz(SYDNEY_TZ);

//             return (
//               booking.contractorId.toString() === _id.toString() && // Booking belongs to the same contractor
//               (bookingStartTime.isBetween(
//                 eventStartTime,
//                 eventEndTime,
//                 null,
//                 "[)"
//               ) ||
//                 bookingEndTime.isBetween(
//                   eventStartTime,
//                   eventEndTime,
//                   null,
//                   "(]"
//                 ) ||
//                 eventStartTime.isBetween(
//                   bookingStartTime,
//                   bookingEndTime,
//                   null,
//                   "[)"
//                 ) ||
//                 eventEndTime.isBetween(
//                   bookingStartTime,
//                   bookingEndTime,
//                   null,
//                   "(]"
//                 ))
//             );
//           });

//           // If no conflicting bookings, contractor is available for the event
//           if (!conflictingBooking) {
//             console.log(
//               `Contractor available for ${event.summary} on ${event.start}: ${name}`
//             );
//           } else {
//             console.log(
//               `Contractor ${name} is not available for ${event.summary} due to a conflicting booking.`
//             );
//           }
//         }
//       }
//     });
//   });
// };

const getContractors = async (calculatedEvents) => {
  const db = await connectToDatabase();
  const contractorsCollection = db.collection("contractors");
  const contractors = await contractorsCollection.find({}).toArray();
  const contractorBookingsCollection = db.collection("contractorbookings");
  const contractorBookings = await contractorBookingsCollection
    .find({})
    .toArray();

  // Filter the calculatedEvents to include only those with relevant keywords in summary
  const filteredEvents = calculatedEvents.filter((event) => {
    const summaryLowercase = event.summary.toLowerCase();
    return (
      summaryLowercase.includes("photography") ||
      summaryLowercase.includes("video") ||
      summaryLowercase.includes("floor plan")
    );
  });

  // Create a map to store available contractors for each event
  const eventContractors = new Map();

  filteredEvents.forEach((event) => {
    const eventStartTime = moment(event.start).tz(SYDNEY_TZ);
    const eventEndTime = moment(event.end).tz(SYDNEY_TZ);

    contractors.forEach((contractor) => {
      const { availability, services, name, _id, mobile, email, picture } =
        contractor;
      const eventDate = eventStartTime.format("ddd").toUpperCase();

      const contractorDayAvailability = availability[eventDate];

      if (contractorDayAvailability && contractorDayAvailability.available) {
        const contractorStartTime = eventStartTime.clone().set({
          hour: parseInt(contractorDayAvailability.startTime.split(":")[0]),
          minute: parseInt(contractorDayAvailability.startTime.split(":")[1]),
          second: 0,
          millisecond: 0,
        });

        const contractorEndTime = eventStartTime.clone().set({
          hour: parseInt(contractorDayAvailability.endTime.split(":")[0]),
          minute: parseInt(contractorDayAvailability.endTime.split(":")[1]),
          second: 0,
          millisecond: 0,
        });

        const isContractorAvailable =
          eventStartTime.isBetween(
            contractorStartTime,
            contractorEndTime,
            null,
            "[]"
          ) &&
          eventEndTime.isBetween(
            contractorStartTime,
            contractorEndTime,
            null,
            "[]"
          );

        const isPhotoEvent =
          event.summary.toLowerCase().includes("photography") ||
          event.summary.toLowerCase().includes("photo");
        const isVideoEvent = event.summary.toLowerCase().includes("video");
        const isFloorPlanEvent = event.summary
          .toLowerCase()
          .includes("floor plan");

        const includesPhotographerAndVideographer = services.includes(
          "Photographer and Videographer"
        );
        const includesFloorPlanner = services.includes("Floor planner");

        if (
          isContractorAvailable &&
          ((isPhotoEvent && includesPhotographerAndVideographer) ||
            (isVideoEvent && includesPhotographerAndVideographer) ||
            (isFloorPlanEvent && includesFloorPlanner))
        ) {
          const conflictingBooking = contractorBookings.some((booking) => {
            const bookingStartTime = moment(booking.startTime).tz(SYDNEY_TZ);
            const bookingEndTime = moment(booking.endTime).tz(SYDNEY_TZ);

            return (
              booking.contractorId.toString() === _id.toString() &&
              (bookingStartTime.isBetween(
                eventStartTime,
                eventEndTime,
                null,
                "[)"
              ) ||
                bookingEndTime.isBetween(
                  eventStartTime,
                  eventEndTime,
                  null,
                  "(]"
                ) ||
                eventStartTime.isBetween(
                  bookingStartTime,
                  bookingEndTime,
                  null,
                  "[)"
                ) ||
                eventEndTime.isBetween(
                  bookingStartTime,
                  bookingEndTime,
                  null,
                  "(]"
                ))
            );
          });

          console.log(event.summary, conflictingBooking);

          if (!conflictingBooking) {
            // Store contractor information for this event
            const contractorInfo = {
              id: _id,
              name,
              mobile,
              email,
              picture,
            };
            eventContractors.set(event.start, contractorInfo);
          }
        }
      }
    });
  });

  // Update the original events array with contractor information
  calculatedEvents.forEach((event) => {
    const contractor = eventContractors.get(event.start);
    console.log(contractor);
    if (contractor) {
      event.contractor = contractor;
    }
  });

  return calculatedEvents;
};

exports.calculateEvents = async (req, res) => {
  try {
    const { prepareMarketing, conclusionDate, marketing, saleProcess } =
      req.body;
    if (prepareMarketing == "Off market") {
      return res.status(200).json({ success: true, data: [] });
    }

    // Get selected items for Photos, Floorplans, and Video
    const selectedVideo = getSelectedItem("Video", marketing.categories);
    const selectedFloorplan = getSelectedItem(
      "Floorplans",
      marketing.categories
    );

    // Function to convert "X weeks" to days
    const weeksToDays = (weeks) => parseFloat(weeks) * 7;

    // Calculate the marketing start date based on prepareMarketing value
    const getMarketingStartDate = () => {
      const nowInSydney = moment.tz(SYDNEY_TZ);

      if (prepareMarketing === "ASAP") {
        return nowInSydney.add(1, "day"); // Start tomorrow
      } else {
        const weeks = parseFloat(prepareMarketing.split(" ")[0]);
        return nowInSydney.add(weeksToDays(weeks), "days");
      }
    };

    const marketingStartDate = getMarketingStartDate();

    const createEventInSydneyTime = (
      summary,
      eventDate,
      startHour,
      durationHours = null // Set default to null for flexibility
    ) => {
      const hours = Math.floor(startHour);
      const minutes = (startHour - hours) * 60;

      const eventStartSydney = eventDate
        .clone()
        .set("hour", hours)
        .set("minute", minutes)
        .set("second", 0)
        .set("millisecond", 0);

      // Calculate the end time only if durationHours is provided
      let eventEndSydney = null;
      if (durationHours !== null) {
        eventEndSydney = eventStartSydney
          .clone()
          .add(durationHours * 60, "minutes");
      }

      return {
        summary,
        start: eventStartSydney.toISOString(),
        end: eventEndSydney ? eventEndSydney.toISOString() : null, // Return null if no end time
      };
    };

    // Function to map events in Sydney timezone
    const calculateEventDates = (marketingStartDate) => {
      const events = [];

      // Push "Notify off market buyers" event
      events.push({
        summary: "Notify off market buyers",
        start: marketingStartDate.toISOString(),
        end: null,
      });

      let currentDate = marketingStartDate.clone();
      let currentHour = 9;
      let lastMediaDate = null; //when photo, video, dusk, floorplan is completed

      // Ensure the event is between 6 AM and 8 PM
      const scheduleEventInBounds = (
        eventName,
        gapDays,
        durationHours,
        specificHour = null
      ) => {
        currentDate = getNextWeekday(currentDate.clone().add(gapDays, "days"));

        if (currentHour + durationHours > 20) {
          currentHour = 9;
          currentDate.add(1, "day");
        }

        events.push(
          createEventInSydneyTime(
            eventName,
            currentDate,
            specificHour || currentHour,
            durationHours
          )
        );

        // Update lastMediaDate when scheduling photo or video
        if (eventName.includes("Photography") || eventName.includes("Video")) {
          lastMediaDate = currentDate.clone();
        }

        if (!specificHour) {
          currentHour += durationHours;
        }
      };

      // Phase 1: Schedule Photos first (if selected)

      // Separate Dusk, Drone, and Photography events from the selected items
      // Get the selected photo items (Photography, Dusk, Drone)
      const selectedPhotoItems = getSelectedItem(
        "Photos",
        marketing.categories
      );

      let selectedDusk = null;
      let selectedDrone = null;
      let selectedPhotography = null;

      // Loop through the selected items and categorize them
      selectedPhotoItems.forEach((item) => {
        if (item.name.includes("Dusk Photography")) {
          selectedDusk = item;
        } else if (item.name.includes("Drone Shots")) {
          selectedDrone = item;
        } else if (item.name.includes("Photography")) {
          selectedPhotography = item; // Pick the remaining photography item
        }
      });

      // Schedule Dusk and Drone Shots as a combined or separate event
      if (selectedDusk && selectedDrone) {
        // If both Dusk and Drone are selected, combine them into a single event
        const combinedDuration =
          eventDurations[selectedDusk.name] +
          eventDurations[selectedDrone.name];
        const sunsetHour = 18; // Assuming sunset happens around 6 PM
        scheduleEventInBounds(
          "Dusk Photography and Drone Shots",
          0,
          combinedDuration,
          sunsetHour
        );
      } else if (selectedDusk) {
        // Schedule Dusk Photography individually if only Dusk is selected
        const sunsetHour = 18; // Assuming sunset happens around 6 PM
        scheduleEventInBounds(
          "Dusk Photography",
          0,
          eventDurations[selectedDusk.name],
          sunsetHour
        );
      } else if (selectedDrone) {
        // Schedule Drone Shots individually if only Drone is selected
        const sunsetHour = 18; // Assuming sunset happens around 6 PM
        scheduleEventInBounds(
          "Drone Shots",
          0,
          eventDurations[selectedDrone.name],
          sunsetHour
        );
      }

      // If both selectedPhotography and selectedVideo exist, combine them into a single event
      if (selectedPhotography && selectedVideo.length) {
        const combinedEventName = `${selectedPhotography.name} and ${selectedVideo[0].name}`;
        const combinedDuration =
          eventDurations[selectedPhotography.name] +
          eventDurations[selectedVideo[0].name];

        // Schedule the combined event
        scheduleEventInBounds(combinedEventName, 0, combinedDuration);
      } else {
        // Schedule Photography event (if selected)
        if (selectedPhotography) {
          const photoName = selectedPhotography.name;
          const photoDuration = eventDurations[photoName];
          scheduleEventInBounds(photoName, 0, photoDuration); // Schedule this early in the day (morning)
        }

        // Schedule Video event (if selected)
        if (selectedVideo.length) {
          const videoName = selectedVideo[0].name;
          const videoDuration = eventDurations[videoName];
          scheduleEventInBounds(videoName, 0, videoDuration);
        }
      }

      // Phase 3: Schedule Floorplan
      if (selectedFloorplan.length) {
        const floorplanName = selectedFloorplan[0].name;
        const floorplanDuration = eventDurations[floorplanName];
        scheduleEventInBounds(floorplanName, 0, floorplanDuration, 16);
      }

      // Calculate launch to market date (2 weekdays after photos/videos)
      let launchToMarketMeetingDate = lastMediaDate
        ? addWorkingDays(lastMediaDate.clone(), 3) // Add 3 working days, skipping weekends
        : getNextWeekday(currentDate.clone().add(1, "days")); // If no lastMediaDate, add 1 day as fallback

      // Schedule the "Meeting: Launch to Market" (can happen Monday to Friday)
      events.push(
        createEventInSydneyTime(
          "Meeting: Launch to Market",
          launchToMarketMeetingDate,
          10,
          0.5
        )
      );

      // Calculate the "Launch to Market" event date (can only happen Monday to Thursday)
      let launchToMarketDate = launchToMarketMeetingDate.clone();

      // If the calculated launchToMarketDate is a Friday (day 5), move it to the following Monday
      if (launchToMarketDate.day() === 5) {
        launchToMarketDate.add(3, "days");
      } else if (launchToMarketDate.day() === 6) {
        // If it falls on Saturday, move it to the following Monday
        launchToMarketDate.add(2, "days");
      } else if (launchToMarketDate.day() === 0) {
        // If it falls on Sunday, move it to the following Monday
        launchToMarketDate.add(1, "day");
      }

      events.push(
        createEventInSydneyTime("Launch to Market", launchToMarketDate, 11, 1)
      );

      let closingDate;

      if (saleProcess === "Auction") {
        closingDate = (() => {
          const weeks = parseFloat(conclusionDate.split(" ")[0]);
          let tentativeClosingDate = launchToMarketDate
            .clone()
            .add(weeksToDays(weeks), "days");

          // Move closingDate to the next Saturday
          while (tentativeClosingDate.day() !== 6) {
            // 6 represents Saturday
            tentativeClosingDate.add(1, "day"); // Move to the next day until it's Saturday
          }

          return tentativeClosingDate;
        })();
      } else {
        closingDate = (() => {
          const weeks = parseFloat(conclusionDate.split(" ")[0]);
          let tentativeClosingDate = launchToMarketDate
            .clone()
            .add(weeksToDays(weeks), "days");

          // Move closing to Tuesday, Wednesday, or Thursday if it falls on other days
          while (![2, 3, 4].includes(tentativeClosingDate.day())) {
            tentativeClosingDate.add(1, "day"); // Move to the next day until it is Tuesday, Wednesday, or Thursday
          }

          return tentativeClosingDate;
        })();
      }

      let currentRecurringDate = launchToMarketDate.clone();
      let firstOpenHomeScheduled = false;
      let midCampaignMeeting = false;

      while (currentRecurringDate.isBefore(closingDate)) {
        // Only schedule mid-week events after first open home
        const midWeekOpenHome = getNextWednesday(currentRecurringDate);
        if (firstOpenHomeScheduled && midWeekOpenHome.isBefore(closingDate)) {
          events.push(
            createEventInSydneyTime(
              "Mid-week open home",
              midWeekOpenHome,
              18,
              0.5
            )
          );

          if (!midCampaignMeeting) {
            events.push(
              createEventInSydneyTime(
                "Mid-campaign meeting",
                midWeekOpenHome,
                18.5,
                0.5
              )
            );
            midCampaignMeeting = true;
          }
        }

        const openHome = getNextSaturday(currentRecurringDate);
        if (
          openHome.isAfter(launchToMarketDate) &&
          openHome.isSameOrBefore(closingDate)
        ) {
          events.push(createEventInSydneyTime("Open home", openHome, 10, 0.5));
          firstOpenHomeScheduled = true;
        }

        currentRecurringDate.add(7, "days");
      }

      // Schedule closing events with Saturday adjustment
      let preClosingMeeting = closingDate.clone().subtract(1, "day");

      // If pre-closing falls on Sunday, move it to Saturday after open home
      if (preClosingMeeting.day() === 0) {
        preClosingMeeting = preClosingMeeting.subtract(1, "day"); // Move to Saturday
        preClosingMeeting.set("hour", 14); // Set to after typical open home time
      }

      if (saleProcess === "Auction") {
        events.push(
          createEventInSydneyTime("Reserve Meeting", preClosingMeeting, 14, 1)
        );
      } else {
        events.push(
          createEventInSydneyTime(
            "Meeting: Pre Closing Date",
            preClosingMeeting,
            14,
            1
          )
        );
      }

      if (saleProcess === "Auction") {
        events.push(
          createEventInSydneyTime("Auction Date", closingDate, 10.5, 1)
        );
      } else {
        events.push(
          createEventInSydneyTime("Closing Date", closingDate, 12, null)
        );
      }

      return events;
    };

    const events = calculateEventDates(marketingStartDate);
    const eventsWithContractors = await getContractors(events);
    // await getContractors(events);

    return res.status(200).json({ success: true, data: eventsWithContractors });
  } catch (error) {
    console.error("Error fetching events: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
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

  const nameArray = req.user.name.toString().split(" ");
  const firstName = nameArray[0];
  const lastName = nameArray.length > 1 ? nameArray[1] : "";

  const {
    startTime,
    endTime,
    address = "43 RONA STREET",
    contractor,
  } = req.body;

  const agent = {
    firstName,
    lastName,
    email: req.user.email,
    mobile: req.user.mobile,
    image: req.user.picture,
  };

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

    // Uncomment this block if you want to prevent booking the same time slot
    // if (events.length > 0) {
    //   return res.status(409).json({
    //     success: false,
    //     message: "Time slot is already booked.",
    //     data: events
    //   });
    // }

    // Create a new event in Google Calendar using the logged-in user's calendar
    const event = {
      summary: address,
      description: `Test booking`,
      start: { dateTime: startTime, timeZone: "Australia/Sydney" },
      end: { dateTime: endTime, timeZone: "Australia/Sydney" },
      attendees: [
        {
          email: agent.email, // Agent email
          displayName: `${agent.firstName} ${agent.lastName}`, // Agent name
        },
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

    const db = await connectToDatabase();
    // Insert the booking data into MongoDB
    const contractorBookingsCollection = db.collection("contractorbookings");

    // Creating a new booking record
    const bookingData = {
      contractorId: new mongoose.Types.ObjectId(contractor._id),
      agentId: new mongoose.Types.ObjectId(req.user.id),
      name: event.summary,
      description: event.summary,
      address: address,
      startTime: startTime,
      endTime: endTime,
      googleEventId: googleEventId, // Google event ID from calendar API
      marketing: [], // Add appropriate marketing data if available
      servicesOffered: [], // Add appropriate services offered if available
      isReminded: false,
    };

    // Insert the booking into the collection
    await contractorBookingsCollection.insertOne(bookingData);

    res
      .status(201)
      .json({ success: true, data: "Booking created successfully" });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
