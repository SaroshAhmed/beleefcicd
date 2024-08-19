const express = require('express');
const router = express.Router();

const propertyRoutes = require('./property');

router.use('/property', propertyRoutes);


module.exports = router;
