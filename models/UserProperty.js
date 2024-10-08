const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vendorDetailsSchema = new mongoose.Schema({
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  email: { type: String, match: /.+\@.+\..+/, default: null },
  mobile: { type: String, default: null },
});

const mediaSchema = new Schema({
  category: { type: String },
  type: { type: String },
  url: { type: String },
});

const boxSchema = new Schema(
  {
    name: {
      type: String,
      enum: [
        "bookAppraisal",
        "priceProcess",
        "postList",
        "authoriseSchedule",
        "prepareMarketing",
        "goLive",
        "onMarket",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["complete", "unlock", "lock"],
      required: true,
    },
  },
  { timestamps: true }
);

const userPropertySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fkPropertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    propertyId: { type: String, default: null },
    listingId: { type: String },
    address: { type: String, required: true },
    listingType: { type: String, enum: ["Sale", "Sold"], required: true },
    price: { type: Number, default: null },
    postcode: { type: String },
    suburb: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    propertyType: {
      type: String,
      // enum: [
      //   "ApartmentUnitFlat",
      //   "Duplex",
      //   "House",
      //   "Terrace",
      //   "Townhouse",
      //   "VacantLand",
      //   "Villa",
      // ],
    },
    battleAxe: { type: String, enum: ["Yes", "No"], default: null },
    media: { type: [mediaSchema], default: null },
    bedrooms: { type: Number, default: null },
    bathrooms: { type: Number, default: null },
    carspaces: { type: Number, default: null },
    landArea: { type: Number, default: null },
    buildingArea: { type: Number, default: null },
    buildType: {
      type: String,
      enum: ["1 storey", "2 storey", "3 storey", "4+ storey"],
      default: null,
    },
    yearBuilt: { type: Number, default: null },
    wallMaterial: {
      type: String,
      enum: ["Brick", "Double brick", "Clad", "Fibro", "Hebel"],
      default: null,
    },
    features: [{ type: String, default: null }],
    pool: { type: String, enum: ["Yes", "No"], default: null },
    tennisCourt: { type: String, enum: ["Yes", "No"], default: null },
    waterViews: {
      type: String,
      enum: [
        "No",
        "Water views",
        "Deep waterfront with jetty",
        "Tidal waterfront with jetty",
        "Waterfront reserve",
      ],
      default: null,
    },
    dateListed: { type: Date, default: null },
    daysListed: { type: Number, default: null },
    vendorDetails: [vendorDetailsSchema],
    finishes: {
      type: String,
      enum: ["High-end finishes", "Updated", "Original"],
      default: null,
    },
    streetTraffic: {
      type: String,
      enum: ["Low traffic", "Moderate traffic", "High traffic"],
      default: null,
    },
    topography: {
      type: [String],
      enum: [
        "High side",
        "Low side",
        "Level block",
        "Irregular block",
        "Unusable land",
      ],
      default: null,
    },
    additionalInformation: { type: String, default: null },
    saleProcess: { type: String, default: null },
    beleefSaleProcess: {
      type: String,
      enum: [
        "Private treaty",
        "Private treaty adjustment",
        "Auction",
        "Not sold at auction",
        "Withdrawn",
      ],
      default: null,
    },
    frontage: { type: Number, default: null },
    configurationPlan: { type: String, default: null },
    grannyFlat: { type: String, enum: ["Yes", "No"], default: null },
    developmentPotential: {
      type: String,
      enum: ["Childcare", "Duplex site", "Townhouse site", "Unit site"],
      default: null,
    },
    description: { type: String, default: null },
    headline: { type: String, default: null },
    history: { type: Schema.Types.Mixed, default: null },
    isNewDevelopment: { type: Boolean, default: null },
    canonicalUrl: { type: String, default: null },
    urlSlug: { type: String, default: null },
    channel: {
      type: String,
      enum: ["residential", "commercial", "business"],
      default: null,
    },
    listingStatus: {
      type: String,
      enum: [
        "unknown",
        "archived",
        "underOffer",
        "sold",
        "leased",
        "newDevelopment",
        "recentlyUpdated",
        "new",
        "live",
        "pending",
        "depositTaken",
      ],
      default: null,
    },
    saleMode: {
      type: String,
      enum: ["buy", "rent", "share", "sold", "leased", "archived"],
      default: null,
    },
    logicalPrice: { type: String, default: null },
    logicalReasoning: { type: String, default: null },
    engagedPurchaser: { type: String, default: null },
    microPockets: { type: String, default: null },
    recommendedSales: {
      type: [Schema.Types.Mixed],
      default: null,
    },
    recommendedSold: {
      type: [Schema.Types.Mixed],
      default: null,
    },
    recentAreaSoldProcess: {
      type: [Schema.Types.Mixed],
      default: null,
    },
    currentAreaProcess: {
      type: [Schema.Types.Mixed],
      default: null,
    },
    duplexProperties: {
      type: [Schema.Types.Mixed],
      default: null,
    },
    recommendedSaleProcess: { type: String, default: null },
    highEndProperties: {
      type: [Schema.Types.Mixed],
      default: null,
    },
    lowEndProperties: {
      type: [Schema.Types.Mixed],
      default: null,
    },
    boxStatus: { type: [boxSchema], default: null },
    processChain: {
      type: [Schema.Types.Mixed],
      default: null,
    },
    marketingPrice: {
      type: String,
    },
    marketingItems: {
      type: [String],
    },
    saleHistory: { type: Schema.Types.Mixed, default: null },
    listingHistory: { type: Schema.Types.Mixed, default: null },
    rentalHistory: { type: Schema.Types.Mixed, default: null },
    isCleaned: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userPropertySchema.pre("validate", function (next) {
  // Convert suburb to uppercase
  if (this.suburb) {
    this.suburb = this.suburb.toUpperCase();
  }

  if (this.developmentPotential === "") {
    this.developmentPotential = null;
  }

  // Convert 'Semi-Detached' to 'Duplex' in propertyType
  if (this.propertyType === "Semi-Detached") {
    this.propertyType = "Duplex";
  }

  if (this.propertyType === "Apartment") {
    this.propertyType = "ApartmentUnitFlat";
  }

  if (this.propertyType === "Land") {
    this.propertyType = "VacantLand";
  }

  next();
});

const UserProperty = mongoose.model("UserProperty", userPropertySchema);

module.exports = UserProperty;
