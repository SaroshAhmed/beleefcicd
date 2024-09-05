const express = require("express");
const router = express.Router();
const {
  createQuickSearch,
  getQuickSearch,
} = require("../../../controllers/user/share");
const { isAuthenticated } = require("../../../middleware/auth");

router.post("/quickShare", isAuthenticated, createQuickSearch);
router.get("/quickShare/:uuid", getQuickSearch);
module.exports = router;
