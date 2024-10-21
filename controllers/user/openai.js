const express = require("express");
const Prompt = require("../../models/Prompt");
const { chatCompletion, imageCompletion } = require("../../utils/openai");
const generatePdf = require("../../utils/generatePdf");
const { uploadFile } = require("../../utils/helperFunctions");
const UserProperty = require("../../models/UserProperty");
exports.text = async (req, res) => {
  try {
    const { systemPrompt, userMessage } = req.body;
    const { id } = req.user;
    const { address } = req.params;

    // Validate the inputs
    if (!systemPrompt || !userMessage) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request data" });
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
    const response = await chatCompletion(prompt.description, userMessage);
    if(typeof userMessage === 'object'){
      
      const pdfBuffer = await generatePdf(response);
     
      const pdfUrl=await uploadFile(pdfBuffer,'test.pdf');
      const userProperty = await UserProperty.findOne({ address, userId: id });
      if (!userProperty) {
        return res
          .status(404)
          .json({ success: false, message: "Property not found" });
      }
      const index=userMessage?.length-1;
      userProperty.fiveStepProcess[index].key=pdfUrl?.key;
      userProperty.fiveStepProcess[index].pdfUrl=pdfUrl?.url;
      await userProperty.save();
      return res.status(200).json({ success: true, data: pdfUrl });
    }
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
    if (!systemPrompt) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid request data",
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

    const firstImage = listFiles && listFiles.length > 0 ? listFiles[0] : null;
    const response = await imageCompletion(
      // listFiles && listFiles.length ? listFiles : null,
      firstImage,
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
