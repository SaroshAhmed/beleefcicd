const express = require("express");
const QuickSearch = require("../../models/QuickSearch");
const { v4: uuidv4 } = require("uuid");
const { REACT_APP_FRONTEND_URL } = require("../../config");

exports.createQuickSearch = async (req, res) => {
  try {
    const {
      property,
      saleProperties,
      soldProperties,
      areaDynamics,
      pieChartData,
      agent,
    } = req.body;

    // Create a unique identifier for the property (could also be a slug or hash)
    const uniqueId = uuidv4();

    // Save the property with the uniqueId in the database
    const quickSearch = new QuickSearch({
      shareableLink: uniqueId,
      property,
      saleProperties,
      soldProperties,
      areaDynamics,
      pieChartData,
      agent,
    });

    await quickSearch.save();

    const shareableLink = `${REACT_APP_FRONTEND_URL}/share/${uniqueId}`;
    res.status(200).json({ success: true, data: shareableLink });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuickSearch = async (req, res) => {
  try {
    const { uuid } = req.params;

    const quickSearch = await QuickSearch.findOne({ shareableLink: uuid });

    if (!quickSearch) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    res.status(200).json({ success: true, data: quickSearch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
