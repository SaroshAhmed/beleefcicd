const _ = require("lodash");
const PostList = require("../../models/PostList");
const { v4: uuidv4 } = require("uuid");

// Create a new PostList
exports.createPostList = async (req, res) => {
  try {
    const { id } = req.user;

    // Create a unique identifier for the property (could also be a slug or hash)
    const uniqueId = uuidv4();

    const {
      address,
      ownerSituation,
      keyFeatures,
      commissionFee,
      improvementMaxOutcome,
      logicalPrice,
      soldProperties,
    } = req.body;

    // Check for required fields
    if (
      !address ||
      !ownerSituation ||
      !keyFeatures ||
      !improvementMaxOutcome ||
      !soldProperties
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const newPostList = new PostList({
      userId:id,
      address,
      ownerSituation,
      keyFeatures,
      commissionFee,
      improvementMaxOutcome,
      logicalPrice,
      soldProperties,
      shareableLink: uniqueId,
    });

    const savedPostList = await newPostList.save();
    return res.status(201).json({ success: true, data: savedPostList });
  } catch (error) {
    console.error("Error creating PostList: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePostList = async (req, res) => {
    try {
      const { id } = req.params; // ID of the PostList to update
      const { fieldPath, newValue, remove } = req.body; // The fieldPath, newValue, and optional remove flag
  
      if (!fieldPath) {
        return res.status(400).json({ success: false, message: "Field path missing" });
      }
  
      // Handle remove logic
      if (remove) {
        // Handle removing items from soldProperties array
        const arrayIndexMatch = fieldPath.match(/soldProperties\[(\d+)\]/);
        if (arrayIndexMatch) {
          const index = parseInt(arrayIndexMatch[1], 10);
  
          // Unset the specific soldProperties element by index
          const unsetQuery = { $unset: { [`soldProperties.${index}`]: 1 } };
          await PostList.findByIdAndUpdate(id, unsetQuery);
  
          // Pull any null elements out
          const updatedPostList = await PostList.findByIdAndUpdate(
            id,
            { $pull: { soldProperties: null } }, // Remove nulls from the array
            { new: true }
          );
  
          return res.status(200).json({ success: true, data: updatedPostList });
        } else {
          return res.status(400).json({ success: false, message: "Invalid field path for removal" });
        }
      }
  
      // Handle soldProperties array update
      if (fieldPath.startsWith("soldProperties")) {
        // Extract the array index
        const arrayIndexMatch = fieldPath.match(/soldProperties\[(\d+)\]\.property\.(.*)/);
        if (arrayIndexMatch) {
          const index = arrayIndexMatch[1]; // Extract array index (e.g., 0, 1, 2)
          const nestedField = arrayIndexMatch[2]; // The specific property field (e.g., 'address', 'price')
  
          // Build the dynamic update path
          const updateObject = { [`soldProperties.${index}.property.${nestedField}`]: newValue };
  
          const updatedPostList = await PostList.findByIdAndUpdate(
            id,
            { $set: updateObject },
            { new: true } // Return the updated document
          );
  
          if (!updatedPostList) {
            return res.status(404).json({ success: false, message: "PostList not found" });
          }
  
          return res.status(200).json({ success: true, data: updatedPostList });
        } else {
          return res.status(400).json({ success: false, message: "Invalid soldProperties field path" });
        }
      }
  
      // Handle other non-array fields
      const updateObject = { [fieldPath]: newValue }; // Create the dynamic update object
  
      const updatedPostList = await PostList.findByIdAndUpdate(
        id,
        { $set: updateObject },
        { new: true } // Return the updated document
      );
  
      if (!updatedPostList) {
        return res.status(404).json({ success: false, message: "PostList not found" });
      }
  
      return res.status(200).json({ success: true, data: updatedPostList });
    } catch (error) {
      console.error("Error updating PostList: ", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  

// Get PostList by Address
exports.getPostListByAddress = async (req, res) => {
  try {
    const { id } = req.user;
    const { address } = req.params;
    const postList = await PostList.findOne({
      userId: id,
      address,
      isDeleted: false,
    });

    if (!postList) {
      return res
        .status(404)
        .json({ success: false, message: "PostList not found" });
    }

    return res.status(200).json({ success: true, data: postList });
  } catch (error) {
    console.error("Error fetching PostList: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get PostList by Shareable Link
exports.getPostListByShareableLink = async (req, res) => {
  try {
    const { id } = req.user;
    const { shareableLink } = req.params;
    const postList = await PostList.findOne({
      userId: id,
      shareableLink,
      isDeleted: false,
    });

    if (!postList) {
      return res
        .status(404)
        .json({ success: false, message: "PostList not found" });
    }

    return res.status(200).json({ success: true, data: postList });
  } catch (error) {
    console.error("Error fetching PostList by Shareable Link: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
