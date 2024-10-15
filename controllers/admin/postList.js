const _ = require("lodash");
const PostList = require("../../models/PostList");
const UserProperty = require("../../models/UserProperty");
const { v4: uuidv4 } = require("uuid");
const { getMarketingPrices } = require("../../utils/helperFunctions");
const mongoose = require("mongoose");

// Get PostList by Address
exports.getPostList = async (req, res) => {
  try {
    const { propertyId } = req.query;

    const postList = await PostList.findOne({
      propertyId: new mongoose.Types.ObjectId(propertyId),
    })
      .populate("propertyId")
      .populate("userId");

      if (!postList) {
        return res
          .status(404)
          .json({ success: false, data: "PostList not found" });
      }

    const agent = postList.userId;
    const followers = postList.propertyId.followers;
    const marketing = postList.propertyId.marketing;



    const result = {
      ...postList._doc,
      followers,
      marketing,
      agent,
    };

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching PostList: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
