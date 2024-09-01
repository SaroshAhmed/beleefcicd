const express = require("express");
const router = express.Router();
const {
  createProperty,
  getPropertiesAddress,
  getPropertyByAddress,
} = require("../../../controllers/user/property");
const { isAuthenticated } = require("../../../middleware/auth");

router.post("/", isAuthenticated, createProperty);
router.get("/address", isAuthenticated, getPropertiesAddress);
router.get("/:address", isAuthenticated, getPropertyByAddress);
module.exports = router;
