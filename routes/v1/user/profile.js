const express = require("express");
const router = express.Router();
const {
  createSetupIntent,
  generatePresignedUrl,
  saveProfile,
  uploadImage
} = require("../../../controllers/user/profile");
const { isAuthenticated } = require("../../../middleware/auth");

router.post("/create-setup-intent", isAuthenticated, createSetupIntent);

router.get('/generate-presigned-url', isAuthenticated, generatePresignedUrl);

router.post("/complete-profile", isAuthenticated, saveProfile);
router.post("/upload_url", isAuthenticated, uploadImage);

module.exports = router;
