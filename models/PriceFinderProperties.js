const mongoose = require('mongoose');

const priceFinderPropertiesSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

const PriceFinderProperties = mongoose.model('PriceFinderProperties', priceFinderPropertiesSchema);

module.exports = PriceFinderProperties;
