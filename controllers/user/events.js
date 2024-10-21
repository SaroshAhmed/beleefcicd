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
  "Melo - Small Floor Plan": 0.75, // 45 minutes
};

// Function to get the selected item from a category
const getSelectedItem = (categoryName, categories) => {
  const category = categories.find((cat) => cat.category === categoryName);
  if (!category) return null;
  const selectedItem = category.items.find((item) => item.isChecked);
  return selectedItem || null;
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

    // Function to convert "X weeks" to days (handles floating point weeks like "2.5 weeks")
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

    const getClosingDate = (marketingStartDate) => {
      const weeks = parseFloat(conclusionDate.split(" ")[0]);
      return marketingStartDate.clone().add(weeksToDays(weeks) + 2, "days");
    };

    const closingDate = getClosingDate(marketingStartDate);

    // Helper function to create an event in Sydney time
    const createEventInSydneyTime = (
      summary,
      eventDate,
      startHour,
      durationHours
    ) => {
      // Split startHour into the integer part (hours) and the fractional part (minutes)
      const hours = Math.floor(startHour);
      const minutes = (startHour - hours) * 60; // Convert the fractional part to minutes

      const eventStartSydney = eventDate
        .clone()
        .set("hour", hours)
        .set("minute", minutes)
        .set("second", 0)
        .set("millisecond", 0); // Ensure precise time handling

      const eventEndSydney = eventStartSydney
        .clone()
        .add(durationHours * 60, "minutes"); // Multiply by 60 to handle fractional durations

      return {
        summary,
        start: eventStartSydney.toISOString(),
        end: eventEndSydney.toISOString(),
      };
    };

    // Function to map events in Sydney timezone
    const calculateEventDates = (closingDate, marketingStartDate) => {
      const events = [];
      let currentDate = marketingStartDate.clone();
      let currentHour = 6; // Start at 6 AM

      // Ensure the event is between 6 AM and 8 PM
      const scheduleEventInBounds = (
        eventName,
        gapDays,
        durationHours,
        specificHour = null
      ) => {
        currentDate = getNextWeekday(currentDate.clone().add(gapDays, "days"));

        if (specificHour !== null) {
          currentHour = specificHour; // Use the specific hour if provided (e.g., 16 for 4:00 PM)
        } else if (currentHour + durationHours > 20) {
          // Ensure event ends before 8 PM
          currentHour = 6; // If it goes past 8 PM, move to the next day
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
        currentHour += durationHours; // Update time for next event
      };

      // Phase 1: Schedule Photos first (if selected)
      if (selectedPhoto) {
        const photoName = selectedPhoto.name;
        const photoDuration = eventDurations[photoName];
        scheduleEventInBounds(photoName, 0, photoDuration); // Schedule photo
      }

      // Phase 2: Schedule Videos second (if selected and after photos)
      if (selectedVideo) {
        const videoName = selectedVideo.name;
        const videoDuration = eventDurations[videoName];
        scheduleEventInBounds(videoName, 0, videoDuration); // Schedule video
      }

      // Phase 3: Schedule Floorplan last (if selected)
      if (selectedFloorplan) {
        const floorplanName = selectedFloorplan.name;
        const floorplanDuration = eventDurations[floorplanName];
        scheduleEventInBounds(floorplanName, 0, floorplanDuration, 16);
      }

      // Phase 4: Launch to Market and post-launch recurring events
      const launchToMarketMeetingDate = getNextMondayToThursday(
        currentDate.clone().add(2, "days")
      );

      events.push(
        createEventInSydneyTime(
          "Meeting: Launch to Market",
          launchToMarketMeetingDate,
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

      currentDate = launchToMarketDate.clone();

      while (currentDate.isBefore(closingDate)) {
        const openHome = getNextSaturday(currentDate);
        if (
          openHome.isAfter(launchToMarketDate) &&
          openHome.isBefore(closingDate)
        ) {
          events.push(createEventInSydneyTime("Open home", openHome, 12, 0.5));
        }

        const midWeekOpenHome = getNextWednesday(currentDate);
        if (
          midWeekOpenHome.isAfter(launchToMarketDate) &&
          midWeekOpenHome.isBefore(closingDate)
        ) {
          events.push({
            summary: "Mid-week open home",
            start: midWeekOpenHome
              .clone()
              .set("hour", 11)
              .startOf("hour")
              .toISOString(),
            end: midWeekOpenHome
              .clone()
              .set("hour", 11)
              .startOf("hour")
              .add(30, "minutes")
              .toISOString(),
          });

          events.push({
            summary: "Mid-campaign meeting",
            start: midWeekOpenHome
              .clone()
              .set("hour", 11)
              .startOf("hour")
              .add(30, "minutes")
              .toISOString(),
            end: midWeekOpenHome
              .clone()
              .set("hour", 11)
              .startOf("hour")
              .add(60, "minutes")
              .toISOString(),
          });
        }

        currentDate.add(7, "days");
      }

      const preClosingMeeting = closingDate.clone().subtract(1, "day");
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

    const events = calculateEventDates(closingDate, marketingStartDate);

    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Error fetching events: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
