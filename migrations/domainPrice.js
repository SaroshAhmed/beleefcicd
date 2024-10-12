const mongoose = require('mongoose');
const Suburb = require('../models/Suburb'); // Adjust the path to your Suburb model

const { MONGO_URI } = require("../config");



const updateDomainPrices = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

    // Define the suburb-specific domain price data
    const domainPrices = {
      Peakhurst: [
        { minPrice: 0, maxPrice: 999999, fee: 1705 },
        { minPrice: 1000000, maxPrice: 2749999, fee: 2500 },
        { minPrice: 2750000, maxPrice: 9999999999, fee: 3000 },
      ],
      Riverwood: [
        { minPrice: 0, maxPrice: 999999, fee: 1705 },
        { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
        { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
      ],
      Lugarno: [
        { minPrice: 0, maxPrice: 999999, fee: 1705 },
        { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
        { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
      ],
      'Peakhurst Heights': [
        { minPrice: 0, maxPrice: 999999, fee: 1705 },
        { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
        { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
      ],
      'Beverly Hills': [
        { minPrice: 0, maxPrice: 999999, fee: 1705 },
        { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
        { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
      ],
      Mortdale: [
        { minPrice: 0, maxPrice: 999999, fee: 1705 },
        { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
        { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
      ],
      Oatley: [
        { minPrice: 0, maxPrice: 999999, fee: 1705 },
        { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
        { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
      ],
      'Hurstville Grove': [
        { minPrice: 0, maxPrice: 999999, fee: 1705 },
        { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
        { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
      ],
      Blakehurst: [
        { minPrice: 0, maxPrice: 999999, fee: 1705 },
        { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
        { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
      ],
      Kingsgrove: [
        { minPrice: 0, maxPrice: 999999, fee: 1705 },
        { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
        { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
      ],
      'Connells Point': [
        { minPrice: 0, maxPrice: 999999, fee: 1705 },
        { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
        { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
      ],
      Hurstville: [
        { minPrice: 0, maxPrice: 999999, fee: 1705 },
        { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
        { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
      ],
      Penshurst: [
        { minPrice: 0, maxPrice: 999999, fee: 1705 },
        { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
        { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
      ],
      'Picnic Point': [
        { minPrice: 0, maxPrice: 999999, fee: 1089 },
        { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
      ],
      Revesby: [
        { minPrice: 0, maxPrice: 999999, fee: 1089 },
        { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
      ],
      'Padstow Heights': [
        { minPrice: 0, maxPrice: 999999, fee: 1089 },
        { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
      ],
      'Denham Court': [
        { minPrice: 0, maxPrice: 699999, fee: 660 },
        { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
      ],
      Leppington: [
        { minPrice: 0, maxPrice: 699999, fee: 660 },
        { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
      ],
      Austral: [
        { minPrice: 0, maxPrice: 699999, fee: 660 },
        { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
      ],
      'Edmondson Park': [
        { minPrice: 0, maxPrice: 699999, fee: 660 },
        { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
      ],
    };

    // Iterate over each suburb and update its domain price
    for (const suburb in domainPrices) {
      const domainPrice = domainPrices[suburb];
      
      await Suburb.findOneAndUpdate(
        { suburb: suburb },
        { $set: { domainPrice: domainPrice } }
      );

      console.log(`Updated ${suburb} with domain prices`);
    }

    console.log('All suburbs updated with respective domain prices');
  } catch (error) {
    console.error('Error updating domain prices:', error);
  } finally {
    // Close the connection to the database
    mongoose.connection.close();
  }
};

// Run the migration
updateDomainPrices();
