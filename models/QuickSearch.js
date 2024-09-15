const mongoose = require("mongoose");
const { Schema } = mongoose;

const quickSearchSchema = new Schema(
  {
    shareableLink: {
      type: String,
      unique: true,
      required: true,
    },
    property: {
      type: Schema.Types.Mixed,
      required: true,
    },
    saleProperties: {
      type: [Schema.Types.Mixed],
      required: true,
    },
    soldProperties: {
      type: [Schema.Types.Mixed],
      required: true,
    },
    areaDynamics: {
      type:  Schema.Types.Mixed,
      required: true,
    },
    pieChartData: {
      type: [Array],
      required: true,
    },
    agent: {
      type:  Schema.Types.Mixed,
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

const QuickSearch = mongoose.model("QuickSearch", quickSearchSchema);

module.exports = QuickSearch;
