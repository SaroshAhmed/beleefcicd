const express = require("express");
const router = express.Router();

const { isAdmin } = require("../../../middleware/auth");
const { createCategory, editCategoryName, deleteCategory, editItem, deleteItem, getAllCategories, addItem } = require("../../../controllers/admin/category");

router.post("/", isAdmin,createCategory);

router.get("/",isAdmin, getAllCategories);

// router.get("/:id",isAdmin, singlePrompt);
router.post('/item/:id',isAdmin, addItem);

router.put("/:id",isAdmin, editCategoryName);
router.delete("/:id",isAdmin, deleteCategory);

router.put("/item/:categoryId/:itemId",isAdmin, editItem);


router.delete("/item/:categoryId/:id",isAdmin,deleteItem );

module.exports = router;