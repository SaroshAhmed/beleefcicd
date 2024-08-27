const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const profileRoutes = require("./profile");

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);

module.exports = router;
