// backend/models/Authenticity.js
const mongoose = require('mongoose');

const authenticitySchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
    isValid: {
        type: Boolean,
        required: true,
    },
    validatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Authenticity = mongoose.model('Authenticity', authenticitySchema);
module.exports = Authenticity;
