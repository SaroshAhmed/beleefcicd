const User = require("../../models/User");

// Update Conjunction Agent for a User
exports.updateConjunctionAgent = async (req, res) => {
  const { userId } = req.params;
  const { conjunctionAgent } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.conjunctionAgent = conjunctionAgent;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Conjunction Agent for a User
exports.getConjunctionAgent = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user.conjunctionAgent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Conjunction Agent for a User
exports.deleteConjunctionAgent = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.conjunctionAgent = null; // Clear the field
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
