// backend/utils/validation.js

/**
 * Checks if a value is a positive number.
 * @param {any} value - The value to check.
 * @returns {boolean} True if the value is a positive number, false otherwise.
 */
function isPositiveNumber(value) {
  if (typeof value === 'number' && value > 0) {
    return true;
  }
  if (typeof value === 'string' && !isNaN(value) && Number(value) > 0) {
    return true;
  }
  return false;
}

module.exports = {
  isPositiveNumber,
};
