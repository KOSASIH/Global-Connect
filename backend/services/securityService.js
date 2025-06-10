// backend/services/securityService.js

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // For generating reset tokens
const nodemailer = require('nodemailer'); // For sending emails
const config = require('../config/config');
const UserService = require('./userService');
const logger = require('../config/logger');

class SecurityService {
    /**
     * Generates a two-factor authentication (2FA) secret for a user.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<{secret: string, qrCodeUrl: string}>} An object containing the 2FA secret and the QR code URL.
     */
    static async generateTwoFactorSecret(userId) {
        logger.info(`Generating two-factor secret for user ${userId}.`);

        try {
            // 1. Generate a secret using speakeasy
            const secret = speakeasy.generateSecret({ length: 20 });

            // 2. Generate a QR code URL
            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url, { errorCorrectionLevel: 'H' });

            logger.info(`Successfully generated two-factor secret and QR code for user ${userId}.`);
            return { secret: secret.base32, qrCodeUrl: qrCodeUrl }; // Store the base32 secret

        } catch (error) {
            logger.error(`Error generating two-factor secret: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }

    /**
     * Verifies a two-factor authentication (2FA) token.
     * @param {string} userId - The ID of the user.
     * @param {string} token - The 2FA token.
     * @returns {Promise<boolean>} True if the token is valid, false otherwise.
     */
    static async verifyTwoFactorToken(userId, token) {
        logger.info(`Verifying two-factor token for user ${userId}.`);

        try {
            // 1. Get the user's 2FA secret from the database
            const user = await UserService.getUserById(userId);
            if (!user) {
                logger.warn(`User not found: ${userId}`);
                return false;
            }

            const secret = user.twoFactorSecret;
            if (!secret) {
                logger.warn(`User ${userId} does not have 2FA enabled.`);
                return false;
            }

            // 2. Verify the token using speakeasy
            const verified = speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: token,
                window: 2 // Allow a window of 2 (current, previous, and next token)
            });

            logger.info(`Two-factor token verification result for user ${userId}: ${verified}`);
            return verified;

        } catch (error) {
            logger.error(`Error verifying two-factor token: ${error.message}`, { stack: error.stack });
            return false;
        }
    }

    /**
     * Disables two-factor authentication (2FA) for a user.
     * @param {string} userId - The ID of the user.
     */
    static async disableTwoFactorAuth(userId) {
        logger.info(`Disabling two-factor authentication for user ${userId}.`);

        try {
            // 1. Remove the 2FA secret from the database
            await UserService.updateUserTwoFactorSecret(userId, null);

            logger.info(`Successfully disabled two-factor authentication for user ${userId}.`);

        } catch (error) {
            logger.error(`Error disabling two-factor authentication: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }

    /**
     * Requests a password reset for a user.
     * @param {string} email - The email address of the user.
     */
    static async requestPasswordReset(email) {
        logger.info(`Requesting password reset for email ${email}.`);

        try {
            // 1. Get the user by email
            const user = await UserService.
