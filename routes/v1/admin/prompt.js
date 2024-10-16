const express = require("express");
const router = express.Router();
const {
    createPrompt,
    getAllPrompt,
    singlePrompt,
    updatePrompt,
    deletePrompt,
} = require("../../../controllers/admin/prompt");
const { isAdmin } = require("../../../middleware/auth");

router.post("/", isAdmin,createPrompt);

router.get("/",isAdmin, getAllPrompt);

router.get("/:id",isAdmin, singlePrompt);

router.put("/:id",isAdmin, updatePrompt);

router.delete("/:id",isAdmin, deletePrompt);

module.exports = router;

