const express = require("express");
const router = express.Router();
const {
  createPostList,
  updatePostList,
  getPostListByShareableLink,
  getPostListByAddress,
} = require("../../../controllers/user/postList");
const { isAuthenticated } = require("../../../middleware/auth");

// Route to create a new PostList
router.post("/", isAuthenticated, createPostList);

// Route to update PostList by ID
router.put("/:id", isAuthenticated, updatePostList);

// Route to get PostList by userId and address
router.get("/:address", isAuthenticated, getPostListByAddress);

// Route to get PostList by shareable link
router.get("/share/:shareableLink", getPostListByShareableLink);

module.exports = router;
