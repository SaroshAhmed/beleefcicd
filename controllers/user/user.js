const User = require("../../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("name email phone picture mobile");

    if (!users) {
      return res
        .status(404)
        .json({ success: false, message: "Users not found" });
    }

    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching PostList: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
