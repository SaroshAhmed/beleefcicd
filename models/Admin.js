const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String},
  password: String,
  confirmPassword: String,
  token :{
    type:String,
  },
  resetPasswordExpires: {
    type:Date,
  },
  tokenVersion: { type: Number, default: 0 },
}, {
  timestamps: true
});

const User = mongoose.model('Admin', adminSchema);
module.exports = User;
