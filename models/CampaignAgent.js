const mongoose = require("mongoose");

const campaignAgentSchema = new mongoose.Schema({
  apiConsumerListingId: { type: String, required: true },
  officeOwnershipGroupUniqueIdentifier: { type: String, required: true },
  status: { type: String, required: true },
  key: { type: String, required: true },
  timestamp: { type: String, required: true },
  signature: { type: String, required: true },
});

const CampaignAgent = mongoose.model("CampaignAgent", campaignAgentSchema);

module.exports = CampaignAgent;
