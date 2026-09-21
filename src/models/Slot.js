const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    slotNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },
    startTime: {
      type: String, // e.g. "18:30"
      required: true,
    },
    endTime: {
      type: String, // e.g. "18:40"
      required: true,
    },
    displayTime: {
      type: String, // e.g. "06:30 PM - 06:40 PM"
      required: true,
    },
    maxCapacity: {
      type: Number,
      default: 8,
      min: 1,
    },
    bookedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to calculate remaining seats dynamically
slotSchema.virtual('remainingSeats').get(function () {
  return Math.max(0, this.maxCapacity - this.bookedCount);
});

// Virtual to check if slot is fully booked
slotSchema.virtual('isFull').get(function () {
  return this.bookedCount >= this.maxCapacity;
});

module.exports = mongoose.model('Slot', slotSchema);

