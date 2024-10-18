// addMarketingFieldsToUserProperty.js

const mongoose = require("mongoose");
const databaseConnect = require("../config/database"); // Adjust the path as necessary
const UserProperty = require("../models/UserProperty"); // Adjust the path as necessary

// Connect to the database
databaseConnect();

// Async function to perform the migration
async function addMarketingFields() {
  try {
    // // Define the fields to be added
    // const marketingPrice = "$5000-8000";
    // const marketingItems = [
    //   "Photography",
    //   "Floorplan",
    //   "Video",
    //   "Copywriting",
    //   "Styling",
    //   "Brochures",
    //   "Signboard",
    //   "Mailcards",
    //   "Social media",
    //   "Realestate.com.au",
    //   "Domain.com.au",
    //   "Ausrealty.com.au",
    //   "Auctioneer",
    // ];
    const fiveStepProcess = [
      {
        name: "OFF MARKET",
        pricePoint: "1.8-1.9m",
        enquiries: "82",
        inspections1: "0",
        priceAssessment: "Top end of the range",
        inspections2: "0",
        engagement: "",
        finalise: "",
        keyMeeting: "KEY MEETING: LISTING APPOINTMENT",
      },
      {
        name: "WEEK 1",
        pricePoint: "1.6-1.7m",
        enquiries: "50",
        inspections1: "15",
        priceAssessment: "Top end of the range",
        inspections2: "15",
        engagement: "3",
        finalise: "",
        keyMeeting: "KEY MEETING: LAUNCH TO MARKET MEETING",
      },
      {
        name: "WEEK 2",
        pricePoint: "1.7-1.8m",
        enquiries: "26",
        inspections1: "5",
        priceAssessment: "Top end of the range",
        inspections2: "20",
        engagement: "2",
        finalise: "1.9m",
        keyMeeting: "KEY MEETING: MID CAMPAIGN MEETING",
      },
      {
        name: "WEEK 3",
        pricePoint: "",
        enquiries: "",
        inspections1: "",
        priceAssessment: "Top end of the range",
        inspections2: "",
        engagement: "",
        finalise: "",
        keyMeeting: "KEY MEETING: PRE CLOSING DATE",
      },
      {
        name: "WEEK 4",
        pricePoint: "",
        enquiries: "",
        inspections1: "",
        priceAssessment: "Top end of the range",
        inspections2: "",
        engagement: "",
        finalise: "",
        keyMeeting: "KEY MEETING: POST CLOSING DATE",
      },
    ];

    // Update all documents in the UserProperty collection
    const result = await UserProperty.updateMany(
      {
        $set: { fiveStepProcess }, // Update action
      }
    );

    console.log(
      `Migration completed. Modified ${result.modifiedCount} documents.`
    );
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

// Execute the migration
addMarketingFields();
