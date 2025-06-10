// backend/utils/validation.js

function isPositiveNumber(value) {
    if (typeof value === 'number' && isFinite(value) && value > 0) {
        return true;
    }
    if (typeof value === 'string' && !isNaN(Number(value)) && Number(value) > 0) {
        return true;
    }
    return false;
}

module.exports = {
    isPositiveNumber
};
