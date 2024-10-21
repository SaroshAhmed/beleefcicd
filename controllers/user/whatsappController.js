const { createWhatsAppGroup } = require('../../utils/whatsappService');


const createGroup = async (req, res) => {
  try {
    const { participants } = req.body;

    const groupName = 'Ausrealty Group';

    const groupInfo = await createWhatsAppGroup(groupName, participants);

    res.status(201).json(groupInfo);
  } catch (error) {
    console.error("Error in createGroup controller:", error);
    res.status(500).json({ error: "Failed to create WhatsApp group." });
  }
};

module.exports = { createGroup };
