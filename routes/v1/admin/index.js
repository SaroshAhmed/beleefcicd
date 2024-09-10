const express = require("express");
const router = express.Router();

const propertyRoutes = require("./property");
const authRoutes = require("./auth");
const promptRoutes = require("./prompt");
const conjunctionAgentRoutes = require("./conjunctionAgent");

router.use("/property", propertyRoutes);
router.use("/auth", authRoutes);
router.use("/prompt", promptRoutes);
router.use("/conjunctionAgent", conjunctionAgentRoutes);

module.exports = router;
