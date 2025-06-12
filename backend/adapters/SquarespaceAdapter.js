const EcommerceAdapter = require("./EcommerceAdapter");
const axios = require("axios");

class SquarespaceAdapter extends EcommerceAdapter {
    constructor(config) {
        super(config);
        this.api = axios.create({
            baseURL: "https://api.squarespace.com/1.00]?.stockLevel ?? 0,
        }));
    }

    async createOrder(orderData) {
        // Squarespace API does not allow creating orders via API (read-only)
        throw new Error("Squarespace does not support creating orders via public API.");
    }

    async updateInventory(productId, quantity) {
        // Squarespace API does not currently allow inventory updates via public API
        throw new Error("Squarespace does not support updating inventory via public API.");
    }
}

module.exports = SquarespaceAdapter;
