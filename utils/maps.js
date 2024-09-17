const fs = require("fs");
const axios = require("axios");
const { GOOGLE_MAPS_API_KEY } = require("../config");

async function getMapStaticImage(lat, lon) {
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=20&size=800x600&maptype=satellite&markers=color:red%7Clabel:C%7C${lat},${lon}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await axios.get(mapUrl, { responseType: "arraybuffer" });
    // const imagePath = `map_image_${lat}_${lon}.png`;
    // fs.writeFileSync(imagePath, response.data);
    const base64Image = response.data.toString("base64");
    const encodedImage = `data:image/jpeg;base64,${base64Image}`;

    return encodedImage; // Return the encoded image
  } catch (error) {
    console.error("Error fetching map image:", error);
    throw error;
  }
}

module.exports = {
  getMapStaticImage,
};
