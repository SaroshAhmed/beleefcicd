const Property = require('../../models/Property');

// Get all properties with specific fields
const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({}, {
      address: 1,
      suburb: 1,
      postcode: 1,
      price: 1,
      isCleaned: 1,
      dateListed: 1,
      daysListed: 1,
      listingType: 1,
      propertyType: 1
    });

    return res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.error("Error fetching properties:", error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get a property by ID
const getPropertyById = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    return res.status(200).json({ success: true, data: property });
  } catch (error) {
    console.error(`Error fetching property with ID ${id}:`, error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProperties,
  getPropertyById
};
