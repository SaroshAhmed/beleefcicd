const mongoose = require("mongoose");
const { Schema } = mongoose;

const postListSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    address: { type: String, required: true },
    ownerSituation: { type: String, required: true },
    keyFeatures: { type: Schema.Types.Mixed, required: true },
    commissionFee: { type: String },
    improvementMaxOutcome: { type: String, required: true },
    logicalPrice: { type: String },
    soldProperties: {
      type: [Schema.Types.Mixed],
      required: true,
    },
    shareableLink: {
      type: String,
      unique: true,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const PostList = mongoose.model("PostList", postListSchema);

module.exports = PostList;
