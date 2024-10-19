const mongoose = require('mongoose');
const Suburb = require('../models/Suburb'); // Adjust the path to your Suburb model

const { MONGO_URI } = require("../config");



const updateDomainPrices = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

    // Define the suburb-specific domain price data
    // const domainPrices = {
    //   Peakhurst: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2500 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 3000 },
    //   ],
    //   Riverwood: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Lugarno: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   'Peakhurst Heights': [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   'Beverly Hills': [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Mortdale: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Oatley: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   'Hurstville Grove': [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Blakehurst: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Kingsgrove: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   'Connells Point': [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Hurstville: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Penshurst: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   'Picnic Point': [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Revesby: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   'Padstow Heights': [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   'Denham Court': [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Leppington: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Austral: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   'Edmondson Park': [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    // };
   
    // const domainPrices = {
    //   Sylvania: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Sylvania Waters": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Kangaroo Point": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Kyle Bay": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Hurstville: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Kogarah Bay": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Allawah: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Arncliffe: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Banksia: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Bardwell Park": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Bardwell Valley": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Bexley: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Bexley North": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Bonnet Bay": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Bundeena: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Burraneer: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Caringbah: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Caringbah South": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Carlton: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Carss Park": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Como: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Cronulla: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Dolans Bay": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Engadine: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Epping: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Ermington: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Grays Point": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Greenhills Beach": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Gymea: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Gymea Bay": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Heathcote: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Jannali: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Kareela: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Kirrawee: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Kogarah: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Kurnell: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Lilli Pilli": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Loftus: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Maianbar: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Miranda: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Oyster Bay": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Port Hacking": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Ramsgate: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Ramsgate Beach": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Sandringham: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Sans Souci": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "South Hurstville": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Sutherland: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Taren Point": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Waterfall: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Winston Hills": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Woolooware: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   Woronora: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Woronora Heights": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    //   "Yowie Bay": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1705 },
    //     { minPrice: 1000000, maxPrice: 2749999, fee: 2222 },
    //     { minPrice: 2750000, maxPrice: 9999999999, fee: 2706 },
    //   ],
    // };

    // const domainPrices = {
    //   "Oran Park": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Campbelltown: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Harrington Park": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Gregory Hills": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "West Hoxton": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Airds: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Ambarvale: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Ashcroft: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Bardia: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Blair Athol": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Blairmount: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Bow Bowing": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Bradbury: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Busby: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Camden: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Camden South": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Carnes Hill": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Casula: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Catherine Field": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Cecil Hills": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Chipping Norton": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Claymore: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Currans Hill": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Eagle Vale": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Elderslie: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Ellis Lane": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Englorie Park": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Eschol Park": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Gilead: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Glen Alpine": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Glenfield: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Green Valley": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Hammondville: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Heckenberg: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Hinchinbrook: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Holsworthy: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Horningsea Park": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Ingleburn: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Kearns: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Lansdowne: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Leumeah: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Liverpool: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Long Point": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Lurnea: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Macarthur: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Macquarie Fields": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Macquarie Links": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Menangle: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Middleton Grange": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Miller: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Minto: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Minto Heights": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Moorebank: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Mount Annan": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Narellan: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Narellan Vale": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Prestons: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Raby: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Rosemeadow: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Ruse: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Sadleir: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Sandy Point": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Smeaton Grange": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Spring Farm": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "St Andrews": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "St Helens Park": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Varroville: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Voyager Point": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Warwick Farm": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   "Wattle Grove": [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Woodbine: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    // };
    
    // const domainPrices = {
    //   Padstow: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Panania: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   "Alfords Point": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Bangor: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Bankstown: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   "Barden Ridge": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   "Bass Hill": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Birrong: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Carlingford: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   "Chester Hill": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   "Condell Park": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Dundas: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   "Dundas Valley": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   "Georges Hall": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Greenacre: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   "Harris Park": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Illawong: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Lakemba: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   "Lucas Heights": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   "Mays Hill": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Menai: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Milperra: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   "Mount Lewis": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   "North Parramatta": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   "North Rocks": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Northmead: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Oatlands: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   "Old Toongabbie": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Parramatta: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Punchbowl: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   "Revesby Heights": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Rosehill: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Roselands: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Rydalmere: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Sefton: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Telopea: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Toongabbie: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Villawood: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Westmead: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   "Wiley Park": [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Yagoona: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    // };
    
    // const domainPrices = {
    //   Clyde: [
    //     { minPrice: 0, maxPrice: 999999, fee: 957 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1199 },
    //   ],
    //   Granville: [
    //     { minPrice: 0, maxPrice: 999999, fee: 957 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1199 },
    //   ],
    //   Guildford: [
    //     { minPrice: 0, maxPrice: 999999, fee: 957 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1199 },
    //   ],
    //   Merrylands: [
    //     { minPrice: 0, maxPrice: 999999, fee: 957 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1199 },
    //   ],
    //   "South Granville": [
    //     { minPrice: 0, maxPrice: 999999, fee: 957 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1199 },
    //   ],
    // };

    // const domainPrices={
    //   Abbotsbury: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Bonnyrigg: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   BonnyriggHeights: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   BossleyPark: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Cabramatta: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   CabramattaWest: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   CanleyHeights: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   CanleyVale: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   EdensorPark: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Fairfield: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   FairfieldEast: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   FairfieldHeights: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   FairfieldWest: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   GreenfieldPark: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Lansvale: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   MountPritchard: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Prairiewood: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Smithfield: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   StJohnsPark: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   Wakeley: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ],
    //   WetherillPark: [
    //     { minPrice: 0, maxPrice: 699999, fee: 660 },
    //     { minPrice: 700000, maxPrice: 9999999999, fee: 880 },
    //   ]
    // }

    // const domainPrices={
    //   Carramar: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ],
    //   Villawood: [
    //     { minPrice: 0, maxPrice: 999999, fee: 1089 },
    //     { minPrice: 1000000, maxPrice: 9999999999, fee: 1375 },
    //   ]
    // }

    const domainPrices={
      HorsleyPark: [
        { minPrice: 0, maxPrice: 999999, fee: 957 },
        { minPrice: 1000000, maxPrice: 9999999999, fee: 1199 },
      ],
      OldGuildford: [
        { minPrice: 0, maxPrice: 999999, fee: 957 },
        { minPrice: 1000000, maxPrice: 9999999999, fee: 1199 },
      ],
      Yennora: [
        { minPrice: 0, maxPrice: 999999, fee: 957 },
        { minPrice: 1000000, maxPrice: 9999999999, fee: 1199 },
      ]
    }
    
    // Iterate over each suburb and update its domain price
    for (const suburb in domainPrices) {
      const domainPrice = domainPrices[suburb];
      
      await Suburb.findOneAndUpdate(
        { suburb: suburb },
        { $set: { domainPrice: domainPrice } }
      );

      console.log(`Updated ${suburb} with domain prices`);
    }

    console.log('All suburbs updated with respective domain prices');
  } catch (error) {
    console.error('Error updating domain prices:', error);
  } finally {
    // Close the connection to the database
    mongoose.connection.close();
  }
};

// Run the migration
updateDomainPrices();
