const { google } = require('googleapis');
const calendar = google.calendar('v3');

exports.createBooking = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/google');
    }

    const { startTime, endTime } = req.body;

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
        access_token: req.user.accessToken
    });

    const calendarId = 'primary';

    
    calendar.events.list({
        auth: oauth2Client,
        calendarId: calendarId,
        timeMin: startTime,
        timeMax: endTime,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const events = res.data.items;

        if (events.length > 0) {
            return res.status(409).json({ message: 'Time slot is already booked.' });
        }

        
        const event = {
            summary: 'Reserved Time Slot',
            start: {
                dateTime: startTime,
                timeZone: 'Sydney',
            },
            end: {
                dateTime: endTime,
                timeZone: 'Sydney',
            },
        };

        calendar.events.insert({
            auth: oauth2Client,
            calendarId: calendarId,
            resource: event,
        }, (err, event) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Booking created', event: event.data });
        });
    });
};

//reshedulde event 
exports.rescheduleBooking= (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/google');
    }

    const { eventId } = req.params;
    const { startTime, endTime } = req.body;

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
        access_token: req.user.accessToken
    });

    calendar.events.patch({
        auth: oauth2Client,
        calendarId: 'primary',
        eventId,
        resource: {
            start: {
                dateTime: startTime,
                timeZone: 'UTC',
            },
            end: {
                dateTime: endTime,
                timeZone: 'UTC',
            },
        },
    }, (err, event) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Booking rescheduled', event: event.data });
    });
};

// Cancel Booking
exports.cancelBooking= (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/google');
    }

    const { eventId } = req.params;

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
        access_token: req.user.accessToken
    });

    calendar.events.delete({
        auth: oauth2Client,
        calendarId: 'primary',
        eventId,
    }, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Booking canceled' });
    });
};

