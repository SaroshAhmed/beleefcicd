const User = require("../../models/User");
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('name email mobile picture company title');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateUser = async (req, res) => {
    try{
        const {
            name,
            mobile,
            company,
            title,
            id
        } = req.body;
        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        user.name = name;
        user.mobile = mobile;
        user.company = company;
        user.title = title;
        await user.save();
        res.status(200).json({success: true, data: user});
    }catch(error){
        res.status(500).json({success: false, message: error.message});
    }
};