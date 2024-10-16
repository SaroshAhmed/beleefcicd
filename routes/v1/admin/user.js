const express = require("express");
const router = express.Router();
const { getAllUsers, getUser, updateUser} = require("../../../controllers/admin/user");
const { isAdmin } = require("../../../middleware/auth");

router.get("/",isAdmin, getAllUsers);

router.get("/:id", isAdmin,getUser);
router.put("/", isAdmin,updateUser);

module.exports = router;
