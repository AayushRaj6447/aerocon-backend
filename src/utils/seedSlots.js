const Slot = require('../models/Slot');
const Registration = require('../models/Registration');

// 6 slots of 10 minutes each from 7:00 PM to 8:00 PM
const timeIntervals = [
  { slotNumber: 1, startTime: '19:00', endTime: '19:10', displayTime: '07:00 PM - 07:10 PM', maxCapacity: 7 },
  { slotNumber: 2, startTime: '19:10', endTime: '19:20', displayTime: '07:10 PM - 07:20 PM', maxCapacity: 7 },
  { slotNumber: 3, startTime: '19:20', endTime: '19:30', displayTime: '07:20 PM - 07:30 PM', maxCapacity: 7 },
  { slotNumber: 4, startTime: '19:30', endTime: '19:40', displayTime: '07:30 PM - 07:40 PM', maxCapacity: 7 },
  { slotNumber: 5, startTime: '19:40', endTime: '19:50', displayTime: '07:40 PM - 07:50 PM', maxCapacity: 7 },
  { slotNumber: 6, startTime: '19:50', endTime: '20:00', displayTime: '07:50 PM - 08:00 PM', maxCapacity: 7 },
];

const defaultSlots = [
  ...timeIntervals.map((slot) => ({ ...slot, date: '26th' })),
  ...timeIntervals.map((slot) => ({ ...slot, date: '27th' })),
];

/**
 * Seeds slots for 26th and 27th (7:00 PM - 8:00 PM, 6 slots each)
 * and syncs bookedCount with actual registrations
 */
const seedSlots = async () => {
  try {
    // 1. Remove old slots with slotNumber > 6 (e.g. slots 7, 8, 9 from 6:30-8:00 PM)
    await Slot.deleteMany({ slotNumber: { $gt: 6 } });
    await Slot.deleteMany({ date: { $exists: false } });

    // 2. Upsert the 12 active slots (6 for 26th, 6 for 27th)
    for (const slotData of defaultSlots) {
      const slot = await Slot.findOneAndUpdate(
        { date: slotData.date, slotNumber: slotData.slotNumber },
        {
          $set: {
            startTime: slotData.startTime,
            endTime: slotData.endTime,
            displayTime: slotData.displayTime,
            maxCapacity: slotData.maxCapacity,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // 3. Ensure bookedCount strictly matches actual existing registrations
      const actualBookings = await Registration.countDocuments({ slot: slot._id });
      if (slot.bookedCount !== actualBookings) {
        slot.bookedCount = actualBookings;
        await slot.save();
      }
    }

    const count = await Slot.countDocuments();
    console.log(`Slots initialized: ${count} total slots available across 26th and 27th (7:00 PM - 8:00 PM).`);
  } catch (error) {
    console.error('Error seeding slots:', error.message);
  }
};

module.exports = seedSlots;
