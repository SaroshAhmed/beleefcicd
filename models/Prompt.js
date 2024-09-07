const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const Item = mongoose.model('Prompt', promptSchema);

module.exports = Item;
