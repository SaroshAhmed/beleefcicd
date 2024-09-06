const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");
module.exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
  };
  
  //auth
  exports.auth = async(req, res, next) => {
      try{
          const token = req.cookies.token || req.body.token
                       || req.header("Authorization").replace("Bearer ", "");
  
          if(!token) {
              return res.status(401).json({
                  success:false,
                  message:'TOken is missing',
              });
          }
  
          try{
              const decode = jwt.verify(token, process.env.JWT_SECRET);
              console.log(decode);
              req.user = decode;
  
          } catch (error) {
              return res.status(401).json({
                  success:false,
                  message:'token is invalid',
              });
          }
          next();
  
      } catch(error) {
          return res.status(401).json({
              success:false,
              message:'Something went wrong while validating the token',
          });
      }
  }
  
  exports.isAdmin = async (req, res, next) => {
      try{
             if(req.user.role !== "admin") {
                 return res.status(401).json({
                     success:false,
                     message:'This is a protected route for Admin only',
                 });
             }
             next();
      }
      catch(error) {
         return res.status(500).json({
             success:false,
             message:'User role cannot be verified, please try again'
         })
      }
     }