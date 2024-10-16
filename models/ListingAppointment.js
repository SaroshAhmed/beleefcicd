const mongoose = require('mongoose');


const priceProcessSchema = new mongoose.Schema({
    name: { type: String,  },
    pricePoint: { type: String, },
    engagement: { type: String, },
    priceAssessment: { type: String,  },
    enquiries: { type: String, },
    finalise: { type: String, },
    inspections1: { type: String, },
    inspections2: { type: String, },
});

const listingAppointmentSchema = new mongoose.Schema({
    priceProcess: [priceProcessSchema],
},{
    timestamps: true
});

const ListingAppointment = mongoose.model('ListingAppointment', listingAppointmentSchema);

module.exports = ListingAppointment;


