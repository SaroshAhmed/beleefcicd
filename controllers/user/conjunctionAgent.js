// PUT /api/conjunction-agent/:userId
 // Adjust the path to your User model

const User = require("../../models/User");

exports.updateConjunctionAgent = async (req, res) => {
    const { userId } = req.params;
    const { conjunctionAgent } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.conjunctionAgent = conjunctionAgent;
        await user.save();

        res.status(200).json({ message: 'Conjunction agent updated', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/conjunction-agent/:userId


exports.getConjunctionAgent = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ conjunctionAgent: user.conjunctionAgent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/conjunction-agent/:userId

exports.updateConjunctionAgent = async (req, res) => {
    const { userId } = req.params;
    const { conjunctionAgent } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.conjunctionAgent = conjunctionAgent;
        await user.save();

        res.status(200).json({ message: 'Conjunction agent updated', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/conjunction-agent/:userId
exports.deleteConjunctionAgent = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.conjunctionAgent = null; // Clear the field
        await user.save();

        res.status(200).json({ message: 'Conjunction agent deleted', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

