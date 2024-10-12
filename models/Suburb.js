const mongoose = require("mongoose");
const { Schema } = mongoose;

const suburbSchema = new mongoose.Schema(
  {
    suburb: { type: String, unique: true, required: true },
    description: { type: String },
    postcode: { type: String, required: true },
    state: { type: String, required: false, default: "NSW" },
    houseStats: {
      type: [
        {
          year: { type: Number, default: null },
          medianSalePrice: { type: Number, default: null },
          annualSalesVolume: { type: Number, default: null },
          averageDaysOnMarket: { type: Number, default: null },
          suburbGrowth: { type: String, default: null },
          highDemandArea: { type: String, default: null },
        },
      ],
      default: [],
    },
    unitStats: {
      type: [
        {
          year: { type: Number, default: null },
          medianSalePrice: { type: Number, default: null },
          annualSalesVolume: { type: Number, default: null },
          averageDaysOnMarket: { type: Number, default: null },
          suburbGrowth: { type: String, default: null },
          highDemandArea: { type: String, default: null },
        },
      ],
      default: [],
    },
    listingsFetched: { type: Boolean, default: false },
    listingsFetchedAt: { type: Date, default: null },
    reaPrice: { type: String },
    domainPrice: { type: [Schema.Types.Mixed] },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Add index for the 'suburb' field
suburbSchema.index({ suburb: 1 });

const Suburb = mongoose.model("Suburb", suburbSchema);

module.exports = Suburb;
