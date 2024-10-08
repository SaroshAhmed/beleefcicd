const mongoose = require("mongoose");
const databaseConnect = require("../config/database");
const UserProperty = require("../models/UserProperty");

// Connect to MongoDB
databaseConnect();

async function updatePropertyHistory() {
  try {
    const propertyUpdates = {
        "saleHistory": {
            "sales": [
                {
                    "id": 85459546,
                    "price": {
                        "display": "$2,025,000",
                        "value": 2025000.0,
                        "withheld": false
                    },
                    "listingHistory": {
                        "originalListingId": {
                            "id": 83334227,
                            "rental": false,
                            "_self": "https://api.pricefinder.com.au/v1/listings/83334227"
                        },
                        "originalPrice": {
                            "display": "Auction | Offers Invited"
                        },
                        "originalPricePercentChange": {
                            "display": "+0.0%",
                            "value": 0.0
                        },
                        "lastListingId": {
                            "id": 85102786,
                            "rental": false,
                            "_self": "https://api.pricefinder.com.au/v1/listings/85102786"
                        },
                        "lastPrice": {
                            "display": "Under Contract (Under Offer)"
                        },
                        "lastPricePercentChange": {
                            "display": "+0.0%",
                            "value": 0.0
                        },
                        "daysToSell": 226
                    },
                    "saleDate": {
                        "display": "14/09/2023",
                        "value": "2023-09-13T14:00:00.000+0000"
                    },
                    "settlementDate": {
                        "display": "16/11/2023",
                        "value": "2023-11-15T14:00:00.000+0000"
                    },
                    "contractDate": {
                        "display": "14/09/2023",
                        "value": "2023-09-13T14:00:00.000+0000"
                    },
                    "image": {
                        "id": 562383923,
                        "_self": "https://api.pricefinder.com.au/v1/images/562383923"
                    },
                    "property": {
                        "id": 2844853,
                        "favourite": false,
                        "matchlevel": "property",
                        "location": {
                            "lat": -33.96459387549996,
                            "lon": 151.05818845100004
                        },
                        "parent": false,
                        "_self": "https://api.pricefinder.com.au/v1/properties/2844853"
                    },
                    "street": {
                        "id": "NSW2889020"
                    },
                    "suburb": {
                        "id": "locf06a1d4485d1",
                        "_self": "https://api.pricefinder.com.au/v1/suburbs/locf06a1d4485d1"
                    },
                    "saleType": "Normal Sale",
                    "location": {
                        "lat": -33.96459387549996,
                        "lon": 151.05818845100004
                    },
                    "metadata": {
                        "governmentSale": true,
                        "pending": false
                    },
                    "address": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "countryCode": "AU",
                        "streetName": "RONA",
                        "streetType": "STREET",
                        "lga": "GEORGES RIVER COUNCIL"
                    },
                    "propertyFeatures": {
                        "bedrooms": 5,
                        "bathrooms": 3,
                        "carParks": 2,
                        "airConditioning": true,
                        "study": true,
                        "builtIn": true,
                        "pool": true,
                        "fullyFenced": true,
                        "otherFeatures": "Separate Dining Room, Secure Parking, Broadband internet access, Dishwasher, Gas, Pets allowed, Floorboards, Garden / Courtyard, Internal Laundry"
                    },
                    "landDetails": {
                        "propertyArea": 556.4
                    },
                    "rpd": "2/26426",
                    "dealingNumber": "AT608951",
                    "saleParticipants": {
                        "vendorsSummary": "PETROVSKI; PETROVSKI",
                        "purchasersSummary": "RICHARDS; RICHARDS"
                    },
                    "_self": "https://api.pricefinder.com.au/v1/sales/85459546"
                },
                {
                    "id": 12672797,
                    "price": {
                        "display": "$242,000",
                        "value": 242000.0,
                        "withheld": false
                    },
                    "saleDate": {
                        "display": "26/07/1996",
                        "value": "1996-07-25T14:00:00.000+0000"
                    },
                    "settlementDate": {
                        "display": "26/07/1996",
                        "value": "1996-07-25T14:00:00.000+0000"
                    },
                    "contractDate": {
                        "display": "26/07/1996",
                        "value": "1996-07-25T14:00:00.000+0000"
                    },
                    "image": {
                        "id": 562383923,
                        "_self": "https://api.pricefinder.com.au/v1/images/562383923"
                    },
                    "property": {
                        "id": 2844853,
                        "favourite": false,
                        "matchlevel": "property",
                        "location": {
                            "lat": -33.96459387549996,
                            "lon": 151.05818845100004
                        },
                        "parent": false,
                        "_self": "https://api.pricefinder.com.au/v1/properties/2844853"
                    },
                    "street": {
                        "id": "NSW2889020"
                    },
                    "suburb": {
                        "id": "locf06a1d4485d1",
                        "_self": "https://api.pricefinder.com.au/v1/suburbs/locf06a1d4485d1"
                    },
                    "saleType": "Normal Sale",
                    "location": {
                        "lat": -33.96459387549996,
                        "lon": 151.05818845100004
                    },
                    "metadata": {
                        "governmentSale": true,
                        "pending": false
                    },
                    "address": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "countryCode": "AU",
                        "streetName": "RONA",
                        "streetType": "STREET",
                        "lga": "GEORGES RIVER COUNCIL"
                    },
                    "propertyFeatures": {
                        "bedrooms": 5,
                        "bathrooms": 3,
                        "carParks": 2,
                        "airConditioning": true,
                        "study": true,
                        "builtIn": true,
                        "pool": true,
                        "fullyFenced": true,
                        "otherFeatures": "Separate Dining Room, Secure Parking, Broadband internet access, Dishwasher, Gas, Pets allowed, Floorboards, Garden / Courtyard, Internal Laundry"
                    },
                    "landDetails": {
                        "propertyArea": 556.4
                    },
                    "rpd": "LOT 2 DP 26426",
                    "dealingNumber": "1641000000000",
                    "saleParticipants": {
                        "vendorsSummary": "MR J & MRS J MERCER",
                        "purchasersSummary": "ZLATE PETROVSKI, VESNA PETROVSKI"
                    },
                    "_self": "https://api.pricefinder.com.au/v1/sales/12672797"
                }
            ]
        },
        "listingHistory": {
            "listings": [
                {
                    "id": 85102786,
                    "rental": false,
                    "agents": [
                        {
                            "name": "Hani Obeid",
                            "phoneNumber": "0457038716"
                        }
                    ],
                    "agencies": [
                        {
                            "id": 250783,
                            "name": "Ausrealty"
                        }
                    ],
                    "price": {
                        "display": "Under Contract (Under Offer)"
                    },
                    "listingHistory": {
                        "originalPrice": {
                            "display": ""
                        },
                        "daysOnMarket": 31,
                        "lowAskPrice": 0,
                        "highAskPrice": 0
                    },
                    "startDate": {
                        "display": "25/09/2023",
                        "value": "2023-09-24T18:54:14.590+0000"
                    },
                    "image": {
                        "id": 562383923,
                        "_self": "https://api.pricefinder.com.au/v1/images/562383923"
                    },
                    "property": {
                        "id": 2844853,
                        "favourite": false,
                        "matchlevel": "property",
                        "location": {
                            "lat": -33.9645938755,
                            "lon": 151.058188451
                        },
                        "parent": false,
                        "_self": "https://api.pricefinder.com.au/v1/properties/2844853"
                    },
                    "street": {
                        "id": "NSW2889020"
                    },
                    "suburb": {
                        "id": "locf06a1d4485d1",
                        "_self": "https://api.pricefinder.com.au/v1/suburbs/locf06a1d4485d1"
                    },
                    "location": {
                        "lat": -33.9645938755,
                        "lon": 151.058188451
                    },
                    "propertyLegalDescription": "2//DP26426",
                    "propertyType": "House",
                    "type": "SALE",
                    "status": {
                        "historic": true,
                        "underOffer": true
                    },
                    "endDate": {
                        "display": "28/09/2023",
                        "value": "2023-09-27T14:00:00.000+0000"
                    },
                    "propertyFeatures": {
                        "bedrooms": 5,
                        "bathrooms": 3,
                        "carParks": 2
                    },
                    "address": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "streetName": "RONA",
                        "streetType": "STREET"
                    },
                    "originalListingAddress": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "streetName": "RONA",
                        "streetType": "STREET"
                    },
                    "landDetails": {
                        "propertyArea": 556.4,
                        "buildingArea": 0.0
                    },
                    "_self": "https://api.pricefinder.com.au/v1/listings/85102786"
                },
                {
                    "id": 85098589,
                    "rental": false,
                    "agents": [
                        {
                            "name": "Hani Obeid",
                            "phoneNumber": "0457038716"
                        }
                    ],
                    "agencies": [
                        {
                            "id": 251741,
                            "name": "Ausrealty",
                            "phoneNumber": "02 9011 6888"
                        }
                    ],
                    "price": {
                        "display": "Under Contract"
                    },
                    "listingHistory": {
                        "originalPrice": {
                            "display": "Offers Invited"
                        },
                        "daysOnMarket": 31,
                        "lowAskPrice": 2000000,
                        "highAskPrice": 2000000
                    },
                    "startDate": {
                        "display": "24/09/2023",
                        "value": "2023-09-23T23:18:08.503+0000"
                    },
                    "image": {
                        "id": 562342147,
                        "_self": "https://api.pricefinder.com.au/v1/images/562342147"
                    },
                    "property": {
                        "id": 2844853,
                        "favourite": false,
                        "matchlevel": "property",
                        "location": {
                            "lat": -33.9645938755,
                            "lon": 151.058188451
                        },
                        "parent": false,
                        "_self": "https://api.pricefinder.com.au/v1/properties/2844853"
                    },
                    "street": {
                        "id": "NSW2889020"
                    },
                    "suburb": {
                        "id": "locf06a1d4485d1",
                        "_self": "https://api.pricefinder.com.au/v1/suburbs/locf06a1d4485d1"
                    },
                    "location": {
                        "lat": -33.9645938755,
                        "lon": 151.058188451
                    },
                    "propertyLegalDescription": "2//DP26426",
                    "propertyType": "House",
                    "type": "SALE",
                    "status": {
                        "historic": true
                    },
                    "endDate": {
                        "display": "28/09/2023",
                        "value": "2023-09-27T14:00:00.000+0000"
                    },
                    "propertyFeatures": {
                        "bedrooms": 5,
                        "bathrooms": 3,
                        "carParks": 2
                    },
                    "address": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "streetName": "RONA STREET"
                    },
                    "originalListingAddress": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "streetName": "RONA STREET"
                    },
                    "landDetails": {
                        "propertyArea": 556.4,
                        "buildingArea": 0.0
                    },
                    "_self": "https://api.pricefinder.com.au/v1/listings/85098589"
                },
                {
                    "id": 85102786,
                    "rental": false,
                    "agents": [
                        {
                            "name": "Hani Obeid",
                            "phoneNumber": "0457038716"
                        }
                    ],
                    "agencies": [
                        {
                            "id": 250783,
                            "name": "Ausrealty"
                        }
                    ],
                    "price": {
                        "display": "Offers Invited (Under Offer)"
                    },
                    "listingHistory": {
                        "originalPrice": {
                            "display": ""
                        },
                        "daysOnMarket": 31,
                        "lowAskPrice": 0,
                        "highAskPrice": 0
                    },
                    "startDate": {
                        "display": "28/08/2023",
                        "value": "2023-08-28T05:01:03.000+0000"
                    },
                    "image": {
                        "id": 562383923,
                        "_self": "https://api.pricefinder.com.au/v1/images/562383923"
                    },
                    "property": {
                        "id": 2844853,
                        "favourite": false,
                        "matchlevel": "property",
                        "location": {
                            "lat": -33.9645938755,
                            "lon": 151.058188451
                        },
                        "parent": false,
                        "_self": "https://api.pricefinder.com.au/v1/properties/2844853"
                    },
                    "street": {
                        "id": "NSW2889020"
                    },
                    "suburb": {
                        "id": "locf06a1d4485d1",
                        "_self": "https://api.pricefinder.com.au/v1/suburbs/locf06a1d4485d1"
                    },
                    "location": {
                        "lat": -33.9645938755,
                        "lon": 151.058188451
                    },
                    "propertyLegalDescription": "2//DP26426",
                    "propertyType": "House",
                    "type": "SALE",
                    "status": {
                        "historic": true,
                        "underOffer": true
                    },
                    "endDate": {
                        "display": "28/09/2023",
                        "value": "2023-09-27T14:00:00.000+0000"
                    },
                    "propertyFeatures": {
                        "bedrooms": 5,
                        "bathrooms": 3,
                        "carParks": 2
                    },
                    "address": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "streetName": "RONA",
                        "streetType": "STREET"
                    },
                    "originalListingAddress": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "streetName": "RONA",
                        "streetType": "STREET"
                    },
                    "landDetails": {
                        "propertyArea": 556.4,
                        "buildingArea": 0.0
                    },
                    "_self": "https://api.pricefinder.com.au/v1/listings/85102786"
                },
                {
                    "id": 85098589,
                    "rental": false,
                    "agents": [
                        {
                            "name": "Hani Obeid",
                            "phoneNumber": "0457038716"
                        }
                    ],
                    "agencies": [
                        {
                            "id": 251741,
                            "name": "Ausrealty",
                            "phoneNumber": "02 9011 6888"
                        }
                    ],
                    "price": {
                        "display": "Offers Invited"
                    },
                    "listingHistory": {
                        "originalPrice": {
                            "display": "Offers Invited"
                        },
                        "daysOnMarket": 31,
                        "lowAskPrice": 2000000,
                        "highAskPrice": 2000000
                    },
                    "startDate": {
                        "display": "28/08/2023",
                        "value": "2023-08-28T03:35:03.000+0000"
                    },
                    "image": {
                        "id": 562342147,
                        "_self": "https://api.pricefinder.com.au/v1/images/562342147"
                    },
                    "property": {
                        "id": 2844853,
                        "favourite": false,
                        "matchlevel": "property",
                        "location": {
                            "lat": -33.9645938755,
                            "lon": 151.058188451
                        },
                        "parent": false,
                        "_self": "https://api.pricefinder.com.au/v1/properties/2844853"
                    },
                    "street": {
                        "id": "NSW2889020"
                    },
                    "suburb": {
                        "id": "locf06a1d4485d1",
                        "_self": "https://api.pricefinder.com.au/v1/suburbs/locf06a1d4485d1"
                    },
                    "location": {
                        "lat": -33.9645938755,
                        "lon": 151.058188451
                    },
                    "propertyLegalDescription": "2//DP26426",
                    "propertyType": "House",
                    "type": "SALE",
                    "status": {
                        "historic": true
                    },
                    "endDate": {
                        "display": "28/09/2023",
                        "value": "2023-09-27T14:00:00.000+0000"
                    },
                    "propertyFeatures": {
                        "bedrooms": 5,
                        "bathrooms": 3,
                        "carParks": 2
                    },
                    "address": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "streetName": "RONA STREET"
                    },
                    "originalListingAddress": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "streetName": "RONA STREET"
                    },
                    "landDetails": {
                        "propertyArea": 556.4,
                        "buildingArea": 0.0
                    },
                    "_self": "https://api.pricefinder.com.au/v1/listings/85098589"
                },
                {
                    "id": 83356317,
                    "rental": false,
                    "agents": [
                        {
                            "name": "Haydon Sacilotto",
                            "phoneNumber": "0409786221"
                        }
                    ],
                    "agencies": [
                        {
                            "id": 180411,
                            "name": "Ray White Georges River - St George"
                        }
                    ],
                    "price": {
                        "display": "Sale $2M - $2.1M"
                    },
                    "listingHistory": {
                        "originalPrice": {
                            "display": "Auction | Offers Invited"
                        },
                        "daysOnMarket": 53,
                        "lowAskPrice": 2000000,
                        "highAskPrice": 2000000
                    },
                    "startDate": {
                        "display": "06/03/2023",
                        "value": "2023-03-05T18:49:42.525+0000"
                    },
                    "image": {
                        "id": 546034745,
                        "_self": "https://api.pricefinder.com.au/v1/images/546034745"
                    },
                    "property": {
                        "id": 2844853,
                        "favourite": false,
                        "matchlevel": "property",
                        "location": {
                            "lat": -33.9645938755,
                            "lon": 151.058188451
                        },
                        "parent": false,
                        "_self": "https://api.pricefinder.com.au/v1/properties/2844853"
                    },
                    "street": {
                        "id": "NSW2889020"
                    },
                    "suburb": {
                        "id": "locf06a1d4485d1",
                        "_self": "https://api.pricefinder.com.au/v1/suburbs/locf06a1d4485d1"
                    },
                    "location": {
                        "lat": -33.9645938755,
                        "lon": 151.058188451
                    },
                    "propertyLegalDescription": "2//DP26426",
                    "propertyType": "House",
                    "type": "SALE",
                    "status": {
                        "historic": true,
                        "underOffer": false
                    },
                    "endDate": {
                        "display": "24/03/2023",
                        "value": "2023-03-23T21:59:25.000+0000"
                    },
                    "propertyFeatures": {
                        "bedrooms": 4,
                        "bathrooms": 3,
                        "carParks": 2
                    },
                    "address": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "streetName": "RONA",
                        "streetType": "STREET"
                    },
                    "originalListingAddress": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "streetName": "RONA",
                        "streetType": "STREET"
                    },
                    "landDetails": {
                        "propertyArea": 556.4,
                        "buildingArea": 0.0
                    },
                    "_self": "https://api.pricefinder.com.au/v1/listings/83356317"
                },
                {
                    "id": 83338106,
                    "rental": false,
                    "agents": [
                        {
                            "name": "Haydon Sacilotto",
                            "phoneNumber": "0409 786 221"
                        }
                    ],
                    "agencies": [
                        {
                            "id": 60062,
                            "name": "Ray White Georges River",
                            "phoneNumber": "02 9580 7111"
                        }
                    ],
                    "price": {
                        "display": "Sale $2M - $2.1M"
                    },
                    "listingHistory": {
                        "originalPrice": {
                            "display": "Auction | Offers Invited"
                        },
                        "daysOnMarket": 52,
                        "lowAskPrice": 2000000,
                        "highAskPrice": 2000000
                    },
                    "startDate": {
                        "display": "05/03/2023",
                        "value": "2023-03-04T23:15:51.169+0000"
                    },
                    "image": {
                        "id": 545874942,
                        "_self": "https://api.pricefinder.com.au/v1/images/545874942"
                    },
                    "property": {
                        "id": 2844853,
                        "favourite": false,
                        "matchlevel": "property",
                        "location": {
                            "lat": -33.9645938755,
                            "lon": 151.058188451
                        },
                        "parent": false,
                        "_self": "https://api.pricefinder.com.au/v1/properties/2844853"
                    },
                    "street": {
                        "id": "NSW2889020"
                    },
                    "suburb": {
                        "id": "locf06a1d4485d1",
                        "_self": "https://api.pricefinder.com.au/v1/suburbs/locf06a1d4485d1"
                    },
                    "location": {
                        "lat": -33.9645938755,
                        "lon": 151.058188451
                    },
                    "propertyLegalDescription": "2//DP26426",
                    "propertyType": "House",
                    "type": "SALE",
                    "status": {
                        "historic": true
                    },
                    "endDate": {
                        "display": "23/03/2023",
                        "value": "2023-03-22T22:40:17.000+0000"
                    },
                    "lastModified": {
                        "display": "05/03/2023",
                        "value": "2023-03-04T23:15:51.169+0000"
                    },
                    "propertyFeatures": {
                        "bedrooms": 4,
                        "bathrooms": 3,
                        "carParks": 4
                    },
                    "address": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "streetName": "RONA STREET"
                    },
                    "originalListingAddress": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "streetName": "RONA STREET"
                    },
                    "landDetails": {
                        "propertyArea": 556.4,
                        "buildingArea": 0.0
                    },
                    "_self": "https://api.pricefinder.com.au/v1/listings/83338106"
                },
                {
                    "id": 83334227,
                    "rental": false,
                    "agents": [
                        {
                            "name": "Haydon Sacilotto",
                            "phoneNumber": "+61 409 786 221"
                        }
                    ],
                    "agencies": [
                        {
                            "id": 9350,
                            "name": "Ray White Oatley",
                            "phoneNumber": "+61 (02) 9580 7111"
                        }
                    ],
                    "price": {
                        "display": "Sale $2M - $2.1M"
                    },
                    "startDate": {
                        "display": "04/03/2023",
                        "value": "2023-03-04T05:02:15.155+0000"
                    },
                    "property": {
                        "id": 2844853,
                        "favourite": false,
                        "matchlevel": "property",
                        "location": {
                            "lat": -33.9645938755,
                            "lon": 151.058188451
                        },
                        "parent": false,
                        "_self": "https://api.pricefinder.com.au/v1/properties/2844853"
                    },
                    "street": {
                        "id": "NSW2889020"
                    },
                    "suburb": {
                        "id": "locf06a1d4485d1",
                        "_self": "https://api.pricefinder.com.au/v1/suburbs/locf06a1d4485d1"
                    },
                    "location": {
                        "lat": -33.9645938755,
                        "lon": 151.058188451
                    },
                    "propertyLegalDescription": "2//DP26426",
                    "propertyType": "House",
                    "type": "SALE",
                    "status": {
                        "historic": true,
                        "underOffer": false
                    },
                    "endDate": {
                        "display": "22/03/2023",
                        "value": "2023-03-22T11:37:28.000+0000"
                    },
                    "propertyFeatures": {
                        "bedrooms": 4,
                        "bathrooms": 3,
                        "carParks": 2
                    },
                    "address": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "countryCode": "AUS",
                        "streetName": "RONA STREET"
                    },
                    "originalListingAddress": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "countryCode": "AUS",
                        "streetName": "RONA STREET"
                    },
                    "landDetails": {
                        "propertyArea": 556.4,
                        "buildingArea": 0.0
                    },
                    "_self": "https://api.pricefinder.com.au/v1/listings/83334227"
                },
                {
                    "id": 83338106,
                    "rental": false,
                    "agents": [
                        {
                            "name": "Haydon Sacilotto",
                            "phoneNumber": "0409 786 221"
                        }
                    ],
                    "agencies": [
                        {
                            "id": 60062,
                            "name": "Ray White Georges River",
                            "phoneNumber": "02 9580 7111"
                        }
                    ],
                    "price": {
                        "display": "Auction | Offers Invited"
                    },
                    "listingHistory": {
                        "originalPrice": {
                            "display": "Auction | Offers Invited"
                        },
                        "daysOnMarket": 52,
                        "lowAskPrice": 2000000,
                        "highAskPrice": 2000000
                    },
                    "startDate": {
                        "display": "30/01/2023",
                        "value": "2023-01-30T04:04:29.000+0000"
                    },
                    "image": {
                        "id": 545874942,
                        "_self": "https://api.pricefinder.com.au/v1/images/545874942"
                    },
                    "property": {
                        "id": 2844853,
                        "favourite": false,
                        "matchlevel": "property",
                        "location": {
                            "lat": -33.9645938755,
                            "lon": 151.058188451
                        },
                        "parent": false,
                        "_self": "https://api.pricefinder.com.au/v1/properties/2844853"
                    },
                    "street": {
                        "id": "NSW2889020"
                    },
                    "suburb": {
                        "id": "locf06a1d4485d1",
                        "_self": "https://api.pricefinder.com.au/v1/suburbs/locf06a1d4485d1"
                    },
                    "location": {
                        "lat": -33.9645938755,
                        "lon": 151.058188451
                    },
                    "propertyLegalDescription": "2//DP26426",
                    "propertyType": "House",
                    "type": "SALE",
                    "status": {
                        "historic": true
                    },
                    "endDate": {
                        "display": "23/03/2023",
                        "value": "2023-03-22T22:40:17.000+0000"
                    },
                    "lastModified": {
                        "display": "05/03/2023",
                        "value": "2023-01-30T04:04:29.000+0000"
                    },
                    "propertyFeatures": {
                        "bedrooms": 4,
                        "bathrooms": 3,
                        "carParks": 4
                    },
                    "address": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "streetName": "RONA STREET"
                    },
                    "originalListingAddress": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "streetName": "RONA STREET"
                    },
                    "landDetails": {
                        "propertyArea": 556.4,
                        "buildingArea": 0.0
                    },
                    "_self": "https://api.pricefinder.com.au/v1/listings/83338106"
                },
                {
                    "id": 83356317,
                    "rental": false,
                    "agents": [
                        {
                            "name": "Haydon Sacilotto",
                            "phoneNumber": "0409786221"
                        }
                    ],
                    "agencies": [
                        {
                            "id": 180411,
                            "name": "Ray White Georges River - St George"
                        }
                    ],
                    "price": {
                        "display": "Auction | Offers Invited"
                    },
                    "listingHistory": {
                        "originalPrice": {
                            "display": "Auction | Offers Invited"
                        },
                        "daysOnMarket": 53,
                        "lowAskPrice": 2000000,
                        "highAskPrice": 2000000
                    },
                    "startDate": {
                        "display": "30/01/2023",
                        "value": "2023-01-30T02:00:16.000+0000"
                    },
                    "image": {
                        "id": 546034745,
                        "_self": "https://api.pricefinder.com.au/v1/images/546034745"
                    },
                    "property": {
                        "id": 2844853,
                        "favourite": false,
                        "matchlevel": "property",
                        "location": {
                            "lat": -33.9645938755,
                            "lon": 151.058188451
                        },
                        "parent": false,
                        "_self": "https://api.pricefinder.com.au/v1/properties/2844853"
                    },
                    "street": {
                        "id": "NSW2889020"
                    },
                    "suburb": {
                        "id": "locf06a1d4485d1",
                        "_self": "https://api.pricefinder.com.au/v1/suburbs/locf06a1d4485d1"
                    },
                    "location": {
                        "lat": -33.9645938755,
                        "lon": 151.058188451
                    },
                    "propertyLegalDescription": "2//DP26426",
                    "propertyType": "House",
                    "type": "SALE",
                    "status": {
                        "historic": true,
                        "underOffer": false
                    },
                    "endDate": {
                        "display": "24/03/2023",
                        "value": "2023-03-23T21:59:25.000+0000"
                    },
                    "propertyFeatures": {
                        "bedrooms": 4,
                        "bathrooms": 3,
                        "carParks": 2
                    },
                    "address": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "streetName": "RONA",
                        "streetType": "STREET"
                    },
                    "originalListingAddress": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "streetName": "RONA",
                        "streetType": "STREET"
                    },
                    "landDetails": {
                        "propertyArea": 556.4,
                        "buildingArea": 0.0
                    },
                    "_self": "https://api.pricefinder.com.au/v1/listings/83356317"
                },
                {
                    "id": 83334227,
                    "rental": false,
                    "agents": [
                        {
                            "name": "Haydon Sacilotto",
                            "phoneNumber": "+61 409 786 221"
                        }
                    ],
                    "agencies": [
                        {
                            "id": 9350,
                            "name": "Ray White Oatley",
                            "phoneNumber": "+61 (02) 9580 7111"
                        }
                    ],
                    "price": {
                        "display": "Auction | Offers Invited"
                    },
                    "startDate": {
                        "display": "30/01/2023",
                        "value": "2023-01-29T16:54:33.000+0000"
                    },
                    "property": {
                        "id": 2844853,
                        "favourite": false,
                        "matchlevel": "property",
                        "location": {
                            "lat": -33.9645938755,
                            "lon": 151.058188451
                        },
                        "parent": false,
                        "_self": "https://api.pricefinder.com.au/v1/properties/2844853"
                    },
                    "street": {
                        "id": "NSW2889020"
                    },
                    "suburb": {
                        "id": "locf06a1d4485d1",
                        "_self": "https://api.pricefinder.com.au/v1/suburbs/locf06a1d4485d1"
                    },
                    "location": {
                        "lat": -33.9645938755,
                        "lon": 151.058188451
                    },
                    "propertyLegalDescription": "2//DP26426",
                    "propertyType": "House",
                    "type": "SALE",
                    "status": {
                        "historic": true,
                        "underOffer": false
                    },
                    "endDate": {
                        "display": "22/03/2023",
                        "value": "2023-03-22T11:37:28.000+0000"
                    },
                    "propertyFeatures": {
                        "bedrooms": 4,
                        "bathrooms": 3,
                        "carParks": 2
                    },
                    "address": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "countryCode": "AUS",
                        "streetName": "RONA STREET"
                    },
                    "originalListingAddress": {
                        "street": "RONA STREET",
                        "streetNumber": "43",
                        "streetAddress": "43 RONA STREET",
                        "locality": "PEAKHURST",
                        "streetLocation": "43",
                        "state": "NSW",
                        "postcode": "2210",
                        "countryCode": "AUS",
                        "streetName": "RONA STREET"
                    },
                    "landDetails": {
                        "propertyArea": 556.4,
                        "buildingArea": 0.0
                    },
                    "_self": "https://api.pricefinder.com.au/v1/listings/83334227"
                }
            ]
        },
        "rentalHistory": {
            "listings": []
        },
    };

    // Update the property document with the new data
    const result = await UserProperty.updateMany(
      { address: "43 Rona Street, Peakhurst" }, // Match by street address
      { $set: propertyUpdates }
    );

    console.log(`${result.nModified} properties updated successfully.`);
  } catch (error) {
    console.error("Error updating properties:", error);
  } finally {
    mongoose.connection.close();
  }
}

updatePropertyHistory();
