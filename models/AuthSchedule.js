const mongoose = require("mongoose");
const { Schema } = mongoose;

const authScheduleSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "UserProperty",
      required: true,
    },
    address: { type: String },
    vendors: {
      type: [Schema.Types.Mixed],
    },
    solicitor: {
      type: Schema.Types.Mixed,
    },
    agent: {
      type: Schema.Types.Mixed,
    },
    commissionFee: { type: String },
    commissionRange: { type: String },
    startPrice: { type: String },
    endPrice: { type: String },
    saleProcess: { type: String },
    status: { type: String },
    terms: { type: String },
    marketing: { type: Schema.Types.Mixed },
    recommendedSales: {
      type: [Schema.Types.Mixed],
    },
    recommendedSold: {
      type: [Schema.Types.Mixed],
    },
    agreementId: { type: String },
  },
  {
    timestamps: true,
  }
);

const AuthSchedule = mongoose.model("AuthSchedule", authScheduleSchema);

module.exports = AuthSchedule;
