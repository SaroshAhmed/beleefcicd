const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sessionId: { type: String, required: true }, //removed unique:true for testing
  accessToken: String,
  refreshToken: String,
  expiresAt: Date,
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
