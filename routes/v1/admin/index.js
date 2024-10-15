const express = require("express");
const router = express.Router();

const propertyRoutes = require("./property");
const authRoutes = require("./auth");
const promptRoutes = require("./prompt");
const conjunctionAgentRoutes = require("./conjunctionAgent");
const userRoutes = require("./user");
const bookingRoutes = require("./booking");
const userPropertyRoutes = require("./userProperty");
const postListRoutes = require("./postList");
const authScheduleRoutes = require("./authSchedule");

router.use("/property", propertyRoutes);
router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.use("/prompt", promptRoutes);
router.use("/booking", bookingRoutes);
router.use("/conjunctionAgent", conjunctionAgentRoutes);
router.use("/userProperty", userPropertyRoutes);
router.use("/postList", postListRoutes);
router.use("/authSchedule", authScheduleRoutes);
module.exports = router;
