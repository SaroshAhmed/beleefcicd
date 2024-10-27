const express = require("express");
const router = express.Router();
const {
  createSetupIntent,
  generatePresignedUrl,
  saveProfile,
  getSignatureUrl,
  addAudio,
  getAudio
} = require("../../../controllers/user/profile");
const { isAuthenticated } = require("../../../middleware/auth");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.post("/create-setup-intent", isAuthenticated, createSetupIntent);

router.get('/generate-presigned-url', isAuthenticated, generatePresignedUrl);

router.post("/complete-profile", isAuthenticated, saveProfile);

router.get('/get-signature-url', isAuthenticated, getSignatureUrl);
router.post('/add-audio', isAuthenticated,upload.single("audio"), addAudio);
router.get('/get-audio-url', isAuthenticated, getAudio);
module.exports = router;
