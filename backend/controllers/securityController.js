// backend/controllers/securityController.js

const SecurityService = require('../services/securityService');
const UserService = require('../services/userService'); // Assuming you have a userService
const config = require('../config/config'); // Assuming you have a config file
const logger = require('../config/logger');

class SecurityController {
    /**
     * Enables two-factor authentication (2FA) for a user.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async enableTwoFactorAuth(req, res) {
        const userId = req.user.id;

        logger.info(`User ${userId} attempting to enable two-factor authentication.`);

        try {
            // 1. Generate a 2FA secret for the user
            const { secret, qrCodeUrl } = await SecurityService.generateTwoFactorSecret(userId);

            // 2. Store the secret securely (e.g., encrypted in the database)
            await UserService.updateUserTwoFactorSecret(userId, secret);

            // 3. Return the QR code URL to the client
            logger.info(`User ${userId} successfully generated 2FA secret and QR code.`);
            res.status(200).json({ qrCodeUrl: qrCodeUrl });

        } catch (error) {
            logger.error(`User ${userId} - Error enabling two-factor authentication: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to enable two-factor authentication. Please try again later.' });
        }
    }

    /**
     * Verifies the 2FA token provided by the user.
     * @param {Request} req - Express request object.  Expects token in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async verifyTwoFactorToken(req, res) {
        const userId = req.user.id;
        const { token } = req.body;

        logger.info(`User ${userId} attempting to verify two-factor token.`);

        try {
            // 1. Input Validation
            if (!token) {
                logger.warn(`User ${userId} - Missing token in verifyTwoFactorToken request.`);
                return res.status(400).json({ message: 'Token is required.' });
            }

            // 2. Verify the token (Using SecurityService)
            const isValid = await SecurityService.verifyTwoFactorToken(userId, token);

            if (isValid) {
                logger.info(`User ${userId} successfully verified two-factor token.`);
                res.status(200).json({ message: 'Two-factor token verified successfully.' });
            } else {
                logger.warn(`User ${userId} - Invalid two-factor token.`);
                return res.status(400).json({ message: 'Invalid two-factor token.' });
            }

        } catch (error) {
            logger.error(`User ${userId} - Error verifying two-factor token: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to verify two-factor token. Please try again later.' });
        }
    }

    /**
     * Disables two-factor authentication for a user. Requires authentication and current password.
     * @param {Request} req - Express request object. Expects currentPassword in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async disableTwoFactorAuth(req, res) {
        const userId = req.user.id;
        const { currentPassword } = req.body;

        logger.info(`User ${userId} attempting to disable two-factor authentication.`);

        try {
            // 1. Input Validation
            if (!currentPassword) {
                logger.warn(`User ${userId} - Missing currentPassword in disableTwoFactorAuth request.`);
                return res.status(400).json({ message: 'Current password is required.' });
            }

            // 2. Verify the user's current password
            const user = await UserService.getUserById(userId);
            if (!user) {
                logger.warn(`User not found: ${userId}`);
                return res.status(404).json({ message: 'User not found.' });
            }

            const isPasswordValid = await UserService.verifyPassword(userId, currentPassword);
            if (!isPasswordValid) {
                logger.warn(`User ${userId} - Invalid current password.`);
                return res.status(400).json({ message: 'Invalid current password.' });
            }

            // 3. Disable 2FA (Using SecurityService)
            await SecurityService.disableTwoFactorAuth(userId);

            // 4. Audit Logging
            logger.info(`User ${userId} successfully disabled two-factor authentication.`);

            // 5. Response
            res.status(200).json({ message: 'Two-factor authentication disabled successfully.' });

        } catch (error) {
            logger.error(`User ${userId} - Error disabling two-factor authentication: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to disable two-factor authentication. Please try again later.' });
        }
    }

    /**
     * Handles password reset requests.
     * @param {Request} req - Express request object. Expects email in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async requestPasswordReset(req, res) {
        const { email } = req.body;

        logger.info(`Attempting to request password reset for email ${email}.`);

        try {
            // 1. Input Validation
            if (!email) {
                logger.warn(`Missing email in requestPasswordReset request.`);
                return res.status(400).json({ message: 'Email is required.' });
            }

            // 2. Initiate Password Reset (Using SecurityService)
            await SecurityService.requestPasswordReset(email);

            // 3. Response (Success message - don't reveal if the email exists or not for security reasons)
            logger.info(`Password reset request initiated for email ${email}.`);
            res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

        } catch (error) {
            logger.error(`Error requesting password reset: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to request password reset. Please try again later.' });
        }
    }

    /**
     * Handles password reset using a token.
     * @param {Request} req - Express request object. Expects token and newPassword in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async resetPassword(req, res) {
        const { token, newPassword } = req.body;

        logger.info(`Attempting to reset password using token.`);

        try {
            // 1. Input Validation
            if (!token || !newPassword) {
                logger.warn(`Missing token or newPassword in resetPassword request.`);
                return res.status(400).json({ message: 'Token and new password are required.' });
            }

            // 2. Reset Password (Using SecurityService)
            await SecurityService.resetPassword(token, newPassword);

            // 3. Response
            logger.info(`Password reset successfully using token.`);
            res.status(200).json({ message: 'Password reset successfully.' });

        } catch (error) {
            logger.error(`Error resetting password: ${error.message}`, { stack: error.stack });

            // 4. Error Handling
            if (error.name === 'InvalidTokenError') {
                return res.status(400).json({ message: 'Invalid or expired token.' });
            }

            res.status(500).json({ message: 'Failed to reset password. Please try again later.' });
        }
    }

    /**
     * Handles IP address whitelisting requests (e.g., for API access). Requires authentication and authorization (e.g., only admins can manage whitelists).
     * @param {Request} req - Express request object. Expects ipAddress in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async addIPToWhitelist(req, res) {
        const requesterId = req.user.id;
        const { ipAddress } = req.body;

        logger.info(`User ${requesterId} attempting to add IP address ${ipAddress} to the whitelist.`);

        try {
            // 1. Input Validation
            if (!ipAddress) {
                logger.warn(`User ${requesterId} - Missing ipAddress in addIPToWhitelist request.`);
                return res.status(400).json({ message: 'IP address is required.' });
            }

            // 2. Authorization Check (Example: Only admins can manage whitelists)
            const requester = await UserService.getUserById(requesterId);
            if (!requester || !requester.isAdmin) {
                logger.warn(`User ${requesterId} - Unauthorized attempt to add IP to whitelist.`);
                return res.status(403).json({ message: 'Unauthorized to manage IP whitelists.' });
            }

            // 3. Add IP to Whitelist (Using SecurityService)
            await SecurityService.addIPToWhitelist(ipAddress);

            // 4. Audit Logging
            logger.info(`User ${requesterId} successfully added IP address ${ipAddress} to the whitelist.`);

            // 5. Response
            res.status(201).json({ message: 'IP address added to the whitelist successfully.' });

        } catch (error) {
            logger.error(`User ${requesterId} - Error adding IP to whitelist: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to add IP to the whitelist. Please try again later.' });
        }
    }

    /**
     * Handles IP address whitelisting removal requests. Requires authentication and authorization (e.g., only admins can manage whitelists).
     * @param {Request} req - Express request object. Expects ipAddress in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async removeIPFromWhitelist(req, res) {
        const requesterId = req.user.id;
        const { ipAddress } = req.body;

        logger.info(`User ${requesterId} attempting to remove IP address ${ipAddress} from the whitelist.`);

        try {
            // 1. Input Validation
            if (!ipAddress) {
                logger.warn(`User ${requesterId} - Missing ipAddress in removeIPFromWhitelist request.`);
                return res.status(400).json({ message: 'IP address is required.' });
            }

            // 2. Authorization Check (Example: Only admins can manage whitelists)
            const requester = await UserService.getUserById(requesterId);
            if (!requester || !requester.isAdmin) {
                logger.warn(`User ${requesterId} - Unauthorized attempt to remove IP from whitelist.`);
                return res.status(403).json({ message: 'Unauthorized to manage IP whitelists.' });
            }

            // 3. Remove IP from Whitelist (Using SecurityService)
            await SecurityService.removeIPFromWhitelist(ipAddress);

            // 4. Audit Logging
            logger.info(`User ${requesterId} successfully removed IP address ${ipAddress} from the whitelist.`);

            // 5. Response
            res.status(200).json({ message: 'IP address removed from the whitelist successfully.' });

        } catch (error) {
            logger.error(`User ${requesterId} - Error removing IP from whitelist: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to remove IP from the whitelist. Please try again later.' });
        }
    }
}

module.exports = SecurityController;
