const express = require('express');
const router = express.Router();
const { getSlots } = require('../controllers/slotController');

// GET /api/slots - Fetch all slots with remaining seats
router.get('/', getSlots);

module.exports = router;

