const mongoose = require('mongoose');

// Define the schema for an item
const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  price: {
    type: Number,
  },
});

// Define the schema for a category
const CategorySchema = new mongoose.Schema({
  category: {
    type: String,
  },
  items: {
    type: [ItemSchema],
    default: [],
  },
});

// Create the Category model
const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
