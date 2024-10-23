const express = require("express");
const router = express.Router();
const {
calculateEvents
} = require("../../../controllers/user/events");

router.get("/calEvents/:propertyId", calculateEvents);
router.post("/calEventst", calculateEvents);

module.exports = router;