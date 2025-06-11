const express = require('express');
const TransactionService = require('../services/transactionService');
const NotificationService = require('../services/notificationService');
const AuditLogger = require('../audit/auditLogger');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Middleware: Ensure user is authenticated
function requireAuth(req, res, next) {
    if (!req.user || !.status(401).json({ message: 'Unauthorized' });
    }
    next();
}

// Create a new transaction (with dual value support)
router.post(
    '/create',
    requireAuth,
    [
        body('destination').isString().notEmpty(),
        body('amount').isNumeric().isFloat({ gt: 0 }),
        body('assetCode').optional().isString(),
        body('valueType').optional().isIn(['internal']),
    ],
    async (req, res) => {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { destination, amount, assetCode = "PI", valueType = "internal" } = req.body;
        const username = req.user.username;

        try {
            // Create transaction with support for dual value
            const newTransaction = await TransactionService.createTransaction(
                username,
                destination,
                amount,
                assetCode,
                valueType
            );

            // Audit log
            AuditLogger.logAudit('createTransaction', username, {
                destination, amount, assetCode, valueType, txId: newTransaction.id
                       NotificationService.notifyTransactionSuccess(username, newTransaction.id)
                .catch(() => { /* Silent fail */ });

            res.status(201).json(newTransaction);

        } catch (error) {
            // Audit failed attempt
            AuditLogger.logAudit('createTransactionFailed', username, {
                destination, amount, assetCode, valueType, error: error.message
            });

            // Notify user of failure (async)
            NotificationService.notifyTransactionFailure(username, nullinternal" or "external") for PiDualTx alignment.
- **Audit Logging**: Every create/failure is logged for compliance and traceability.
- **Validation**: Uses `express-validator` for secure input.
- **Authentication**: Middleware ensures only authenticated users can transact.
- **Notification**: Async user notification on success/failure.
- **Security**: Only allows users to view their own history (or admin).
- **Defaults**: `assetCode` defaults to `"PI"`, `valueType` to `"internal"` if not specified.
