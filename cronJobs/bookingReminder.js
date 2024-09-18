const moment = require("moment-timezone");
const Booking = require("../models/Booking");
const { sendSms } = require("../utils/smsService");
const cron = require("node-cron");

const bookingReminder = () => {
  cron.schedule("* * * * *", async () => {
    try {
      // Get the current time in Sydney and convert it to UTC
      const currentTimeInSydney = moment.tz("Australia/Sydney");
      const currentTimeInUTC = currentTimeInSydney.clone().utc();
      const oneHourLaterInUTC = currentTimeInSydney
        .clone()
        .add(1, "hour")
        .utc();

      // 1. Find upcoming bookings that are happening within the next hour
      const upcomingBookings = await Booking.find({
        status: "Active",
        startTime: {
          $gte: currentTimeInUTC.toDate(),
          $lte: oneHourLaterInUTC.toDate(),
        },
        isReminded: { $ne: true }, 
      });

      // 2. Send reminders for upcoming bookings
      if (upcomingBookings.length > 0) {
        upcomingBookings.forEach(async (booking) => {
          const { vendors, agent, startTime, address, prelistLink } = booking;

          // Send SMS to each vendor
          vendors.forEach(async (vendor) => {
            const recipient = {
              firstName: vendor.firstName,
              lastName: vendor.lastName,
              mobile: vendor.mobile,
            };

            try {
              await sendSms(
                "reminder",
                recipient,
                agent,
                startTime,
                prelistLink,
                address
              );
              console.log(`Reminder SMS sent to ${recipient.mobile}`);
            } catch (error) {
              console.error(
                `Error sending SMS to ${recipient.mobile}: ${error.message}`
              );
            }
          });

          // Send reminder to the agent
          try {
            await sendSms(
              "reminder",
              agent,
              agent,
              startTime,
              prelistLink,
              address
            );
            console.log(`Reminder SMS sent to agent ${agent.mobile}`);
          } catch (error) {
            console.error(`Error sending SMS to agent: ${error.message}`);
          }

          booking.isReminded = true;
          await booking.save();
        });
      }

      // 3. Find bookings where the end time has passed and mark them as "Completed"
      const completedBookings = await Booking.find({
        status: "Active",
        endTime: { $lt: currentTimeInUTC.toDate() }, // Bookings with endTime in the past
      });

      if (completedBookings.length > 0) {
        await Promise.all(
          completedBookings.map(async (booking) => {
            booking.status = "Completed";
            await booking.save();
            console.log(
              `Booking ID ${booking._id} has been marked as "Completed".`
            );
          })
        );
      }
    } catch (error) {
      console.error("Error fetching or updating bookings:", error);
    }
  });
};

module.exports = bookingReminder;
