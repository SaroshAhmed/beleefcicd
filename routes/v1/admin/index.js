const express = require("express");
const router = express.Router();

const propertyRoutes = require("./property");
const authRoutes = require("./auth");
const promptRoutes = require("./prompt");
const conjunctionAgentRoutes = require("./conjunctionAgent");
const userRoutes = require("./user");

router.use("/property", propertyRoutes);
router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.use("/prompt", promptRoutes);
router.use("/conjunctionAgent", conjunctionAgentRoutes);

module.exports = router;
