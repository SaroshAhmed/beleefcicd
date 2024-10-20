const express = require("express");
const QuickSearch = require("../../models/QuickSearch");
const { v4: uuidv4 } = require("uuid");
const { REACT_APP_FRONTEND_URL } = require("../../config");

exports.createQuickSearch = async (req, res) => {
  try {
    const {id}=req.user
    const {
      property,
      saleProperties,
      soldProperties,
      areaDynamics,
      pieChartData,
    } = req.body;

    // Create a unique identifier for the property (could also be a slug or hash)
    const uniqueId = uuidv4();

    // Save the property with the uniqueId in the database
    const quickSearch = new QuickSearch({
      userId:id,
      shareableLink: uniqueId,
      property,
      saleProperties,
      soldProperties,
      areaDynamics,
      pieChartData,
    });

    await quickSearch.save();

    const shareableLink = `${REACT_APP_FRONTEND_URL}/quick-search/share/${uniqueId}`;
    res.status(200).json({ success: true, data: shareableLink });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuickSearch = async (req, res) => {
  try {
    const { uuid } = req.params;

    const quickSearch = await QuickSearch.findOne({ shareableLink: uuid }).populate("userId");

    if (!quickSearch) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    const agent = {
      name: quickSearch.userId.name,
      email: quickSearch.userId.email,
      picture: quickSearch.userId.picture
    };

    const result = {
      ...quickSearch._doc,
      agent,
    };

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateQuickSearch = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { property, saleProperties, soldProperties, areaDynamics, pieChartData, agent } = req.body;

    // Find the QuickSearch document by shareableLink (uuid)
    const quickSearch = await QuickSearch.findOne({ shareableLink: uuid });

    if (!quickSearch) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Update root-level fields if provided in the request body
    if (property) quickSearch.property = property;
    if (saleProperties) quickSearch.saleProperties = saleProperties;
    if (areaDynamics) quickSearch.areaDynamics = areaDynamics;
    if (pieChartData) quickSearch.pieChartData = pieChartData;

    // Update soldProperties array (either replace or modify)
    if (soldProperties && Array.isArray(soldProperties)) {
      soldProperties.forEach((newSoldProperty) => {
        // Find the existing sold property by some identifier (e.g., _id or unique field)
        const existingSoldProperty = quickSearch.soldProperties.find(
          (sp) => sp._id.toString() === newSoldProperty._id
        );

        if (existingSoldProperty) {
          // Update fields of the existing sold property
          existingSoldProperty.property = newSoldProperty.property || existingSoldProperty.property;
          existingSoldProperty.score = newSoldProperty.score || existingSoldProperty.score;
          existingSoldProperty.keyMatches = newSoldProperty.keyMatches || existingSoldProperty.keyMatches;
        } else {
          // If it's a new sold property, push it to the array
          quickSearch.soldProperties.push(newSoldProperty);
        }
      });
    }

    // Save the updated document
    await quickSearch.save();

    res.status(200).json({ success: true, data: quickSearch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
