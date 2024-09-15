const express = require("express");
const router = express.Router();
const {
  createQuickSearch,
  getQuickSearch,
  updateQuickSearch
} = require("../../../controllers/user/share");
const { isAuthenticated } = require("../../../middleware/auth");

router.post("/quickShare", isAuthenticated, createQuickSearch);
router.get("/quickShare/:uuid", getQuickSearch);
router.put('/quickShare/:uuid', updateQuickSearch);

module.exports = router;
