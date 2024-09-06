const express = require("express");
const router = express.Router();
const {
  createProperty,
  getPropertyByAddress
} = require("../../../controllers/user/userProperty");
const { isAuthenticated } = require("../../../middleware/auth");

router.post("/", isAuthenticated, createProperty);

// Catch-all dynamic route should be last
router.get("/:address", isAuthenticated, getPropertyByAddress); // <-- Dynamic route last

module.exports = router;
