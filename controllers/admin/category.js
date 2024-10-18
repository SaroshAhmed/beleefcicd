const express = require("express");
const MarketingPrice = require("../../models/MarketingPrice");
exports.createCategory = async (req, res) => {
  const { category } = req.body;
  try {
    const categoryModel = new MarketingPrice({ category });
    await categoryModel.save();
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.editCategoryName = async (req, res) => {
    const { id } = req.params;
    const { category } = req.body;
  
    try {
      const updatedCategory = await MarketingPrice.findByIdAndUpdate(
        id,
        { category: category },
        { new: true }
      );
  
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
  
      return res.status(200).json({ message: "Category name updated successfully", category: updatedCategory });
    } catch (error) {
      return res.status(500).json({ message: "Error updating category name", error });
    }
  };
  // Delete Category
exports.deleteCategory = async (req, res) => {
    const { id } = req.params; // Category ID from request parameters
  
    try {
      const deletedCategory = await MarketingPrice.findByIdAndDelete(id);
  
      if (!deletedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
  
      return res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting category", error });
    }
  };
exports.editItem = async (req, res) => {
    const { categoryId, itemId } = req.params; // Category ID and Item ID from request parameters
    const { name, price } = req.body; // New name and price from request body
  
    try {
      const category = await MarketingPrice.findById(categoryId);
  
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
  
      const item = category.items.id(itemId); // Find the item by itemId in the items array
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
  
      // Update item fields
      item.name = name || item.name;
      item.price = price || item.price;
  
      await category.save(); // Save the updated category
  
      return res.status(200).json({ message: "Item updated successfully", item });
    } catch (error) {
      return res.status(500).json({ message: "Error updating item", error });
    }
  };
  exports.deleteItem = async (req, res) => {
    const { categoryId, id } = req.params; // Category ID and Item ID from request parameters
    console.log(categoryId, id);
    try {
      let category = await MarketingPrice.findById(categoryId);
  
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
  
      const item = category.items.id(id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      console.log(category.items);
      category.items.pull(id); // Remove the item from the items array
      await category.save(); // Save the updated category
  
      return res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Error deleting item", error });
    }
  };
exports.getAllCategories = async (req, res) => {
    try {
      const categories = await MarketingPrice.find(); // Fetch all categories from the database
  
      if (!categories.length) {
        return res.status(404).json({ message: "No categories found" });
      }
  
      return res.status(200).json({ categories });
    } catch (error) {
      return res.status(500).json({ message: "Error fetching categories", error });
    }
  };
  exports.addItem = async (req, res) => {
    const { id } = req.params; // Category ID from request parameters
    const { name, price } = req.body; // New item's name and price from request body
  
    try {
      const category = await MarketingPrice.findById(id);
  
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
  
      // Add new item to the category's items array
      category.items.push({ name, price });
  
      await category.save(); // Save the updated category
  
      return res.status(200).json({ message: "Item added successfully", category });
    } catch (error) {
      return res.status(500).json({ message: "Error adding item", error });
    }
  };