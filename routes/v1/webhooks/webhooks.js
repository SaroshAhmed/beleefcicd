const express = require("express");
const router = express.Router();
const {
  campaignAgent
} = require("../../../controllers/webhooks/webhooks");

router.get('/campaignAgent', campaignAgent);

module.exports = router;
