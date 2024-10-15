const express = require("express");
const router = express.Router();
const {
  getUserProperties,
  getUserProperty,
} = require("../../../controllers/admin/userProperty"); // Adjust the path if necessary

// Route to get all properties for a specific user
router.get("/", getUserProperties);

// Route to get a specific user property by its ID
router.get("/single", getUserProperty);

module.exports = router;
