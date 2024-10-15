const express = require("express");
const router = express.Router();
const { getPostList } = require("../../../controllers/admin/postList"); // Adjust the path if necessary

// Route to get all properties for a specific user
router.get("/", getPostList);

module.exports = router;
