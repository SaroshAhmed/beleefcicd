const express = require("express");
const router = express.Router();
const { generatePdf } = require("../../../controllers/user/authSchedule");
const { isAuthenticated } = require("../../../middleware/auth");

router.post("/generatePdf", isAuthenticated, generatePdf);

module.exports = router;
