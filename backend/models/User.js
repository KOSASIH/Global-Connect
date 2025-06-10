// backend/models/User.js

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

/**
 * Represents a user in the system.
 */
class User {
    /**
     * Creates a new User instance.
     * @param {string} username - The user's username.
     * @param {string} email - The user's email address.
     * @param {string} password - The user's password (will be hashed).
     * @param {string} [id] - The unique ID of the user (optional, will be generated if not provided).
     * @param {Date} [createdAt] - The creation timestamp (optional, will be generated if not provided).
     * @param {Date} [updatedAt] - The last updated timestamp (optional, will be generated if not provided).
     * @param {number} [loyaltyPoints] - The user's loyalty points (optional, defaults to 0).
     * @param {boolean} [isAdmin] - Indicates if the user is an administrator (optional, defaults to false).
     * @param {string} [twoFactorSecret] - The user's two-factor authentication secret (optional).
     * @param {string} [profilePictureUrl] - URL to the user's profile picture (optional).
     * @param {string} [bio] - User's biography (optional).
     */
    constructor(username, email, password, id, createdAt, updatedAt, loyaltyPoints = 0, isAdmin = false, twoFactorSecret = null, profilePictureUrl = null, bio = null) {
        /**
         * The unique ID of the user.
         * @type {string}
         */
        this.id = id || uuidv4();

        /**
         * The user's username.
         * @type {string}
         */
        this.username = username;

        /**
         * The user's email address.
         * @type {string}
         */
        this.email = email;

        /**
         * The user's hashed password.
         * @type {string}
         */
        this.password = this.hashPassword(password); // Hash the password upon creation

        /**
         * The creation timestamp.
         * @type {Date}
         */
        this.createdAt = createdAt || new Date();

        /**
         * The last updated timestamp.
         * @type {Date}
         */
        this.updatedAt = updatedAt || new Date();

        /**
         * The user's loyalty points.
         * @type {number}
         */
        this.loyaltyPoints = loyaltyPoints;

        /**
         * Indicates if the user is an administrator.
         * @type {boolean}
         */
        this.isAdmin = isAdmin;

        /**
         * The user's two-factor authentication secret.
         * @type {string | null}
         */
        this.twoFactorSecret = twoFactorSecret;

        /**
         * URL to the user's profile picture.
         * @type {string | null}
         */
        this.profilePictureUrl = profilePictureUrl;

        /**
         * User's biography.
         * @type {string | null}
         */
        this.bio = bio;
    }

    /**
     * Hashes the user's password using bcrypt.
     * @param {string} password - The password to hash.
     * @returns {string} The hashed password.
     * @private
     */
    hashPassword(password) {
        const saltRounds = 10; // You can adjust the number of salt rounds
        return bcrypt.hashSync(password, saltRounds);
    }

    /**
     * Verifies the user's password against the stored hash.
     * @param {string} password - The password to verify.
     * @returns {boolean} True if the password is valid, false otherwise.
     */
    verifyPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }

    /**
     * Updates the user's properties.
     * @param {object} updates - An object containing the properties to update.
     */
    update(updates) {
        if (updates.username !== undefined) {
            this.username = updates.username;
        }
        if (updates.email !== undefined) {
            this.email = updates.email;
        }
        if (updates.password !== undefined) {
            this.password = this.hashPassword(updates.password); // Re-hash the password if it's being updated
        }
        if (updates.loyaltyPoints !== undefined) {
            this.loyaltyPoints = updates.loyaltyPoints;
        }
        if (updates.isAdmin !== undefined) {
            this.isAdmin = updates.isAdmin;
        }
        if (updates.twoFactorSecret !== undefined) {
            this.twoFactorSecret = updates.twoFactorSecret;
        }
        if (updates.profilePictureUrl !== undefined) {
            this.profilePictureUrl = updates.profilePictureUrl;
        }
        if (updates.bio !== undefined) {
            this.bio = updates.bio;
        }
        this.updatedAt = new Date();
    }

    /**
     * Converts the User object to a JSON representation.  Excludes the password hash.
     * @returns {object} A JSON representation of the User.
     */
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            loyaltyPoints: this.loyaltyPoints,
            isAdmin: this.isAdmin,
            twoFactorSecret: this.twoFactorSecret,
            profilePictureUrl: this.profilePictureUrl,
            bio: this.bio
        };
    }

    /**
     * Creates a User object from a JSON representation.  Note: This does *not* hash the password.  It assumes the password is already hashed (e.g., when retrieving from a database).
     * @param {object} json - A JSON representation of the User.
     * @returns {User} A User object.
     */
    static fromJSON(json) {
        const user = new User(
            json.username,
            json.email,
            'dummyPassword', // Use a dummy password since we're assuming the password is already hashed
            json.id,
            new Date(json.createdAt),
            new Date(json.updatedAt),
            json.loyaltyPoints,
            json.isAdmin,
            json.twoFactorSecret,
            json.profilePictureUrl,
            json.bio
        );
        user.password = json.password; // Set the password directly (assuming it's already hashed)
        return user;
    }
}

module.exports = User;
