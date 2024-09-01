const UserProperty = require("../../models/UserProperty");
const Property = require("../../models/Property");

exports.createProperty = async (req, res) => {
  const { id } = req.user;
  const { address } = req.body;

  try {
    // Check if a UserProperty with the same userId and address already exists
    const userPropertyExists = await UserProperty.findOne({
      userId: id,
      address,
    });

    if (userPropertyExists) {
      return res.status(200).json({ success: true, data: userPropertyExists });
    }

    // Find the property by address
    const property = await Property.findOne({
      address,
    });

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    // Convert the property document to a plain object
    const propertyData = property.toObject();

    const boxStatus = [
      { name: "bookAppraisal", status: "unlock" },
      { name: "priceProcess", status: "unlock" },
      { name: "postList", status: "lock" },
      { name: "authoriseSchedule", status: "unlock" },
      { name: "prepareMarketing", status: "unlock" },
      { name: "goLive", status: "unlock" },
      { name: "onMarket", status: "unlock" },
    ];

    // Create a new UserProperty document
    const userProperty = await UserProperty.create({
      userId: id,
      ...propertyData,
      boxStatus,
    });

    return res.status(200).json({ success: true, data: userProperty });
  } catch (error) {
    console.error("Error creating property:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPropertiesAddress = async (req, res) => {
  try {
    const properties = await Property.find(
      {},
      {
        address: 1,
      }
    );

    return res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.error("Error fetching properties:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getPropertyByAddress = async (req, res) => {
  try {
    const { id } = req.user;
    const { address } = req.params;

    const userProperty = await UserProperty.findOne({
      userId: id,
      address,
    });

    return res.status(200).json({ success: true, data: userProperty });
  } catch (error) {
    console.error("Error in getPropertyByAddress: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
