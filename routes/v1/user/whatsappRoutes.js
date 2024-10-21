const express = require('express');
const router = express.Router();
const { createGroup } = require('../../../controllers/user/whatsappController');

router.post('/create-whatsapp-group', createGroup);

module.exports = router;
