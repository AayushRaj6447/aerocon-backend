const crypto = require('crypto');

// Character set without easily confused characters (0, O, 1, I)
const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generates a random alphanumeric passcode
 * @param {number} length - Length of passcode (default 7)
 * @returns {string} - Generated passcode (e.g. "7K9X2BA")
 */
const generatePassCode = (length = 7) => {
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, CHARSET.length);
    code += CHARSET[randomIndex];
  }
  return code;
};

module.exports = generatePassCode;

