// backend/models/NFT.js

const { v4: uuidv4 } = require('uuid');

/**
 * Represents an NFT (Non-Fungible Token).
 */
class NFT {
    /**
     * Creates a new NFT instance.
     * @param {string} title - The title of the NFT.
     * @param {string} description - A description of the NFT.
     * @param {string} imageUrl - The URL of the NFT's image.
     * @param {number} price - The price of the NFT (in Pi or other currency).
     * @param {string} creatorId - The ID of the user who created the NFT.
     * @param {string} ownerId - The ID of the user who currently owns the NFT.
     * @param {string} [id] - The unique ID of the NFT (optional, will be generated if not provided).
     * @param {Date} [createdAt] - The creation timestamp (optional, will be generated if not provided).
     * @param {Date} [updatedAt] - The last updated timestamp (optional, will be generated if not provided).
     * @param {boolean} [isListedForSale] - Indicates if the NFT is currently listed for sale (optional, defaults to false).
     */
    constructor(title, description, imageUrl, price, creatorId, ownerId, id, createdAt, updatedAt, isListedForSale = false) {
        /**
         * The unique ID of the NFT.
         * @type {string}
         */
        this.id = id || uuidv4();

        /**
         * The title of the NFT.
         * @type {string}
         */
        this.title = title;

        /**
         * A description of the NFT.
         * @type {string}
         */
        this.description = description;

        /**
         * The URL of the NFT's image.
         * @type {string}
         */
        this.imageUrl = imageUrl;

        /**
         * The price of the NFT (in Pi or other currency).
         * @type {number}
         */
        this.price = price;

        /**
         * The ID of the user who created the NFT.
         * @type {string}
         */
        this.creatorId = creatorId;

        /**
         * The ID of the user who currently owns the NFT.
         * @type {string}
         */
        this.ownerId = ownerId;

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
         * Indicates if the NFT is currently listed for sale.
         * @type {boolean}
         */
        this.isListedForSale = isListedForSale;
    }

    /**
     * Updates the NFT's properties.
     * @param {object} updates - An object containing the properties to update.
     */
    update(updates) {
        if (updates.title !== undefined) {
            this.title = updates.title;
        }
        if (updates.description !== undefined) {
            this.description = updates.description;
        }
        if (updates.imageUrl !== undefined) {
            this.imageUrl = updates.imageUrl;
        }
        if (updates.price !== undefined) {
            this.price = updates.price;
        }
        if (updates.ownerId !== undefined) {
            this.ownerId = updates.ownerId;
        }
        if (updates.isListedForSale !== undefined) {
            this.isListedForSale = updates.isListedForSale;
        }
        this.updatedAt = new Date();
    }

    /**
     * Converts the NFT object to a JSON representation.
     * @returns {object} A JSON representation of the NFT.
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            imageUrl: this.imageUrl,
            price: this.price,
            creatorId: this.creatorId,
            ownerId: this.ownerId,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            isListedForSale: this.isListedForSale
        };
    }

    /**
     * Creates an NFT object from a JSON representation.
     * @param {object} json - A JSON representation of the NFT.
     * @returns {NFT} An NFT object.
     */
    static fromJSON(json) {
        return new NFT(
            json.title,
            json.description,
            json.imageUrl,
            json.price,
            json.creatorId,
            json.ownerId,
            json.id,
            new Date(json.createdAt),
            new Date(json.updatedAt),
            json.isListedForSale
        );
    }
}

module.exports = NFT;
