const Slot = require('../models/Slot');

const defaultSlots = [
  { slotNumber: 1, startTime: '18:30', endTime: '18:40', displayTime: '06:30 PM - 06:40 PM', maxCapacity: 8 },
  { slotNumber: 2, startTime: '18:40', endTime: '18:50', displayTime: '06:40 PM - 06:50 PM', maxCapacity: 8 },
  { slotNumber: 3, startTime: '18:50', endTime: '19:00', displayTime: '06:50 PM - 07:00 PM', maxCapacity: 8 },
  { slotNumber: 4, startTime: '19:00', endTime: '19:10', displayTime: '07:00 PM - 07:10 PM', maxCapacity: 8 },
  { slotNumber: 5, startTime: '19:10', endTime: '19:20', displayTime: '07:10 PM - 07:20 PM', maxCapacity: 8 },
  { slotNumber: 6, startTime: '19:20', endTime: '19:30', displayTime: '07:20 PM - 07:30 PM', maxCapacity: 8 },
  { slotNumber: 7, startTime: '19:30', endTime: '19:40', displayTime: '07:30 PM - 07:40 PM', maxCapacity: 8 },
  { slotNumber: 8, startTime: '19:40', endTime: '19:50', displayTime: '07:40 PM - 07:50 PM', maxCapacity: 8 },
  { slotNumber: 9, startTime: '19:50', endTime: '20:00', displayTime: '07:50 PM - 08:00 PM', maxCapacity: 8 },
];

/**
 * Seeds slots if none exist in the database
 */
const seedSlots = async () => {
  try {
    const count = await Slot.countDocuments();
    if (count === 0) {
      console.log('No slots found in database. Initializing default 10-minute slots (6:30 PM - 8:00 PM)...');
      await Slot.insertMany(defaultSlots);
      console.log(`Successfully seeded ${defaultSlots.length} slots with 8-person capacity each.`);
    } else {
      console.log(`Slots already initialized (${count} slots found).`);
    }
  } catch (error) {
    console.error('Error seeding slots:', error.message);
  }
};

module.exports = seedSlots;

