// controllers/marketingPriceController.js
const MarketingPrice = require("../../models/MarketingPrice");

exports.getAllMarketingPrices = async (req, res) => {
  try {
    const marketingPrices = await MarketingPrice.find();
    res.status(200).json({ success: true, data: marketingPrices });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ success: false, message: error.message });
  }
};
