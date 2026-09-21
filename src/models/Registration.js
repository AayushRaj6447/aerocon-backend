const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    roll: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    batch: {
      type: String,
      required: [true, 'Batch is required'],
      enum: {
        values: ['k24', 'k25', 'k26'],
        message: '{VALUE} is not a valid batch. Allowed batches are k24, k25, k26.',
      },
      lowercase: true,
      trim: true,
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: [true, 'Slot selection is required'],
    },
    passCode: {
      type: String,
      required: [true, 'Passcode is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Registration', registrationSchema);

