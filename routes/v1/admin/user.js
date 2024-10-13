const express = require("express");
const router = express.Router();
const { getAllUsers, getUser } = require("../../../controllers/admin/user");
const { isAuthenticated } = require("../../../middleware/auth");

router.get("/", getAllUsers);

router.get("/:id", getUser);

module.exports = router;
