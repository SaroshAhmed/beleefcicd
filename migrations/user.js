// addGSTLicenseCompanyToUser.js

const mongoose = require("mongoose");
const databaseConnect = require("../config/database"); // Adjust the path as necessary
const User = require("../models/User"); // Adjust the path as necessary

// Connect to the database
databaseConnect();

// Async function to perform the migration
async function addFieldsToUser() {
  try {
    const companies = [
      {
        name: "Ausrealty (Riverwood) Pty Ltd (Licenced user of Ausrealty)",
        gst: "Yes",
        companyAddress: "166 Belmore Road, Riverwood NSW 2210",
        licenseNumber: "10044297",
      },
      {
        name: "KK Property Services Pty Ltd (Licenced user of Ausrealty)",
        gst: "Yes",
        companyAddress: "7 Padstow Parade, Padstow NSW 2211",
        licenseNumber: "10074701",
      },
      {
        name: "I.M Group Pty Ltd (Licenced user of Ausrealty)",
        gst: "Yes",
        companyAddress:
          "Shop AG08, 52 Soldiers Parade, Edmondson Park NSW 2174",
        licenseNumber: "10128898",
      },
      {
        name: "MRL Property Group Pty Ltd (Licenced user of Ausrealty)",
        gst: "Yes",
        companyAddress: "51-53 Princes Highway, Sylvania NSW 2224",
        licenseNumber: "10138644",
      },
      {
        name: "Hani Property Services Pty Ltd (Licenced user of Ausrealty)",
        gst: "Yes",
        companyAddress: "166 Belmore Road, Riverwood NSW 2210",
        licenseNumber: "10128535",
      },
      {
        name: "Suti Investments Pty Ltd (Licenced user of Ausrealty)",
        gst: "Yes",
        companyAddress: "166 Belmore Road, Riverwood NSW 2210",
        licenseNumber: "10094072",
      },
      {
        name: "Anodos Enterprises Pty Ltd (Licenced user of Ausrealty)",
        gst: "Yes",
        companyAddress: "848 King Georges Road, South Hurstville NSW 2221",
        licenseNumber: "10089089",
      },
      {
        name: "I Sayed Investments Pty Ltd (Licenced user of Ausrealty)",
        gst: "Yes",
        companyAddress: "848 King Georges Road, South Hurstville NSW 2221",
        licenseNumber: "10119295",
      },
    ];

    for (const company of companies) {
      await User.updateMany(
        { company: company.name, gst: null },
        {
          $set: {
            gst: company.gst,
            companyAddress: company.companyAddress,
            licenseNumber: company.licenseNumber,
          },
        }
      );
    }

    console.log("Migration completed.");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Execute the migration
addFieldsToUser();
