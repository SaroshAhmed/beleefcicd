const axios = require("axios");
const Suburb = require("../models/Suburb");
const { DOMAIN_API_KEY } = require("../config");
const databaseConnect = require("../config/database");
databaseConnect();

// Step 1: Fetch Suburb Performance Statistics
async function fetchSuburbPerformanceStatistics(
  suburb,
  postcode,
  propertyCategory
) {
  try {
    const response = await axios.get(
      `https://api.domain.com.au/v2/suburbPerformanceStatistics/NSW/${suburb}/${postcode}`,
      {
        headers: {
          accept: "application/json",
          "X-Api-Key": DOMAIN_API_KEY,
          "X-Api-Call-Source": "live-api-browser",
        },
        params: {
          propertyCategory, // Dynamically set propertyCategory (house or unit)
          periodSize: "years",
          startingPeriodRelativeToCurrent: 1,
          totalPeriods: 5,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `Error fetching data for ${propertyCategory} in ${suburb} (${postcode}):`,
      error
    );
    return null;
  }
}

// Step 2: Calculate Metrics
function calculateMetrics(data) {
  // Ensure that seriesInfo exists and is an array
  if (!data || !data.series || !Array.isArray(data.series.seriesInfo)) {
    console.warn("No series information available to calculate metrics.");
    return [];
  }

  const results = data.series.seriesInfo.map((yearData, index, array) => {
    const currentYear = yearData.year;
    const medianPrice = yearData.values.medianSoldPrice ?? null;
    const salesVolume = yearData.values.numberSold ?? null;
    const daysOnMarket = yearData.values.daysOnMarket ?? null;

    // Calculate Suburb Growth (Annual Growth %)
    const previousYearData = array[index - 1];
    const growth =
      previousYearData &&
      previousYearData.values.medianSoldPrice &&
      medianPrice !== null
        ? ((medianPrice - previousYearData.values.medianSoldPrice) /
            previousYearData.values.medianSoldPrice) *
          100
        : null;

    // Determine if the area is high demand
    const highDemand =
      salesVolume !== null &&
      salesVolume > 100 &&
      (growth > 5 || daysOnMarket < 60);

    return {
      year: currentYear,
      medianSalePrice: medianPrice !== null ? medianPrice : null,
      annualSalesVolume: salesVolume !== null ? salesVolume : null,
      averageDaysOnMarket: daysOnMarket !== null ? daysOnMarket : null,
      suburbGrowth: growth !== null ? growth.toFixed(2) + "%" : "N/A",
      highDemandArea: highDemand ? "Yes" : "No",
    };
  });

  // Filter out results where both medianSalePrice and annualSalesVolume are null
  return results.filter(
    (result) =>
      result.medianSalePrice !== null || result.annualSalesVolume !== null
  );
}

// Step 3: Update House and Unit Stats in MongoDB
async function updateSuburbStats() {
  try {
    const suburbs = await Suburb.find({
      $or: [
        { houseStats: { $exists: true, $size: 0 } },
        { unitStats: { $exists: true, $size: 0 } },
      ],
    });
    console.log(suburbs.length)

    for (const suburb of suburbs) {
      const { suburb: suburbName, postcode } = suburb;

      if (suburb.houseStats.length === 0) {
        const houseData = await fetchSuburbPerformanceStatistics(
          suburbName,
          postcode,
          "house"
        );
        if (
          houseData &&
          houseData.series &&
          Array.isArray(houseData.series.seriesInfo)
        ) {
          const houseStats = calculateMetrics(houseData);
          if (houseStats.length > 0) {
            suburb.houseStats = houseStats;
          }
        }
      }

      if (suburb.unitStats.length === 0) {
        const unitData = await fetchSuburbPerformanceStatistics(
          suburbName,
          postcode,
          "unit"
        );
        if (
          unitData &&
          unitData.series &&
          Array.isArray(unitData.series.seriesInfo)
        ) {
          const unitStats = calculateMetrics(unitData);
          if (unitStats.length > 0) {
            suburb.unitStats = unitStats;
          }
        }
      }

      await suburb.save();
      console.log(`Updated stats for ${suburbName} (${postcode})`);
    }
  } catch (error) {
    console.error(error);
  }
}

// Execute the update
updateSuburbStats();
