const Slot = require('../models/Slot');

/**
 * @desc    Get all available slots with remaining capacity (optionally filtered by ?date=26th or ?date=27th)
 * @route   GET /api/slots
 * @access  Public
 */
const getSlots = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.date) {
      let requestedDate = req.query.date.trim().toLowerCase();
      if (requestedDate === '26' || requestedDate === '26th') {
        filter.date = '26th';
      } else if (requestedDate === '27' || requestedDate === '27th') {
        filter.date = '27th';
      }
    }

    const slots = await Slot.find(filter).sort({ date: 1, slotNumber: 1 });

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSlots,
};
