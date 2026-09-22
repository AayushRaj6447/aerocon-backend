const Slot = require('../models/Slot');

const timeIntervals = [
  { slotNumber: 1, startTime: '18:30', endTime: '18:40', displayTime: '06:30 PM - 06:40 PM', maxCapacity: 7 },
  { slotNumber: 2, startTime: '18:40', endTime: '18:50', displayTime: '06:40 PM - 06:50 PM', maxCapacity: 7 },
  { slotNumber: 3, startTime: '18:50', endTime: '19:00', displayTime: '06:50 PM - 07:00 PM', maxCapacity: 7 },
  { slotNumber: 4, startTime: '19:00', endTime: '19:10', displayTime: '07:00 PM - 07:10 PM', maxCapacity: 7 },
  { slotNumber: 5, startTime: '19:10', endTime: '19:20', displayTime: '07:10 PM - 07:20 PM', maxCapacity: 7 },
  { slotNumber: 6, startTime: '19:20', endTime: '19:30', displayTime: '07:20 PM - 07:30 PM', maxCapacity: 7 },
  { slotNumber: 7, startTime: '19:30', endTime: '19:40', displayTime: '07:30 PM - 07:40 PM', maxCapacity: 7 },
  { slotNumber: 8, startTime: '19:40', endTime: '19:50', displayTime: '07:40 PM - 07:50 PM', maxCapacity: 7 },
  { slotNumber: 9, startTime: '19:50', endTime: '20:00', displayTime: '07:50 PM - 08:00 PM', maxCapacity: 7 },
];

const defaultSlots = [
  ...timeIntervals.map((slot) => ({ ...slot, date: '26th' })),
  ...timeIntervals.map((slot) => ({ ...slot, date: '27th' })),
];

/**
 * Seeds slots for 26th and 27th if none exist in the database
 */
const seedSlots = async () => {
  try {
    // If old slots without date exist in database, clean them up
    const outdatedSlots = await Slot.countDocuments({ date: { $exists: false } });
    if (outdatedSlots > 0) {
      console.log(`Found ${outdatedSlots} outdated slots without date. Cleaning up...`);
      await Slot.deleteMany({ date: { $exists: false } });
    }

    // Ensure all 18 slots (9 for 26th and 9 for 27th) exist in the database
    for (const slot of defaultSlots) {
      await Slot.findOneAndUpdate(
        { date: slot.date, slotNumber: slot.slotNumber },
        { $setOnInsert: slot },
        { upsert: true, new: true }
      );
    }
    const count = await Slot.countDocuments();
    console.log(`Slots initialized: ${count} total slots available across 26th and 27th.`);
  } catch (error) {
    console.error('Error seeding slots:', error.message);
  }
};

module.exports = seedSlots;
