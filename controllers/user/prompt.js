const express = require('express');
const router = express.Router();
const Prompt = require('../models/Prompt');

// Create a new prompt
exports.createPrompt= async (req, res) => {
    const { name, description } = req.body;

    try {
        const newPrompt= new Prompt({ name, description });
        await newPrompt.save();
        res.status(201).json({ message: 'Prompt created successfully', item: newPrompt });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Read all items
exports.getAllPrompt= async (req, res) => {
    try {
        const prompt = await Prompt.find();
        res.status(200).json(prompt);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Read a single item by ID
exports.singlePrompt= async (req, res) => {
    const { id } = req.params;

    try {
        const prompt = await Prompt.findById(id);
        if (!prompt) {
            return res.status(404).json({ message: 'prompt not found' });
        }
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an item by ID
exports.updatePrompt= async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const updatedprompt = await Prompt.findByIdAndUpdate(id, { name, description }, { new: true });
        if (!updatedprompt) {
            return res.status(404).json({ message: 'prompt not found' });
        }
        res.status(200).json({ message: 'prompt updated successfully', prompt: prompt });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete an item by ID
exports.deletePrompt=async (req, res) => {
    const { id } = req.params;

    try {
        const deletedPrompt = await Prompt.findByIdAndDelete(id);
        if (!deletedPrompt) {
            return res.status(404).json({ message: 'prompt not found' });
        }
        res.status(200).json({ message: 'prompt deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = router;
