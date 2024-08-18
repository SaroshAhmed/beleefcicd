const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const errorLogSchema = new Schema(
  {
    error: { type: String, required: true },
    api: { type: String },
    type: { type: String, required: true },
    details: { type: Object, default: {} },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

module.exports = ErrorLog;
