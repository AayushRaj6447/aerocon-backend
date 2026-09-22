const Registration = require('../models/Registration');
const Slot = require('../models/Slot');
const generatePassCode = require('../utils/generatePassCode');

/**
 * @desc    Register a student for a slot
 * @route   POST /api/register
 * @access  Public
 */
const register = async (req, res, next) => {
  let reservedSlot = null;

  try {
    let { name, email, roll, batch, slotId } = req.body;

    // Validate required fields
    if (!name || !email || !roll || !batch || !slotId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, roll, batch, and slotId.',
      });
    }

    name = name.trim();
    email = email.trim().toLowerCase();
    roll = roll.trim().toUpperCase();
    batch = batch.trim().toLowerCase();

    // Validate batch
    const allowedBatches = ['k24', 'k25', 'k26'];
    if (!allowedBatches.includes(batch)) {
      return res.status(400).json({
        success: false,
        message: `Invalid batch '${batch}'. Allowed batches are: ${allowedBatches.join(', ')}.`,
      });
    }

    // Check if email or roll is already registered
    const existingRegistration = await Registration.findOne({
      $or: [{ email }, { roll }],
    }).populate('slot', 'date displayTime slotNumber');

    if (existingRegistration) {
      const isEmailConflict = existingRegistration.email === email;
      const conflictField = isEmailConflict ? 'Email' : 'Roll number';
      const slotDate = existingRegistration.slot?.date ? `${existingRegistration.slot.date} ` : '';
      return res.status(409).json({
        success: false,
        message: `${conflictField} is already registered for ${slotDate}Slot #${existingRegistration.slot?.slotNumber} (${existingRegistration.slot?.displayTime}). Each student can only register once.`,
        data: {
          passCode: existingRegistration.passCode,
          slot: existingRegistration.slot,
        },
      });
    }

    // Atomically find slot and increment bookedCount if bookedCount < maxCapacity (7)
    reservedSlot = await Slot.findOneAndUpdate(
      { _id: slotId, $expr: { $lt: ['$bookedCount', '$maxCapacity'] } },
      { $inc: { bookedCount: 1 } },
      { new: true }
    );

    if (!reservedSlot) {
      // Check if slot exists or was already full
      const targetSlot = await Slot.findById(slotId);
      if (!targetSlot) {
        return res.status(404).json({
          success: false,
          message: 'The requested slot does not exist.',
        });
      }
      const slotDate = targetSlot.date ? `${targetSlot.date} ` : '';
      return res.status(400).json({
        success: false,
        message: `${slotDate}Slot #${targetSlot.slotNumber} (${targetSlot.displayTime}) is fully booked (${targetSlot.maxCapacity}/${targetSlot.maxCapacity} capacity reached). Please select another slot.`,
      });
    }

    // Generate unique passcode
    let passCode;
    let isUnique = false;
    while (!isUnique) {
      passCode = generatePassCode(7);
      const existingCode = await Registration.findOne({ passCode });
      if (!existingCode) isUnique = true;
    }

    // Create registration record
    const registration = await Registration.create({
      name,
      email,
      roll,
      batch,
      slot: slotId,
      passCode,
    });

    // Populate slot info for response
    await registration.populate('slot', 'date slotNumber displayTime startTime endTime');

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        id: registration._id,
        name: registration.name,
        email: registration.email,
        roll: registration.roll,
        batch: registration.batch,
        passCode: registration.passCode,
        slot: {
          date: registration.slot.date,
          slotNumber: registration.slot.slotNumber,
          displayTime: registration.slot.displayTime,
          startTime: registration.slot.startTime,
          endTime: registration.slot.endTime,
        },
        registeredAt: registration.registeredAt,
      },
    });
  } catch (error) {
    // If slot was reserved but registration creation failed, rollback the bookedCount atomically
    if (reservedSlot) {
      await Slot.findByIdAndUpdate(reservedSlot._id, {
        $inc: { bookedCount: -1 },
      }).catch((rollbackErr) => {
        console.error('Error rolling back slot bookedCount:', rollbackErr.message);
      });
    }

    next(error);
  }
};

/**
 * @desc    Verify passcode and optionally check in participant
 * @route   GET /api/verify-pass/:passCode
 * @route   POST /api/verify-pass
 * @access  Public / Admin
 */
const verifyPass = async (req, res, next) => {
  try {
    const passCodeParam = req.params.passCode || req.body.passCode;
    const shouldCheckIn = req.body.checkIn === true || req.query.checkIn === 'true';

    if (!passCodeParam) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a passcode to verify.',
      });
    }

    const passCode = passCodeParam.trim().toUpperCase();

    const registration = await Registration.findOne({ passCode }).populate(
      'slot',
      'date slotNumber displayTime startTime endTime'
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Invalid passcode. No registration found for this code.',
      });
    }

    let checkInNotice = null;

    if (shouldCheckIn) {
      if (registration.isUsed) {
        checkInNotice = `Warning: Pass has already been used on ${registration.checkedInAt?.toLocaleString()}.`;
      } else {
        registration.isUsed = true;
        registration.checkedInAt = new Date();
        await registration.save();
        checkInNotice = 'Checked in successfully!';
      }
    }

    return res.status(200).json({
      success: true,
      valid: true,
      isUsed: registration.isUsed,
      checkedInAt: registration.checkedInAt,
      checkInMessage: checkInNotice,
      data: {
        name: registration.name,
        email: registration.email,
        roll: registration.roll,
        batch: registration.batch,
        passCode: registration.passCode,
        slot: registration.slot,
        registeredAt: registration.registeredAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all registrations (Admin view)
 * @route   GET /api/registrations
 * @access  Public / Admin
 */
const getRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find()
      .populate('slot', 'date slotNumber displayTime startTime endTime')
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyPass,
  getRegistrations,
};

