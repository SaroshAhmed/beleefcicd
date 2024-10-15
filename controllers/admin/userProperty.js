
const mongoose = require("mongoose");
const UserProperty = require("../../models/UserProperty");

exports.getUserProperties = async (req, res) => {
  try {
    const { userId } = req.query;
    const userProperties = await UserProperty.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).populate("address");

    return res.status(200).json({ success: true, data: userProperties });
  } catch (error) {
    console.error("Error in getPropertyByAddress: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserProperty = async (req, res) => {
  try {

    const { id } = req.query;

    const userProperty = await UserProperty.findOne({
      _id:new mongoose.Types.ObjectId(id),

    });

    return res.status(200).json({ success: true, data: userProperty });
  } catch (error) {
    console.error("Error in getPropertyByAddress: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};