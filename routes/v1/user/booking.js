const express = require("express");
const router = express.Router();
const {
    createBooking,
    cancelBooking,
    rescheduleBooking,
    getAllBookings,
} = require("../../../controllers/user/booking");
const { isAuthenticated } = require("../../../middleware/auth");


router.post("/",isAuthenticated,createBooking );
router.delete("/:eventId",isAuthenticated,cancelBooking);
router.patch("/:eventId/reschedule",isAuthenticated,rescheduleBooking);
router.get("/",isAuthenticated,getAllBookings);
module.exports = router;
