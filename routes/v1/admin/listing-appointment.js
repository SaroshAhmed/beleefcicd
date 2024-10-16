const express = require("express");
const router = express.Router();
const { auth,isAdmin } = require("../../../middleware/auth");
const { createListingAppointment, getListingAppointment, updateListingAppointment } = require("../../../controllers/admin/listing-appointment");
router.post("/", isAdmin,createListingAppointment);
router.get("/", isAdmin, getListingAppointment);
module.exports = router;