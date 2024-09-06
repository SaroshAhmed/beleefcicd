const express = require("express");
const router = express.Router();
const {
    createBooking,
    cancelBooking,
    rescheduleBooking,
} = require("../../../controllers/user/booking");
const { isAuthenticated } = require("../../../middleware/auth");


router.post("/",isAuthenticated,createBooking );
router.delete("/:eventId",isAuthenticated,cancelBooking);
router.put("/:eventId/reschedule",isAuthenticated,rescheduleBooking);
module.exports = router;
