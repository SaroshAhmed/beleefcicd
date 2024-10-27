const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const auth2Routes = require("./auth2");
const profileRoutes = require("./profile");
const propertyRoutes = require("./property");
const shareRoutes = require("./share");
const userPropertyRoutes = require("./userProperty");
const bookingRoutes = require("./booking");
const openaiRoutes = require("./openai");
const postListRoutes = require("./postList");
const authScheduleRoutes = require("./authSchedule");
const marketingPriceRoutes = require("./marketingPrice");
const customTableRoutes = require("./customTable");
const userRoutes = require("./user");
const eventRoutes = require("./events");
const demoRoutes = require("./demo");

router.use("/demo", demoRoutes);
router.use("/auth", authRoutes);
router.use("/auth2", auth2Routes);
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
router.use("/customTable", customTableRoutes);

module.exports = router;
