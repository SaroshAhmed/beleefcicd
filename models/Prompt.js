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

const Prompt = mongoose.model('Prompt', promptSchema);

module.exports = Prompt;
