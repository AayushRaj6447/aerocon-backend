const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    date: {
      type: String, // "26th" or "27th"
      required: true,
      enum: ['26th', '27th'],
    },
    slotNumber: {
      type: Number,
      required: true,
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
      default: 7,
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

// Compound unique index so each date has its own slotNumbers (1 to 9)
slotSchema.index({ date: 1, slotNumber: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);

