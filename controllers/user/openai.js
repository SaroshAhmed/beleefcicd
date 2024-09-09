const express = require("express");
const router = express.Router();
const Prompt = require("../models/Prompt");

exports.text = async (req, res) => {
  try {
    const { systemPrompt, userMessage } = req.body;

    const prompt = await Prompt.findOne({ name: systemPrompt });
    console.log(prompt);
    if (!prompt.rows.length || !userMessage) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request data" });
    }

    const response = await chatbot(result.rows[0].description, userMessage);

    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.image = async (req, res) => {
  try {
    const fileKeys = Object.keys(req.files);
    const listFiles = fileKeys.map((key) => req.files[key]);

    const prompt =
      `Your output should be in json containing heading and description.
        { heading:"",
          description:""
        }` + process.env.POSTLIST_PROMPT_IMAGE_UPLOAD;
    const response = await analyzeImagesAIFiles(listFiles, prompt);
    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error("Error method - openAiRawImages", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
