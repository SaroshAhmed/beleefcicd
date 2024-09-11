const express = require("express");
const Prompt = require("../../models/Prompt");
const { chatCompletion, imageCompletion } = require("../../utils/openai");
exports.text = async (req, res) => {
  try {
    const { systemPrompt, userMessage } = req.body;

    // Validate the inputs
    if (!systemPrompt || !userMessage) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request data" });
    }

    // Find the prompt in the database
    const prompt = await Prompt.findOne({ name: systemPrompt });
    console.log(prompt);
    // Check if the prompt exists
    if (!prompt) {
      return res
        .status(404)
        .json({ success: false, message: "Prompt not found" });
    }

    // Check if the prompt has a description field
    if (!prompt.description) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid prompt data" });
    }

    // Call the chatbot function with the description and user message
    const response = await chatCompletion(prompt.description, userMessage);

    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.image = async (req, res) => {
  try {
    const listFiles = req.files;

    const { systemPrompt, userMessage } = req.body;

    // Validate the inputs
    if (!systemPrompt || !userMessage || !listFiles.length) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid request data or no files uploaded",
        });
    }

    // Find the prompt in the database
    const prompt = await Prompt.findOne({ name: systemPrompt });

    // Check if the prompt exists
    if (!prompt) {
      return res
        .status(404)
        .json({ success: false, message: "Prompt not found" });
    }

    // Check if the prompt has a description field
    if (!prompt.description) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid prompt data" });
    }

    const response = await imageCompletion(
      listFiles,
      prompt.description,
      userMessage,
      (jsonFormat = true)
    );
    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error("Error method - openAiRawImages", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
