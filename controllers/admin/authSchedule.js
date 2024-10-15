const puppeteer = require("puppeteer");
const { PDFDocument } = require("pdf-lib");
const axios = require("axios");
const AuthSchedule = require("../../models/AuthSchedule");
const UserProperty = require("../../models/UserProperty");
const AWS = require("aws-sdk");
const {
  formatCurrency,
  formatDateToAEDT,
  getVendorSignatureUrl,
} = require("../../utils/helperFunctions");
const { REACT_APP_FRONTEND_URL } = require("../../config");

const mongoose = require("mongoose");
const { sendSms } = require("../../utils/smsService");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();

exports.getAuthSchedule = async (req, res) => {
  try {
    const { propertyId } = req.query;

    const authSchedule = await AuthSchedule.findOne({
      propertyId: new mongoose.Types.ObjectId(propertyId),
    }).populate("userId");

    if (!authSchedule) {
      return res
        .status(404)
        .json({ success: false, message: "Auth Schedule not found" });
    }

    // Rename userId to agent
    const authScheduleWithAgent = {
      ...authSchedule._doc, // Spread all the fields from the original document
      agent: authSchedule.userId, // Rename userId to agent
    };

    return res.status(200).json({ success: true, data: authScheduleWithAgent });
  } catch (error) {
    console.error("Error fetching AuthSchedule: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
