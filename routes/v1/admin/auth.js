const express = require("express");
const router = express.Router();

const {
    login,
    register,
    logout,
    logoutFromAllDevices,
    resetPasswordToken,
    resetPassword
  } = require("../../../controllers/admin/auth")
const { auth } = require("../../../middleware/auth");


router.post("/login", login)
router.get("/logout", logout)
router.get("/logoutfromalldevices",auth,logoutFromAllDevices)
router.post("/register", register)
router.post("/reset-password-token", resetPasswordToken)
router.post("/reset-password", resetPassword)

module.exports = router;
