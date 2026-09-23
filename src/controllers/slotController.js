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
      const requestedDate = req.query.date.toString().trim().toLowerCase();
      // Remove 4-digit year (e.g. 2026) so it doesn't falsely match '26'
      const withoutYear = requestedDate.replace(/\b20\d{2}\b/g, '');

      if (withoutYear.includes('27')) {
        filter.date = '27th';
      } else if (withoutYear.includes('26')) {
        filter.date = '26th';
      } else {
        filter.date = requestedDate;
      }
    }

    const slots = await Slot.find(filter).sort({ date: 1, slotNumber: 1 });

    // Auto-reconcile bookedCount with actual registrations so phantom bookings never occur
    try {
      const Registration = require('../models/Registration');
      const regCounts = await Registration.aggregate([
        { $group: { _id: '$slot', count: { $sum: 1 } } },
      ]);
      const countMap = new Map();
      regCounts.forEach((r) => {
        if (r._id) countMap.set(r._id.toString(), r.count);
      });

      for (const slot of slots) {
        const realCount = countMap.get(slot._id.toString()) || 0;
        if (slot.bookedCount !== realCount) {
          slot.bookedCount = realCount;
          Slot.updateOne({ _id: slot._id }, { $set: { bookedCount: realCount } }).exec();
        }
      }
    } catch (syncErr) {
      // Continue even if reconciliation fails
      console.warn('Slot count sync warning:', syncErr.message);
    }

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
