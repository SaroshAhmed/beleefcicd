const express = require("express");
const router = express.Router();
const {
  generatePdf,
  generatePresignedUrl,
  createAuthSchedule,
  getAllSignatureUrl,
  getAuthScheduleByPropertyId,
  updateVendorInAuthSchedule,
  sendToSign,
  getVendorsSignatureUrl
} = require("../../../controllers/user/authSchedule");
const { isAuthenticated } = require("../../../middleware/auth");

router.post("/generatePdf", isAuthenticated, generatePdf);
router.post("/generatePresignedUrl", isAuthenticated, generatePresignedUrl);
router.post("/", isAuthenticated, createAuthSchedule);

router.get("/get-signature-url/:id", getAllSignatureUrl);
router.get("/:propertyId", getAuthScheduleByPropertyId);
router.put("/:propertyId", updateVendorInAuthSchedule);

router.post("/sendToSign", isAuthenticated, sendToSign);

router.get("/vendorsSign/:id", getVendorsSignatureUrl);
module.exports = router;

