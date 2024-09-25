const { STRIPE_PRIVATE_KEY } = require("../../config");
const stripe = require("stripe")(STRIPE_PRIVATE_KEY);
const User = require("../../models/User");
const AWS = require("aws-sdk");
const express = require("express");
const router = express.Router();
const { URL } = require("url");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();

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
    console.log(uploadURL);
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

const assignABN = (company) => {
  const companyABNMap = {
    "Ausrealty (Riverwood) Pty Ltd (Licenced user of Ausrealty)":
      "ABN 97 610 838 643",
    "KK Property Services Pty Ltd (Licenced user of Ausrealty)":
      "ABN 32 626 591 642",
    "I.M Group Pty Ltd (Licenced user of Ausrealty)": "ABN 58 634 408 610",
    "MRL Property Group Pty Ltd (Licenced user of Ausrealty)":
      "ABN 66 648 514 498",
    "Anodos Enterprises Pty Ltd (Licenced user of Ausrealty)":
      "ABN 19 635 299 526",
    "I Sayed Investments Pty Ltd (Licenced user of Ausrealty)":
      "ABN 53 647 496 222",
    "Suti Investments Pty Ltd (Licenced user of Ausrealty)":
      "ABN 45 620 049 292",
    "Hani Property Services Pty Ltd (Licenced user of Ausrealty)":
      "ABN 93 660 016 517",
  };

  return companyABNMap[company] || null;
};

exports.saveProfile = async (req, res) => {
  const { mobile, s3Key, company, title, image } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

     // Check if image is provided
     if (image) {
      // Check the image format and set appropriate ContentType
      const mimeTypeMatch = image.match(/^data:(image\/\w+);base64,/); // Extract mime type from base64 string
      if (!mimeTypeMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image format',
        });
      }

      const mimeType = mimeTypeMatch[1]; // e.g., 'image/png', 'image/jpeg', etc.
      const imageExtension = mimeType.split('/')[1]; // Extract the extension (e.g., 'png', 'jpeg', 'jpg')

      // Decode base64 image to buffer
      const imageBuffer = Buffer.from(image.split(',')[1], 'base64'); // Remove 'data:image/png;base64,' part

      const imageKey = `pictures/${userId}.${imageExtension}`; // Each user's image saved in subfolder with user ID

      // Upload image to S3
      await s3.putObject({
        Bucket: process.env.S3_PUBLIC_BUCKET_NAME, // Your S3 bucket name
        Key: imageKey,
        Body: imageBuffer,
        ContentEncoding: 'base64',
        ContentType: mimeType, // Use the detected mime type (e.g., 'image/png', 'image/jpeg')
        // ACL: 'public-read', // Optional: Make the image public
        // CacheControl: 'no-cache', // Ensure the image is not cached
        CacheControl: 'no-cache, no-store, must-revalidate',
        Expires: 0,
      }).promise();

      user.picture = `https://${process.env.S3_PUBLIC_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;
    }

    if(s3Key){
      user.signature = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    }

    user.company = company || user.company;
    user.title = title || user.title;
    user.mobile = mobile || user.mobile;
    if(company){
      user.abn = assignABN(company);
    }

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

// exports.saveProfile = async (req, res) => {
//   const { paymentMethodId, s3Key } = req.body;
//   const userId = req.user.id;

//   try {
//     const user = await User.findById(userId);
//     if (!user || !user.stripeCustomerId) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     if (!paymentMethodId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Payment method ID is required" });
//     }

//     await stripe.paymentMethods.attach(paymentMethodId, {
//       customer: user.stripeCustomerId,
//     });
//     await stripe.customers.update(user.stripeCustomerId, {
//       invoice_settings: { default_payment_method: paymentMethodId },
//     });

//     if (!user.paymentMethods.includes(paymentMethodId)) {
//       user.paymentMethods.push(paymentMethodId);
//     }

//     user.signature = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

//     user.profileComplete = true;

//     await user.save();

//     res
//       .status(200)
//       .json({ success: true, message: "Profile updated successfully" });
//   } catch (error) {
//     console.error("Error saving profile:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



exports.uploadImage = async (req, res) => {
  try {
    const key = `profile/${req.user.id}.png`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: 60,
      ContentType: "image/png",
    };

    const uploadURL = await s3.getSignedUrlPromise("putObject", params);

    user.picture = uploadURL;

    await user.save();

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

exports.getSignatureUrl = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || !user.signature) {
      return res
        .status(404)
        .json({ success: false, message: "Signature not found" });
    }

    // Extract the Key from the stored signature URL
    const signatureUrl = user.signature;
    const urlObj = new URL(signatureUrl);
    // Remove the leading '/' from pathname to get the Key
    const key = urlObj.pathname.startsWith("/")
      ? urlObj.pathname.substring(1)
      : urlObj.pathname;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: 300, // URL expires in 5 minutes
    };

    const url = s3.getSignedUrl("getObject", params);

    res.status(200).json({ success: true, data: url });
  } catch (error) {
    console.error("Error generating signature URL:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
