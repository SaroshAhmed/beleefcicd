const Booking = require("../../models/Booking");
const mongoose = require("mongoose");

exports.getBookingsByAddress = async (req, res) => {
  try {
    const { userId, address } = req.query;

    const bookings = await Booking.find({
      userId: new mongoose.Types.ObjectId(userId),
      address,
      status: { $ne: "Cancelled" },
    });

    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
