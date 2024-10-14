const express = require("express");
const router = express.Router();
const { getAllUsers, getUser, updateUser } = require("../../../controllers/admin/user");
const { isAuthenticated } = require("../../../middleware/auth");

router.get("/", getAllUsers);

router.get("/:id", getUser);
router.put("/",  updateUser);

module.exports = router;
