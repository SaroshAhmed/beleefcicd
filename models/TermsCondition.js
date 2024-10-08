const mongoose = require("mongoose");

const termsConditionSchema = new mongoose.Schema(
  {
    privateTerms:  { type: String, required: true},
    auctionTerms:  { type: String, required: true,},
  },
  {
    timestamps: true,
  }
);

const TermsCondition = mongoose.model("termsCondition", termsConditionSchema);
module.exports = TermsCondition;
