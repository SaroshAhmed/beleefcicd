const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const profileRoutes = require("./profile");
const propertyRoutes = require("./property");
const shareRoutes = require("./share");
const userPropertyRoutes = require("./userProperty");
const bookingRoutes = require("./booking");

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/property", propertyRoutes);
router.use("/share", shareRoutes);
router.use("/userProperty", userPropertyRoutes);
router.use("/bookings", bookingRoutes);

module.exports = router;
