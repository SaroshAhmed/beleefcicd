const express = require("express");
const router = express.Router();
const { text, image } = require("../../../controllers/user/openai");
const { isAuthenticated } = require("../../../middleware/auth");
const multer = require("multer");
// Set up multer storage configuration (you can change destination as per your need)
const storage = multer.memoryStorage(); // Store files in memory (you can configure for file system)
const upload = multer({ storage });

router.post("/text", isAuthenticated, text);
router.post("/image", upload.array("files"), isAuthenticated, image);

module.exports = router;
