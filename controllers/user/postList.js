const _ = require("lodash");
const PostList = require("../../models/PostList");
const UserProperty = require("../../models/UserProperty");
const { v4: uuidv4 } = require("uuid");
const { getMarketingPrices } = require("../../utils/helperFunctions");
const mongoose = require("mongoose");

// Create a new PostList
exports.createPostList = async (req, res) => {
  try {
    const { id, company } = req.user;

    // Create a unique identifier for the property (could also be a slug or hash)
    const uniqueId = uuidv4();

    const {
      address,
      suburb,
      ownerSituation,
      keyFeatures,
      commissionFee,
      improvementMaxOutcome,
      logicalPrice,
      soldProperties,
      agent,
      processChain,
      engagedPurchaser,
      vendors,
      recommendedSaleProcess,
      propertyId,
    } = req.body;

    // Check if a UserProperty with the same userId and address already exists
    const userPostlistExists = await PostList.findOne({
      userId: id,
      address,
    });

    if (userPostlistExists) {
      return res.status(200).json({ success: true, data: userPostlistExists });
    }

    // Check for required fields
    if (
      !address ||
      !ownerSituation ||
      !keyFeatures ||
      !improvementMaxOutcome ||
      !soldProperties ||
      !agent ||
      !suburb
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // If vendors is null or undefined, set it to a default object
    const defaultVendors = [
      {
        firstName: null,
        lastName: null,
        email: null,
        mobile: null,
      },
    ];

    // Use default vendors if vendors is null or undefined
    const finalVendors = vendors && vendors.length ? vendors : defaultVendors;

    const marketing = await getMarketingPrices(company, logicalPrice, suburb);
    const newPostList = new PostList({
      userId: id,
      address,
      suburb,
      ownerSituation,
      keyFeatures,
      commissionFee,
      improvementMaxOutcome,
      logicalPrice,
      soldProperties,
      shareableLink: uniqueId,
      agent,
      processChain,
      engagedPurchaser,
      vendors: finalVendors,
      recommendedSaleProcess,
      propertyId,
    });

    const savedPostList = await newPostList.save();

    await UserProperty.updateOne(
      { _id: new mongoose.Types.ObjectId(propertyId) },
      { $set: { marketing } }
    );

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
      return res
        .status(400)
        .json({ success: false, message: "Field path missing" });
    }

    // Handle remove logic
    if (remove) {
      // Backend logic to handle deletion for marketingItems
      if (fieldPath.startsWith("marketingItems")) {
        const arrayIndexMatch = fieldPath.match(/marketingItems\[(\d+)\]/);
        if (arrayIndexMatch) {
          const index = parseInt(arrayIndexMatch[1], 10);

          // Use $unset to remove the item from the array at the specific index
          const unsetQuery = { $unset: { [`marketingItems.${index}`]: 1 } };
          await PostList.findByIdAndUpdate(id, unsetQuery);

          // Pull any null elements out after the unset
          const updatedPostList = await PostList.findByIdAndUpdate(
            id,
            { $pull: { marketingItems: null } }, // Remove null values from the array
            { new: true }
          );

          return res.status(200).json({ success: true, data: updatedPostList });
        } else {
          return res.status(400).json({
            success: false,
            message: "Invalid field path for removal",
          });
        }
      }

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
        return res
          .status(400)
          .json({ success: false, message: "Invalid field path for removal" });
      }
    }

    // Handle soldProperties array update
    if (fieldPath.startsWith("soldProperties")) {
      // Extract the array index
      const arrayIndexMatch = fieldPath.match(
        /soldProperties\[(\d+)\]\.property\.(.*)/
      );
      if (arrayIndexMatch) {
        const index = arrayIndexMatch[1]; // Extract array index (e.g., 0, 1, 2)
        const nestedField = arrayIndexMatch[2]; // The specific property field (e.g., 'address', 'price')

        // Build the dynamic update path
        const updateObject = {
          [`soldProperties.${index}.property.${nestedField}`]: newValue,
        };

        const updatedPostList = await PostList.findByIdAndUpdate(
          id,
          { $set: updateObject },
          { new: true } // Return the updated document
        );

        if (!updatedPostList) {
          return res
            .status(404)
            .json({ success: false, message: "PostList not found" });
        }

        return res.status(200).json({ success: true, data: updatedPostList });
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid soldProperties field path",
        });
      }
    }

    // Handle `vendors` array updates (new logic)
    if (fieldPath.startsWith("vendors")) {
      const arrayIndexMatch = fieldPath.match(/vendors\[(\d+)\]\.(.*)/);
      if (arrayIndexMatch) {
        const index = arrayIndexMatch[1]; // Extract vendor array index
        const nestedField = arrayIndexMatch[2]; // Specific vendor field (e.g., 'firstName', 'lastName')

        // Build the dynamic update path for vendors
        const updateObject = {
          [`vendors.${index}.${nestedField}`]: newValue,
        };

        const updatedPostList = await PostList.findByIdAndUpdate(
          id,
          { $set: updateObject },
          { new: true } // Return the updated document
        );

        if (!updatedPostList) {
          return res
            .status(404)
            .json({ success: false, message: "PostList not found" });
        }

        return res.status(200).json({ success: true, data: updatedPostList });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid vendors field path" });
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
      return res
        .status(404)
        .json({ success: false, message: "PostList not found" });
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
    }).populate("propertyId").populate("userId");

    const agent=postList.userId
    const followers = postList.propertyId.followers;
    const marketing = postList.propertyId.marketing;

    if (!postList) {
      return res
        .status(404)
        .json({ success: false, message: "PostList not found" });
    }

    const result = {
      ...postList._doc,
      followers,
      marketing,
      agent
    };

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching PostList: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get PostList by Shareable Link
exports.getPostListByShareableLink = async (req, res) => {
  try {
    const { shareableLink } = req.params;

    const postList = await PostList.findOne({
      shareableLink,
    }).populate("propertyId").populate("userId");



    if (!postList) {
      return res
        .status(404)
        .json({ success: false, message: "PostList not found" });
    }

    const agent=postList.userId
    const followers = postList.propertyId.followers;
    const marketing = postList.propertyId.marketing;

    const result = {
      ...postList._doc,
      followers,
      marketing,
      agent
    };

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching PostList by Shareable Link: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
