const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const profileRoutes = require("./profile");
const propertyRoutes = require("./property");
const shareRoutes = require("./share");
const userPropertyRoutes = require("./userProperty");
const bookingRoutes = require("./booking");
const openaiRoutes = require("./openai");
const postListRoutes = require("./postList");
const authScheduleRoutes = require("./authSchedule");
const marketingPriceRoutes = require("./marketingPrice");
const userRoutes = require("./user");
const eventRoutes = require("./events");

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/property", propertyRoutes);
router.use("/share", shareRoutes);
router.use("/userProperty", userPropertyRoutes);
router.use("/bookings", bookingRoutes);
router.use("/openai", openaiRoutes);
router.use("/postList", postListRoutes);
router.use("/authSchedule", authScheduleRoutes);
router.use("/marketingPrice", marketingPriceRoutes);
router.use("/user", userRoutes);
router.use("/events", eventRoutes);

module.exports = router;
