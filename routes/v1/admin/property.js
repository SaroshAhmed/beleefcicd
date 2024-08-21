const express = require("express");
const router = express.Router();

// Import the controller functions
const {
  getProperties,
  getPropertyById,
  calculateScoreMatch,
} = require("../../../controllers/admin/property");

// Define the routes and map to the controller functions
router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.get("/recommend/:id", calculateScoreMatch);

module.exports = router;
