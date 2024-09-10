const express = require("express");
const router = express.Router();
const {
  updateConjunctionAgent,
  getConjunctionAgent,
  deleteConjunctionAgent,
} = require("../../../controllers/admin/conjunctionAgent");

router.put("/:userId", updateConjunctionAgent);

router.get("/:userId", getConjunctionAgent);

router.delete("/:userId", deleteConjunctionAgent);

module.exports = router;
