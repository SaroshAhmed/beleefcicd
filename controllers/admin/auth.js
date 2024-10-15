const Admin= require("../../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const sendEmail  = require("../../utils/emailService");
const crypto = require("crypto");

exports.register = async (req, res) => {
	try {
		const {
			name,
			email,
			password,
            role
		} = req.body;
		if (
			!name ||
			!email ||
			!password
		) {
			return res.status(403).send({
				success: false,
				message: "All fields are required",
			});
		}

		const existingUser = await Admin.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists with the same email",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await Admin.create({
			name,
			email,
			password: hashedPassword,
			role,	
		});

		return res.status(200).json({
			success: true,
			user,
			message: "User registered successfully",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "User cannot be registered. Please try again.",
		});
	}
};

//login
exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(403).json({
          success: false,
          message: "All fields are required",
        });
      }
  
      const user = await Admin.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User is not registered !!",
        });
      }
  
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: "Email or Password is wrong",
        });
      }
      const accessToken = jwt.sign(
        {
          id: user._id,
          role: user.role,
          tokenVersion: user.tokenVersion,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );
  

      const refreshToken = jwt.sign(
        {
          id: user._id,
          tokenVersion: user.tokenVersion,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );
  
      user.refreshToken = refreshToken;
      await user.save();

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,  
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: "Logged in successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};

exports.logout = (req, res) => {
    try {
        
        res.clearCookie("token");
        return res.status(200).json({
            success: true,
            message: "LOGGED OUT SUCCESSFULLY",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to log out, please try again",
        });
    }
};

exports.logoutFromAllDevices = async (req, res) => {
    try {
        const { id } = req.user; 

        
        const user = await Admin.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!",
            });
        }

        
        user.tokenVersion += 1;
        await user.save();

       
        res.clearCookie("token");

        return res.status(200).json({
            success: true,
            message: "LOGGED OUT FROM ALL DEVICES SUCCESSFULLY",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to log out from all devices, please try again",
        });
    }
};


//resetPasswordTOKEN
exports.resetPasswordToken = async (req, res) => {
    try{
        const email = req.body.email;

        const user = await Admin.findOne({email: email});
            if(!user) {
                return res.json({success:false,
                message:'Your Email is not registered with us'});
            }

        //generating... token
        let  resetPasswordToken;
        const randomString = crypto.randomBytes(20).toString('hex');

        // Hash the random string using bcrypt
        const saltRounds = 10;
        bcrypt.hash(randomString, saltRounds, function(err, hashedToken) {
            if (err) {
                console.error('Error hashing token:', err);
            } else {
                console.log('Hashed Token:', hashedToken);
                resetPasswordToken = hashedToken;
                // You can now use this hashedToken as your secure token
            }
        });

        //updating... user by adding token and expirationTime
        const updatedDetails = await Admin.findOneAndUpdate(
                                            {email:email},
                                            {
                                                resetPasswordToken,
                                                resetPasswordExpires: Date.now() + 5*60*1000,
                                            },
                                            {new:true}

        );

        //link generation...
        //create url
        const url = `http://localhost:8080/update-password/${resetPasswordToken}`;
       

        //sending... mail
        await sendEmail(email, 
            " Reset Ur Password => ",
            `Password Reset Link: ${url}`);
            console.log("token ==>", resetPasswordToken);

        //returning... final response
        return res.json({
            success:true,
            message:'Email sent successfully, please check email and change password',
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset PASSWORD mail'
        })

    }
    
}

//resetPassword

exports.resetPassword = async (req, res) => {
    try {
        // fetching... data
        const {password, confirmPassword, resetPasswordToken} = req.body;
       
        console.log("token---------------------->", resetPasswordToken);
        //validation
        if(password !== confirmPassword) {
            return res.json({
                success:false,
                message:'Password does not MATCHED',
            });
        }
        //getting.. userdetails from db using token
        const userDetails = await Admin.findOne({resetPasswordToken:resetPasswordToken});
        //if no entry - invalid token
        if(!userDetails) {
            return res.json({
                success:false, 
                message:'Token is invalid',
            });
        }
        //token time check 
        if( userDetails.resetPasswordExpires < Date.now()  ) {
                return res.json({
                    success:false,
                    message:'Token is expired, please regenerate your token',
                });
        }
        //hashing... password
        const hashedPassword = await bcrypt.hash(password, 10);

        // updating password
        await User.findOneAndUpdate(
            {resetPasswordToken:resetPasswordToken},
            {password:hashedPassword},
            {new:true},
        );
        //sending... final response
        return res.status(200).json({
            success:true,
            message:'Password reset successful',
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset pwd mail'
        })
    }
}
exports.refreshToken = async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        return res.status(403).json({
          success: false,
          message: "Access denied. No refresh token provided.",
        });
      }
  
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: "Invalid or expired refresh token.",
          });
        }
  
        const user = await Admin.findById(decoded.id);
        if (!user || user.tokenVersion !== decoded.tokenVersion) {
          return res.status(403).json({
            success: false,
            message: "Invalid refresh token version.",
          });
        }
  
        const accessToken = jwt.sign(
          {
            id: user._id,
            role: user.role,
            tokenVersion: user.tokenVersion,
          },
          process.env.ACCESS_TOKEN_SECRET, 
          { expiresIn: '15m' }
        );
  
        const newRefreshToken = jwt.sign(
          { id: user._id, tokenVersion: user.tokenVersion },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '7d' }
        );

        res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true, 
          secure: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
  
       
        return res.status(200).json({
          success: true,
          accessToken,
        });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while refreshing token.",
      });
    }
  };