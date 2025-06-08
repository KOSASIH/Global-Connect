// backend/controllers/authenticityController.js
const AuthenticityService = require('../services/authenticityService');

class AuthenticityController {
    // Validate Pi authenticity
    static async validateTransaction(req, res) {
        const { transactionId } = req.body;
        try {
            const validationResult = await AuthenticityService.validateTransaction(transactionId);
            res.json(validationResult);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = AuthenticityController;
