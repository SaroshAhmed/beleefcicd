const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const demoSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: String, default: null },
    suburbId: { type: String, default: null },
    address: { type: String, unique: true, required: true },
    listingType: { type: String, enum: ["Sale", "Sold"], required: true },
    price: { type: Number, default: null },
    postcode: { type: String },
    suburb: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    propertyType: {
      type: String,
    },
    media: { type: [Schema.Types.Mixed], default: null },
    bedrooms: { type: Number, default: null },
    bathrooms: { type: Number, default: null },
    carspaces: { type: Number, default: null },
    landArea: { type: Number, default: null },
    pool: { type: String, enum: ["Yes", "No"], default: null },
    tennisCourt: { type: String, enum: ["Yes", "No"], default: null },
    dateListed: { type: Date, default: null },
    daysListed: { type: Number, default: null },
    saleProcess: { type: String, default: null },
    logicalPrice: { type: String, default: null },
    saleHistory: { type: Schema.Types.Mixed, default: null },
    listingHistory: { type: Schema.Types.Mixed, default: null },
    shareableLink: { type: String, default: null },
    soldMatches: { type: Schema.Types.Mixed, default: null },
    areaDynamics: { type: Schema.Types.Mixed, default: null },
    recentAreaSoldProcess: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

demoSchema.index({ address: 1 }, { unique: true });
const Demo = mongoose.model("Demo", demoSchema);

module.exports = Demo;
