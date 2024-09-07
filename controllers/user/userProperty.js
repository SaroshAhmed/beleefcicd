const mongoose = require("mongoose");
const UserProperty = require("../../models/UserProperty");
const Property = require("../../models/Property");

exports.createProperty = async (req, res) => {
  const { id } = req.user;
  const { address } = req.body;

  try {
    // Check if a UserProperty with the same userId and address already exists
    const userPropertyExists = await UserProperty.findOne({
      userId: id,
      address,
    });

    if (userPropertyExists) {
      return res.status(200).json({ success: true, data: userPropertyExists });
    }

    // Find the property by address
    const property = await Property.findOne({
      address,
    });

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    // Convert the property document to a plain object
    const propertyData = property.toObject();

    const boxStatus = [
      { name: "bookAppraisal", status: "unlock" },
      { name: "priceProcess", status: "unlock" },
      { name: "postList", status: "lock" },
      { name: "authoriseSchedule", status: "unlock" },
      { name: "prepareMarketing", status: "unlock" },
      { name: "goLive", status: "unlock" },
      { name: "onMarket", status: "unlock" },
    ];

    // Create a new UserProperty document
    const userProperty = await UserProperty.create({
      userId: id,
      ...propertyData,
      boxStatus,
    });

    return res.status(200).json({ success: true, data: userProperty });
  } catch (error) {
    console.error("Error creating property:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPropertyByAddress = async (req, res) => {
  try {
    const { id } = req.user;
    const { address } = req.params;

    const userProperty = await UserProperty.findOne({
      userId: id,
      address: { $regex: new RegExp(address, "i") },
    });

    return res.status(200).json({ success: true, data: userProperty });
  } catch (error) {
    console.error("Error in getPropertyByAddress: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  const { id } = req.user; // User ID from authenticated user
  const { address, boxStatusUpdates, ...updates } = req.body; // Destructure boxStatusUpdates and other updates

  try {
    // Find the property by userId and address
    const userProperty = await UserProperty.findOne({
      userId: id,
      address: { $regex: new RegExp(address, "i") }, // Case-insensitive address match
    });

    if (!userProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found for this user",
      });
    }

    // Initialize the update object for other property fields
    let updateQuery = {};

    // Add other property fields to update if provided
    if (Object.keys(updates).length > 0) {
      updateQuery = { ...updateQuery, ...updates };
    }

    // If boxStatusUpdates is provided, update specific statuses within the boxStatus array
    if (boxStatusUpdates && Array.isArray(boxStatusUpdates)) {
      boxStatusUpdates.forEach((update, index) => {
        const { name, status } = update;
        updateQuery[`boxStatus.$[element${index}].status`] = status; // Use `element0`, `element1`, etc.
      });
    }

    // Generate unique arrayFilters for each element in boxStatusUpdates
    const arrayFilters = boxStatusUpdates
      ? boxStatusUpdates.map((update, index) => ({
          [`element${index}.name`]: update.name, // Use unique element filters
        }))
      : [];

    // Perform the update using $set and arrayFilters
    const updatedProperty = await UserProperty.findOneAndUpdate(
      { userId: id, address: { $regex: new RegExp(address, "i") } },
      {
        $set: updateQuery,
      },
      {
        arrayFilters: arrayFilters, // Apply arrayFilters based on unique placeholders
        new: true, // Return the updated document
      }
    );

    if (!updatedProperty) {
      return res.status(404).json({
        success: false,
        message: "Failed to update the property",
      });
    }

    return res.status(200).json({ success: true, data: updatedProperty });
  } catch (error) {
    console.error("Error updating property: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};