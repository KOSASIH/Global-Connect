// backend/models/LoyaltyProgram.js

const { v4: uuidv4 } = require('uuid');

/**
 * Represents a loyalty program.  This could be used to define different tiers or types of loyalty programs.
 */
class LoyaltyProgram {
    /**
     * Creates a new LoyaltyProgram instance.
     * @param {string} name - The name of the loyalty program.
     * @param {string} description - A description of the loyalty program.
     * @param {number} pointsMultiplier - A multiplier for points earned (e.g., 1.0 for standard, 1.5 for premium).
     * @param {string} [id] - The unique ID of the loyalty program (optional, will be generated if not provided).
     * @param {Date} [createdAt] - The creation timestamp (optional, will be generated if not provided).
     * @param {Date} [updatedAt] - The last updated timestamp (optional, will be generated if not provided).
     */
    constructor(name, description, pointsMultiplier, id, createdAt, updatedAt) {
        /**
         * The unique ID of the loyalty program.
         * @type {string}
         */
        this.id = id || uuidv4();

        /**
         * The name of the loyalty program.
         * @type {string}
         */
        this.name = name;

        /**
         * A description of the loyalty program.
         * @type {string}
         */
        this.description = description;

        /**
         * A multiplier for points earned (e.g., 1.0 for standard, 1.5 for premium).
         * @type {number}
         */
        this.pointsMultiplier = pointsMultiplier;

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
    }

    /**
     * Updates the LoyaltyProgram's properties.
     * @param {object} updates - An object containing the properties to update.
     */
    update(updates) {
        if (updates.name !== undefined) {
            this.name = updates.name;
        }
        if (updates.description !== undefined) {
            this.description = updates.description;
        }
        if (updates.pointsMultiplier !== undefined) {
            this.pointsMultiplier = updates.pointsMultiplier;
        }
        this.updatedAt = new Date();
    }

    /**
     * Converts the LoyaltyProgram object to a JSON representation.
     * @returns {object} A JSON representation of the LoyaltyProgram.
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            pointsMultiplier: this.pointsMultiplier,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }

    /**
     * Creates a LoyaltyProgram object from a JSON representation.
     * @param {object} json - A JSON representation of the LoyaltyProgram.
     * @returns {LoyaltyProgram} A LoyaltyProgram object.
     */
    static fromJSON(json) {
        return new LoyaltyProgram(
            json.name,
            json.description,
            json.pointsMultiplier,
            json.id,
            new Date(json.createdAt),
            new Date(json.updatedAt)
        );
    }
}

module.exports = LoyaltyProgram;
