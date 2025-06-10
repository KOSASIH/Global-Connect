// backend/utils/validation.js

/**
 * Checks if a value is a positive number.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} True if the value is a positive number, false otherwise.
 */
function isPositiveNumber(value) {
    if (typeof value === 'number' && isFinite(value) && value > 0) {
        return true;
    }
    if (typeof value === 'string' && !isNaN(Number(value)) && Number(value) > 0) {
        return true;
    }
    return false;
}

/**
 * Checks if a value is a valid email address.
 *
 * @param {string} email - The email address to check.
 * @returns {boolean} True if the value is a valid email address, false otherwise.
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Checks if a value is a valid URL.
 *
 * @param {string} url - The URL to check.
 * @returns {boolean} True if the value is a valid URL, false otherwise.
 */
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Checks if a value is a valid UUID.
 *
 * @param {string} uuid - The UUID to check.
 * @returns {boolean} True if the value is a valid UUID, false otherwise.
 */
function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * Checks if a value is a safe string (alphanumeric and limited special characters).  Helps prevent XSS.
 *
 * @param {string} str - The string to check.
 * @returns {boolean} True if the value is a safe string, false otherwise.
 */
function isSafeString(str) {
    if (typeof str !== 'string') {
        return false;
    }
    const safeStringRegex = /^[a-zA-Z0-9\s.,?!'"-]*$/; // Allow alphanumeric, spaces, and common punctuation
    return safeStringRegex.test(str);
}

module.exports = {
    isPositiveNumber,
    isValidEmail,
    isValidURL,
    isValidUUID,
    isSafeString
};
