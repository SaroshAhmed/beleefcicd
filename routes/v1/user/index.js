const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const profileRoutes = require("./profile");
const propertyRoutes = require("./property");

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/property", propertyRoutes);

module.exports = router;
