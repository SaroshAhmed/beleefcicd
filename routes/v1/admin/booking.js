const express = require("express");
const router = express.Router();
const {
  getBookingsByAddress
} = require("../../../controllers/admin/booking");

router.get("/", getBookingsByAddress);

module.exports = router;
