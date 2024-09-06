const express = require("express");
const router = express.Router();

const {
    login,
    signup,
    logout,
    logoutFromAllDevices
  } = require("../../../controllers/admin/auth")
const {
    resetPasswordToken,
    resetPassword,
  } = require("../../../controllers/admin/resetPassword");
const { auth } = require("../../../middleware/auth");


router.post("/login", login)
router.get("/logout", logout)
router.get("/logoutfromalldevices",auth,logoutFromAllDevices)
router.post("/signup", signup)
router.post("/reset-password-token", resetPasswordToken)
router.post("/reset-password", resetPassword)

module.exports = router;
