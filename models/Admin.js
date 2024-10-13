const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["superAdmin", "admin"],
    default: "admin",
  },
  resetPasswordToken :{
    type:String,
  },
  resetPasswordExpires: {
    type:Date,
  },
  tokenVersion: { type: Number, default: 0 },
}, {
  timestamps: true
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
