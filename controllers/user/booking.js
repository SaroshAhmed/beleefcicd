// In-memory booking store
let bookings = [];
let bookingIdCounter = 1;

// Sample data
const sampleBookings = [
    {
        bookingId: 'booking-1',
        eventId: 'event-1',
        startTime: '2023-09-06T10:00:00Z',
        endTime: '2023-09-06T11:00:00Z',
        duration: 60,
        customer: {
            name: 'Alice Smith',
            email: 'alice@example.com',
            phone: '123-456-7890'
        },
        service: {
            type: 'Consultation',
            description: 'General consultation'
        },
        notes: 'First-time client',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        bookingId: 'booking-2',
        eventId: 'event-2',
        startTime: '2023-09-07T14:00:00Z',
        endTime: '2023-09-07T15:00:00Z',
        duration: 60,
        customer: {
            name: 'Bob Johnson',
            email: 'bob@example.com',
            phone: '987-654-3210'
        },
        service: {
            type: 'Follow-up',
            description: 'Follow-up appointment'
        },
        notes: 'Requesting additional information',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Initialize bookings with sample data
bookings = sampleBookings;

// Create Booking
exports.createBooking=(req, res) => {
    const booking = {
        bookingId: `booking-${bookingIdCounter++}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    bookings.push(booking);
    res.status(201).json({ bookingId: booking.bookingId, message: 'Booking created successfully' });
};

// Cancel Booking
exports.cancelBooking=(req, res) => {
    const { id } = req.params;
    const index = bookings.findIndex(b => b.bookingId === id);
    
    if (index === -1) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Booking not found' } });
    }
    
    bookings.splice(index, 1);
    res.status(200).json({ message: 'Booking canceled successfully' });
};

// Reschedule Booking
exports.rescheduleBooking= (req, res) => {
    const { id } = req.params;
    const booking = bookings.find(b => b.bookingId === id);
    
    if (!booking) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Booking not found' } });
    }
    
    const { startTime, endTime, duration } = req.body;
    
    // Update booking details
    booking.startTime = startTime || booking.startTime;
    booking.endTime = endTime || booking.endTime;
    booking.duration = duration || booking.duration;
    booking.updatedAt = new Date().toISOString();

    res.status(200).json({ message: 'Booking rescheduled successfully', booking });
};
//Get All Booking
exports.getAllBookings= (req, res) => {
    res.status(200).json(bookings);
};