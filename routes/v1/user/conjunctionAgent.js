const express = require('express');
const router = express.Router();
const {
    updateConjunctionAgent,
    getConjunctionAgent,
    deleteConjunctionAgent
} =  require("../../../controllers/user/conjunctionAgent"); 

// Update or create conjunction agent
router.put('/update/:userId', updateConjunctionAgent);

// Get conjunction agent
router.get('/get/:userId', getConjunctionAgent);

// Delete conjunction agent
router.delete('/delete/:userId', deleteConjunctionAgent);

module.exports = router;
