const express = require('express');
const router = express.Router();
const {
  register,
  verifyPass,
  getRegistrations,
} = require('../controllers/registrationController');

// POST /api/register - Register a student for a slot
router.post('/register', register);

// GET /api/verify-pass/:passCode - Check pass validity
router.get('/verify-pass/:passCode', verifyPass);

// POST /api/verify-pass - Check pass validity and optionally mark as checked in
router.post('/verify-pass', verifyPass);

// GET /api/registrations - Admin view of all registrations
router.get('/registrations', getRegistrations);

module.exports = router;

