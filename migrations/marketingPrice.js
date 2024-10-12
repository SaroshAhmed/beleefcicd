// scripts/migrateMarketingPrice.js
const mongoose = require('mongoose');
const MarketingPrice = require('../models/MarketingPrice');

const databaseConnect = require("../config/database");


databaseConnect();


const data = [
  {
    category: "Mailcards & Brochures",
    items: [
      { name: "Melo A6 Mailcard Double Sided Colour - Landscape - 300gsm Uncoated Bright White", price: 388 },
      { name: "Melo 16 Page A4 Booklet - 300gsm Uncoated Bright White Landscape (Short Edge Bound)", price: 358 },
      { name: "Melo 8 Page A5 Brochure - 300gsm Uncoated Bright White Landscape (Short Edge Bound)", price: 106 }
    ]
  },
  {
    category: "Photos",
    items: [
      { name: "Melo Photography - Photography 10 Images", price: 430 },
      { name: "Melo Photography - Photography 20 Images", price: 730 },
      { name: "Melo Photography - Photography 7 Images", price: 340 },
      { name: "Melo Photography - Photography 5 Images", price: 280 },
      { name: "Melo Photography - Dusk Photography", price: 160 },
      { name: "Melo Photography - Drone Shots", price: 250 },
      { name: "Melo Photography - Virtual Furniture 2 Images", price: 154 },
      { name: "Melo Photography - Virtual Furniture 4 Images", price: 308 }
    ]
  },
  {
    category: "Floorplans",
    items: [
      { name: "Melo - Large Floor Plan", price: 319 },
      { name: "Melo - Medium Floor Plan", price: 242 },
      { name: "Melo - Small Floor Plan", price: 193 },
      { name: "Melo - Redraw Large Floorplan", price: 198 },
      { name: "Melo - Redraw Medium Floorplan", price: 143 },
      { name: "Melo - Redraw Small Floorplan", price: 99 }
    ]
  },
  {
    category: "Video",
    items: [
      { name: "Melo - Property Video", price: 1150 },
      { name: "Melo - Storytelling Videos", price: 2200 }
    ]
  },
  {
    category: "Copy & social media",
    items: [
      { name: "Melo - Property Copywriting", price: 140 },
      { name: "Melo - Social Media Advertising", price: 300 }
    ]
  },
  {
    category: "Signboards",
    items: [
      { name: "Melo - 8x4 Satin Laminated Edge Wrap Signboard", price: 375 },
      { name: "Melo - 8x6 Satin Laminated Edge Wrap Signboard", price: 780 },
      { name: "Melo - 8x4 Solar Illuminated Signboard", price: 830 },
      { name: "Melo - 8x6 Solar Illuminated Signboard", price: 1112 }
    ]
  },
  {
    category: "Internet Portals",
    items: [
      { name: "Realestate.com.au", price: 0 },
      { name: "Domain.com.au", price: 0 },
      { name: "Campaign Fee", price: 40 }
    ]
  },
  {
    category: "Auctioneer",
    items: [
      { name: "Narz Sayed - Auctioneer", price: 550 },
      { name: "Andrew Cooley Auctioneer", price: 995 }
    ]
  },
  {
    category: "I.M Group",
    items: [
      { name: "The Merjan Group Package", price: 1500 },
      { name: "The Merjan Group Package with video", price: 2274 },
      { name: "I.M Group Pty Ltd *realestate.com.au (Portal Export)", price: 2200 },
      { name: "I.M Group Pty Ltd domain.com.au (API) - Existing Build", price: 250 },
      { name: "The Merjan Group Auctioneer", price: 795 },
      { name: "The Merjan Group DL Package", price: 532 }
    ]
  }
];

async function add() {
    console.log("Connected to MongoDB...");
    await MarketingPrice.insertMany(data);
    console.log("Data migration completed.");
}

add()