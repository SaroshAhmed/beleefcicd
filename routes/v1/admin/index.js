const express = require('express');
const router = express.Router();

const propertyRoutes = require('./property');
const authRoutes = require('./auth');

router.use('/property', propertyRoutes);
router.use('/auth', authRoutes);



module.exports = router;
