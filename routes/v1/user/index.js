const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const profileRoutes = require("./profile");
const propertyRoutes = require("./property");
const bookingRoutes = require("./booking");
const conjunctionAgentRoutes = require("./conjunctionAgent");


router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/property", propertyRoutes);
router.use("/bookings", bookingRoutes);
router.use("/conjunctionAgent", conjunctionAgentRoutes);


module.exports = router;
