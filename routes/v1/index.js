const express = require('express');
const router = express.Router();

const adminRoutes = require('./admin');
const userRoutes = require('./user');
const webhookRoutes = require('./webhooks/webhooks');

router.use('/admin', adminRoutes);
router.use('/', userRoutes);
router.use('/webhooks', webhookRoutes);

module.exports = router;
