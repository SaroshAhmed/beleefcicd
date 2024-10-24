const express = require("express");
const router = express.Router();
const {
  calculateEvents,
  createBooking,
} = require("../../../controllers/user/events");

router.get("/calEvents/:propertyId", calculateEvents);
router.post("/calEventst", calculateEvents);
router.post("/eventBooking", createBooking);

module.exports = router;
