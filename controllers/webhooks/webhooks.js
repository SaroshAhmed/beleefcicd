const CampaignAgent = require("../../models/CampaignAgent");

// Controller to handle webhook requests
exports.campaignAgent= async (req, res) => {
  try {
    const {
      apiConsumerListingId,
      officeOwnershipGroupUniqueIdentifier,
      status,
      key,
      timestamp,
      signature,
    } = req.query;

    // Ensure all required query parameters are present
    if (
      !apiConsumerListingId ||
      !officeOwnershipGroupUniqueIdentifier ||
      !status ||
      !key ||
      !timestamp ||
      !signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required query parameters.",
      });
    }

    // Parse the timestamp to a valid Date object
    const parsedTimestamp = new Date(decodeURIComponent(timestamp));

    // Create and save a new CampaignAgent document
    const campaignAgent = new CampaignAgent({
      apiConsumerListingId,
      officeOwnershipGroupUniqueIdentifier,
      status,
      key,
      timestamp: parsedTimestamp,
      signature,
    });

    await campaignAgent.save();

    return res.status(200).json({
      success: true,
      message: "Webhook data successfully received and processed.",
    });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
