const express = require("express");
const router = express.Router();
const {
    createPrompt,
    getAllPrompt,
    singlePrompt,
    updatePrompt,
    deletePrompt,
} = require("../../../controllers/user/prompt");
const { isAuthenticated } = require("../../../middleware/auth");


router.post("/", isAuthenticated, createPrompt);

router.get('/', isAuthenticated, getAllPrompt);

router.get("/:id", isAuthenticated,singlePrompt );
router.put("/:id", isAuthenticated, updatePrompt);
router.delete("/:id", isAuthenticated, deletePrompt);

module.exports = router;
