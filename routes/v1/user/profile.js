const express = require("express");
const router = express.Router();
const {
  createSetupIntent,
  generatePresignedUrl,
  saveProfile,
  getSignatureUrl
} = require("../../../controllers/user/profile");
const { isAuthenticated } = require("../../../middleware/auth");

router.post("/create-setup-intent", isAuthenticated, createSetupIntent);

router.get('/generate-presigned-url', isAuthenticated, generatePresignedUrl);

router.post("/complete-profile", isAuthenticated, saveProfile);

router.get('/get-signature-url', isAuthenticated, getSignatureUrl);
module.exports = router;
