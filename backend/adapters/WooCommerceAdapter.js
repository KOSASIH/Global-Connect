// /backend/adapters/WooCommerceAdapter.js
const EcommerceAdapter = require("./EcommerceAdapter");
const axios = require("axios");

class WooCommerceAdapter extends EcommerceAdapter {
    constructor(config) {
        super(config);
        this.api = axios.create({
            baseURL: config.apiBase,
            auth: { username: config.key, password: config.secret },
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async fetchProducts() {
        const res = await this.api.get("/products");
        return res.data.map(product => ({
            platform: "WooCommerce",
            id: product.id,
            title: product.name,
            description: product.description,
            price: parseFloat(product.price),
            stock: product.stock_quantity || 0,
        }));
    }

    async createOrder(orderData) {
        const res = await this.api.post("/orders", orderData);
        return res.data;
    }

    async updateInventory(productId, quantity) {
        const res = await this.api.put(`/products/${productId}`, { stock_quantity: quantity });
        return res.data;
    }
}

module.exports = WooCommerceAdapter;
