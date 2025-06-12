const EcommerceAdapter = require("./EcommerceAdapter");
const axios = require("axios");

class WooCommerceRestAdapter extends EcommerceAdapter {
    constructor(config) {
        super(config);
        this.api = axios.create({
            baseURL: config.apiBase,
            auth: { username: config.consumerKey, password: config.consumerSecret },
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async fetchProducts() {
        const res = await this.api.get("/wp-json/wc/v3/products");
        return (res.data || []).map(product => ({
            platform: "WooCommerce REST",
            id: product.id,
            title: product.name,
            description: product.description,
            price: product.price ? parseFloat(product.price) : 0,
            stock: product.stock_quantity ?? 0,
        }));
    }

    async createOrder(orderData) {
        const res = await this.api.post("/wp-json/wc/v3/orders", orderData);
        return res.data;
    }

    async updateInventory(productId, quantity) {
        const res = await this.api.put(`/wp-json/wc/v3/products/${productId}`, { stock_quantity: quantity });
        return res.data;
    }
}

module.exports = WooCommerceRestAdapter;
