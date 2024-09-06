const express = require("express");
const router = express.Router();
const {
    createBooking,
    cancelBooking,
    rescheduleBooking,
    getAllBookings
} = require("../../../controllers/user/booking");


router.get("/all",getAllBookings);
router.post("/",createBooking );
router.delete("/:id",cancelBooking);
router.put("/:id/reschedule",rescheduleBooking);
module.exports = router;
