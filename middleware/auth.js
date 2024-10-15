const jwt = require("jsonwebtoken");
require("dotenv").config();
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
                  message:'Token is missing',
              });
          }
  
          try{
              const decode = jwt.verify(token, process.env.SECRET_KEY);
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
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      
      req.user = decoded;
      
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }
     }