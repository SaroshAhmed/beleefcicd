const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vendorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
});

const agentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
});

const bookingSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String},
  address: { type: String, required: true },
  vendors: [vendorSchema],
  agent: agentSchema,
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  googleEventId: { type: String, required: true },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active',
  },
  prelistId: {
    type: String,
    unique: true,
    required: true,
  },
  prelistLink: {
    type: String,
    unique: true,
    required: true,
  },
  property: {
    type: Schema.Types.Mixed,
    required: true,
  },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
