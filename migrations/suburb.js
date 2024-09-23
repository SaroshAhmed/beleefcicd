const mongoose = require("mongoose");
const { MONGO_URI } = require("../config");
const Suburb = require("../models/Suburb");

const suburbs = [
  // { suburb: "Peakhurst", postcode: "2210" },
  // { suburb: "Riverwood", postcode: "2210" },
  // { suburb: "Lugarno", postcode: "2210" },
  // { suburb: "Peakhurst Heights", postcode: "2210" },
  // { suburb: "Beverly Hills", postcode: "2209" },
  // { suburb: "Mortdale", postcode: "2223" },
  // { suburb: "Oatley", postcode: "2223" },
  // { suburb: "Hurstville Grove", postcode: "2220" },
  // { suburb: "Blakehurst", postcode: "2221" },
  // { suburb: "Picnic Point", postcode: "2213" },
  // { suburb: "Kingsgrove", postcode: "2208" },
  // { suburb: "Revesby", postcode: "2212" },
  // { suburb: "Connells Point", postcode: "2221" },
  // { suburb: "Hurstville", postcode: "2220" },
  // { suburb: "Padstow Heights", postcode: "2211" },
  // { suburb: "Padstow", postcode: "2211" },
  // { suburb: "Panania", postcode: "2213" },
  // { suburb: "Narwee", postcode: "2209" },
  // { suburb: "Werrington", postcode: "2747" },
  // { suburb: "Merrylands", postcode: "2160" },
  // { suburb: "Kyle Bay", postcode: "2221" },
  // { suburb: "South Hurstville", postcode: "2221" },
  { suburb: "Penshurst", postcode: "2222" },
  // { suburb: "Denham Court", postcode: "2565" },
  // { suburb: "Leppington", postcode: "2179" },
  // { suburb: "Austral", postcode: "2179" },
  // { suburb: "Edmondson Park", postcode: "2174" },
];

async function runMigration() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Suburb.insertMany(suburbs);
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    mongoose.connection.close();
  }
}

runMigration();
