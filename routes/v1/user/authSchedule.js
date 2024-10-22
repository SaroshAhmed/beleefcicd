const express = require("express");
const router = express.Router();
const {
  generatePdf,
  generatePresignedUrl,
  createAuthSchedule,
  getAllSignatureUrl,
  getAuthScheduleByPropertyId,
  updateAuthSchedule,
  sendToSign,
  getVendorsSignatureUrl,
  updateViewedDate,
  getAllAuthSchedule,
  deleteAuthSchedule,
  fileUpload,
  getSignedUrl,
  getCalendarEvents,
  calculateEvents
} = require("../../../controllers/user/authSchedule");
const { isAuthenticated } = require("../../../middleware/auth");

router.post("/generatePdf", generatePdf);
router.post("/generatePresignedUrl", isAuthenticated, generatePresignedUrl);
router.post("/", isAuthenticated, createAuthSchedule);
router.get("/", isAuthenticated, getAllAuthSchedule);
router.get("/calendarEvents", isAuthenticated, getCalendarEvents);
router.get("/get-signature-url/:id", getAllSignatureUrl);
router.get("/:propertyId", getAuthScheduleByPropertyId);
router.put("/:propertyId", updateAuthSchedule);
router.put("/viewedDate/:propertyId", updateViewedDate);
router.post("/sendToSign", isAuthenticated, sendToSign);

router.get("/vendorsSign/:id", getVendorsSignatureUrl);

router.delete("/:propertyId", isAuthenticated, deleteAuthSchedule);

router.post("/fileUpload", fileUpload);

router.get("/getSignedUrl/:url", getSignedUrl);



module.exports = router;
