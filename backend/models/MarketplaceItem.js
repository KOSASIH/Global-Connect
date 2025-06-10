// backend/models/MarketplaceItem.js

const { v4: uuidv4 } = require('uuid');

/**
 * Represents an item listed on the marketplace.  This is distinct from the NFT itself.
 */
class MarketplaceItem {
    /**
     * Creates a new MarketplaceItem instance.
     * @param {string} nftId - The ID of the NFT being listed.
     * @param {string} sellerId - The ID of the user listing the NFT for sale.
     * @param {number} price - The listing price of the NFT.
     * @param {string} [id] - The unique ID of the marketplace item (optional, will be generated if not provided).
     * @param {Date} [createdAt] - The creation timestamp (optional, will be generated if not provided).
     * @param {Date} [updatedAt] - The last updated timestamp (optional, will be generated if not provided).
     * @param {boolean} [isSold] - Indicates if the item has been sold (optional, defaults to false).
     */
    constructor(nftId, sellerId, price, id, createdAt, updatedAt, isSold = false) {
        /**
         * The unique ID of the marketplace item.
         * @type {string}
         */
        this.id = id || uuidv4();

        /**
         * The ID of the NFT being listed.
         * @type {string}
         */
        this.nftId = nftId;

        /**
         * The ID of the user listing the NFT for sale.
         * @type {string}
         */
        this.sellerId = sellerId;

        /**
         * The listing price of the NFT.
         * @type {number}
         */
        this.price = price;

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
         * Indicates if the item has been sold.
         * @type {boolean}
         */
        this.isSold = isSold;
    }

    /**
     * Updates the MarketplaceItem's properties.
     * @param {object} updates - An object containing the properties to update.
     */
    update(updates) {
        if (updates.nftId !== undefined) {
            this.nftId = updates.nftId;
        }
        if (updates.sellerId !== undefined) {
            this.sellerId = updates.sellerId;
        }
        if (updates.price !== undefined) {
            this.price = updates.price;
        }
        if (updates.isSold !== undefined) {
            this.isSold = updates.isSold;
        }
        this.updatedAt = new Date();
    }

    /**
     * Converts the MarketplaceItem object to a JSON representation.
     * @returns {object} A JSON representation of the MarketplaceItem.
     */
    toJSON() {
        return {
            id: this.id,
            nftId: this.nftId,
            sellerId: this.sellerId,
            price: this.price,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            isSold: this.isSold
        };
    }

    /**
     * Creates a MarketplaceItem object from a JSON representation.
     * @param {object} json - A JSON representation of the MarketplaceItem.
     * @returns {MarketplaceItem} A MarketplaceItem object.
     */
    static fromJSON(json) {
        return new MarketplaceItem(
            json.nftId,
            json.sellerId,
            json.price,
            json.id,
            new Date(json.createdAt),
            new Date(json.updatedAt),
            json.isSold
        );
    }
}

module.exports = MarketplaceItem;
