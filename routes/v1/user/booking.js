const express = require("express");
const router = express.Router();
const {
    createBooking,
    cancelBooking,
    rescheduleBooking,
    getAllBookings,
    getBookingByPrelistId,
    getBookingsByAddress
} = require("../../../controllers/user/booking");
const { isAuthenticated } = require("../../../middleware/auth");

router.post("/",isAuthenticated,createBooking );
router.put("/cancel/:id",isAuthenticated,cancelBooking);
router.put("/:id",isAuthenticated,rescheduleBooking);
router.get("/",isAuthenticated,getAllBookings);
router.get('/prelist/:prelistId', getBookingByPrelistId);
router.get('/address/:address', getBookingsByAddress);

module.exports = router;
