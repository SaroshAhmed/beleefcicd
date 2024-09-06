const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();


exports.signup = async (req, res) => {
	try {
		const {
			name,
			email,
			password,
			confirmPassword,
			role,
		} = req.body;
		if (
			!name ||
			!email ||
			!password ||
			!confirmPassword ||
			!role
		) {
			return res.status(403).send({
				success: false,
				message: "All Fields are required",
			});
		}
		if (password !== confirmPassword) {
			return res.status(400).json({
				success: false,
				message:
					"Password and Confirm Password do not match. Please try again.",
			});
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists. Please sign in to continue.",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await User.create({
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
    try{
        const{
            email,
            password,
        } = req.body;

        if( !email || !password ){
            return res.status(403).json({
                success:false,
                message:"ALL FIELDS ARE REQUIRED",
            });
        }

        const user = await User.findOne({email})
        if(!user){
            return res.status(401).json({
                success:false,
                message:"user is not registered !!",
            });
        }

       
        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                role:user.role,
                tokenVersion: user.tokenVersion,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"24h",
            });
            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:"LOGGED IN SUCCESSFULLY",
            });
        
        }
        else{
            return res.status(401).json({
                success:false,
                message:"password doesnt matched !!",
            });
        }

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"user cannot LOGGED in, try again ",
        }) 
    }
} 

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

        
        const user = await User.findById(id);
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
