const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    mobile: String,
    picture: String,
    role: { type: String, default: "user" },
    signature: String,
    conjunctionAgent: String,
    company: String,
    abn: String,
    title: String,
    googleId: { type: String, required: true, unique: true },
    profileComplete: { type: Boolean, default: false },
    stripeCustomerId: { type: String }, // Stripe Customer ID
    paymentMethods: [
      {
        type: String, // Stripe Payment Method ID
      },
    ],
    gst: {
      type: String,
    },
    licenseNumber: {
      type: String,
    },
    companyAddress: {
      type: String,
    },
    accessToken: String,
    refreshToken: String,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
