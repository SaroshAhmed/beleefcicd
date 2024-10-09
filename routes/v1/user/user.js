const express = require("express");
const router = express.Router();
const {
  getAllUsers
} = require("../../../controllers/user/user");
const { isAuthenticated } = require("../../../middleware/auth");

router.get("/", isAuthenticated, getAllUsers);

module.exports = router;
