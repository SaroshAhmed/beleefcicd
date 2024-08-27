const { STRIPE_PRIVATE_KEY } = require("../../config");
const stripe = require("stripe")(STRIPE_PRIVATE_KEY);
const User = require("../../models/User");
const AWS = require("aws-sdk");
const express = require("express");
const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: "v4",
});

exports.createSetupIntent = async (req, res) => {
  const { id } = req.user;

  try {
    let user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });
    console.log(setupIntent);
    return res
      .status(200)
      .json({ success: true, data: setupIntent.client_secret });
  } catch (error) {
    console.error("Error creating SetupIntent:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.generatePresignedUrl = async (req, res) => {
  try {
    const key = `signatures/${req.user.id}.png`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: 60,
      ContentType: "image/png",
    };

    const uploadURL = await s3.getSignedUrlPromise("putObject", params);
    res.status(200).json({
      success: true,
      uploadURL,
      key,
    });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate pre-signed URL" });
  }
};

exports.saveProfile = async (req, res) => {
  const { paymentMethodId, s3Key } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!paymentMethodId) {
      return res
        .status(400)
        .json({ success: false, message: "Payment method ID is required" });
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    if (!user.paymentMethods.includes(paymentMethodId)) {
      user.paymentMethods.push(paymentMethodId);
    }

    user.signature = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    user.profileComplete = true;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
