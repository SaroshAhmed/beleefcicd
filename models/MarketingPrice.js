// models/MarketingPrice.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MarketingPriceSchema = new Schema({
  category: {
    type: String,
    required: true,
  },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      default: [],
    },
  ],
});

module.exports = mongoose.model('MarketingPrice', MarketingPriceSchema);
