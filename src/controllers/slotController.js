const Slot = require('../models/Slot');

/**
 * @desc    Get all available slots with remaining capacity
 * @route   GET /api/slots
 * @access  Public
 */
const getSlots = async (req, res, next) => {
  try {
    const slots = await Slot.find().sort({ slotNumber: 1 });

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

