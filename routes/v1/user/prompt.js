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


router.post("/create-prompt", isAuthenticated, createPrompt);

router.get('/get-all-prompt', isAuthenticated, getAllPrompt);

router.get("/single-prompt", isAuthenticated,singlePrompt );
router.post("/update-prompt", isAuthenticated, updatePrompt);
router.delete("/delete-prompt", isAuthenticated, deletePrompt);

module.exports = router;
