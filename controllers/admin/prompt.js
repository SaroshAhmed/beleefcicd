const express = require("express");
const router = express.Router();
const Prompt = require("../../models/Prompt");

exports.createPrompt = async (req, res) => {
  const { name, description } = req.body;

  try {
    const prompt = new Prompt({ name, description });
    await prompt.save();
    res.status(201).json({ success: true, data: prompt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllPrompt = async (req, res) => {
  try {
    const prompts = await Prompt.find(); // Fixed variable name from "prompt" to "prompts"
    res.status(200).json({ success: true, data: prompts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.singlePrompt = async (req, res) => {
  const { id } = req.params;

  try {
    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return res.status(404).json({ success: false, message: "Prompt not found" });
    }
    res.status(200).json({ success: true, data: prompt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePrompt = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  console.log(req.body, id);
  try {
    const updatedPrompt = await Prompt.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );
    if (!updatedPrompt) {
      return res.status(404).json({ success: false, message: "Prompt not found" });
    }
    res.status(200).json({ success: true, message: "Prompt updated successfully", data: updatedPrompt });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePrompt = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPrompt = await Prompt.findByIdAndDelete(id);
    if (!deletedPrompt) {
      return res.status(404).json({ success: false, message: "Prompt not found" });
    }
    res.status(200).json({ success: true, message: "Prompt deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
