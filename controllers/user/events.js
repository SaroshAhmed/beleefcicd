const AuthSchedule = require("../../models/AuthSchedule");
const mongoose = require("mongoose");
const connectToDatabase = require("../../config/serviceDB");

const { addDays, subDays, setHours, startOfDay } = require("date-fns");
const moment = require("moment-timezone");

// Timezone for Sydney
const SYDNEY_TZ = "Australia/Sydney";

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

// Utility function to get the next Monday-Thursday for "Launch to Market" meeting
const getNextMondayToThursday = (date) => {
  while (date.day() === 0 || date.day() === 5 || date.day() === 6) {
    date.add(1, "day");
  }
  return date;
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
  if (!category) return null;
  const selectedItem = category.items.find((item) => item.isChecked);
  return selectedItem || null;
};

const getContractors = async () => {
  const db = await connectToDatabase();
  const contractorsCollection = db.collection("contractors");
  const contractors = await contractorsCollection.find({}).toArray();
  const contractorBookingsCollection = db.collection("contractorBookings");
  const contractorBookings = await contractorBookingsCollection
    .find({})
    .toArray();
};

exports.calculateEvents = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const objectId = new mongoose.Types.ObjectId(propertyId);

    const authSchedule = await AuthSchedule.findOne({
      propertyId: objectId,
    }).populate("propertyId");

    if (!authSchedule) {
      return res
        .status(404)
        .json({ success: false, message: "Auth Schedule not found" });
    }

    const { prepareMarketing, conclusionDate } = authSchedule;
    const { marketing } = authSchedule.propertyId;

    // Get selected items for Photos, Floorplans, and Video
    const selectedPhoto = getSelectedItem("Photos", marketing.categories);
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

    // Helper function to create an event in Sydney time
    const createEventInSydneyTime = (
      summary,
      eventDate,
      startHour,
      durationHours
    ) => {
      const hours = Math.floor(startHour);
      const minutes = (startHour - hours) * 60;

      const eventStartSydney = eventDate
        .clone()
        .set("hour", hours)
        .set("minute", minutes)
        .set("second", 0)
        .set("millisecond", 0);

      const eventEndSydney = eventStartSydney
        .clone()
        .add(durationHours * 60, "minutes");

      return {
        summary,
        start: eventStartSydney.toISOString(),
        end: eventEndSydney.toISOString(),
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
      let currentHour = 6;
      let lastMediaDate = null;

      // Ensure the event is between 6 AM and 8 PM
      const scheduleEventInBounds = (
        eventName,
        gapDays,
        durationHours,
        specificHour = null
      ) => {
        currentDate = getNextWeekday(currentDate.clone().add(gapDays, "days"));

        if (specificHour !== null) {
          currentHour = specificHour;
        } else if (currentHour + durationHours > 20) {
          currentHour = 6;
          currentDate.add(1, "day");
        }

        events.push(
          createEventInSydneyTime(
            eventName,
            currentDate,
            currentHour,
            durationHours
          )
        );

        // Update lastMediaDate when scheduling photo or video
        if (eventName.includes("Photography") || eventName.includes("Video")) {
          lastMediaDate = currentDate.clone();
        }

        currentHour += durationHours;
      };

      // Phase 1: Schedule Photos first (if selected)
      if (selectedPhoto) {
        const photoName = selectedPhoto.name;
        const photoDuration = eventDurations[photoName];
        scheduleEventInBounds(photoName, 0, photoDuration);
      }

      // Phase 2: Schedule Videos second (if selected)
      if (selectedVideo) {
        const videoName = selectedVideo.name;
        const videoDuration = eventDurations[videoName];
        scheduleEventInBounds(videoName, 0, videoDuration);
      }

      // Phase 3: Schedule Floorplan
      if (selectedFloorplan) {
        const floorplanName = selectedFloorplan.name;
        const floorplanDuration = eventDurations[floorplanName];
        scheduleEventInBounds(floorplanName, 0, floorplanDuration, 16);
      }

      // Calculate launch to market date (2 weekdays after photos/videos)
      let launchToMarketMeetingDate = getNextMondayToThursday(
        (lastMediaDate ? lastMediaDate.clone().add(3, "days") : currentDate.clone().add(1, "days"))
      );


      // Schedule Launch to Market meeting and event
      events.push(
        createEventInSydneyTime(
          "Meeting: Launch to Market",
          lastMediaDate ? lastMediaDate.clone().add(3, "days") : currentDate.clone().add(1, "days"),
          10,
          0.5
        )
      );

      const launchToMarketDate = launchToMarketMeetingDate.clone();
      if (launchToMarketDate.day() === 4 && launchToMarketDate.hour() > 13) {
        launchToMarketDate.hour(12);
      }
      events.push(
        createEventInSydneyTime("Launch to Market", launchToMarketDate, 11, 1)
      );

      // Calculate closing date based on launch to market date
      // const closingDate = (() => {
      //   const weeks = parseFloat(conclusionDate.split(" ")[0]);
      //   return launchToMarketDate.clone().add(weeksToDays(weeks), "days");
      // })();

      const closingDate = (() => {
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

      let currentRecurringDate = launchToMarketDate.clone();
      let firstOpenHomeScheduled = false;

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
          events.push(
            createEventInSydneyTime(
              "Mid-campaign meeting",
              midWeekOpenHome,
              18.5,
              0.5
            )
          );
        }

        const openHome = getNextSaturday(currentRecurringDate);
        if (
          openHome.isAfter(launchToMarketDate) &&
          openHome.isBefore(closingDate)
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

      events.push(
        createEventInSydneyTime(
          "Meeting: Pre Closing Date",
          preClosingMeeting,
          14,
          1
        )
      );

      events.push(createEventInSydneyTime("Closing Date", closingDate, 10, 1));

      return events;
    };

    const events = calculateEventDates(marketingStartDate);

    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Error fetching events: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
