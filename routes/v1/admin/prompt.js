const express = require("express");
const router = express.Router();
const {
    createPrompt,
    getAllPrompt,
    singlePrompt,
    updatePrompt,
    deletePrompt,
} = require("../../../controllers/admin/prompt");
const { isAuthenticated } = require("../../../middleware/auth");

router.post("/", createPrompt);

router.get("/", getAllPrompt);

router.get("/:id", singlePrompt);

router.put("/:id", updatePrompt);

router.delete("/:id", deletePrompt);

module.exports = router;

