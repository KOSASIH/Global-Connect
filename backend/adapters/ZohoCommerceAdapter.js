const EcommerceAdapter = require("./EcommerceAdapter");
const axios = require("axios");

class ZohoCommerceAdapter extends EcommerceAdapter {
    constructor(config) {
        super(config);
        this.api = axios.create({
            baseURL: `https://commerce.zoho.com/store/api/v1/${config.portalId}`,
            headers: {
                'Authorization': `Zoho-oauthtoken ${config.accessToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async fetchProducts() {
        const res = await this.api.get("/products");
        return (res.data.products || []).map(product => ({
            platform: "Zoho Commerce",
            id: product.product_id,
            title: product.name,
            description: product.description || "",
            price: product.price ? parseFloat(product.price) : 0,
            stock: product.stock_on_hand ?? 0,
        }));
    }

    async createOrder(orderData) {
        const res = await this.api.post("/orders", orderData);
        return res.data;
    }

    async updateInventory(productId, quantity) {
        // Zoho Commerce's inventory update may require their Books/Inventory API for full updates
        // Below is a sample for product update if supported
        const res = await this.api.put(`/products/${productId}`, { stock_on_hand: quantity });
        return res.data;
    }
}

module.exports = ZohoCommerceAdapter;
