const express = require("express");
const router = express.Router();
const { getAuthSchedule } = require("../../../controllers/admin/authSchedule"); // Adjust the path if necessary

// Route to get all properties for a specific user
router.get("/", getAuthSchedule);

module.exports = router;
