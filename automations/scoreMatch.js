function calculateWeightedScore(sourceLat, sourceLon, targetLat, targetLon) {
  // Earth's radius in kilometers
  const earthRadiusKm = 6371;

  // Haversine formula to calculate the distance between two points
  const dLat = radians(targetLat - sourceLat);
  const dLon = radians(targetLon - sourceLon);
  const lat1 = radians(sourceLat);
  const lat2 = radians(targetLat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.asin(Math.sqrt(a));
  const distance = earthRadiusKm * c;

  // Conditional weighting based on distance
  let weight = 0;
  if (distance <= 0.8) {
    weight = 0.1;
  } else if (distance > 0.8 && distance <= 1.5) {
    weight = 0.07;
  } else if (distance > 1.5 && distance <= 2.5) {
    weight = 0.03;
  }

  // Calculate the final score and round it to 2 decimal places
  const finalScore = (weight * 100).toFixed(2);
  return parseFloat(finalScore);
}

// Helper function to convert degrees to radians
function radians(degrees) {
  return degrees * (Math.PI / 180);
}

// Example usage
const sourceLat = -33.9594231; // Source latitude (e.g., Property 1)
const sourceLon = 151.060883; // Source longitude (e.g., Property 1)
const targetLat = -33.96377; // Target property latitude (Other property)
const targetLon = 151.046692; // Target property longitude (Other property)

const score = calculateWeightedScore(
  sourceLat,
  sourceLon,
  targetLat,
  targetLon
);
console.log(`The calculated score is: ${score}`);


