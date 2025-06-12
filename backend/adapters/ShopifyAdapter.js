const EcommerceAdapter = require("./EcommerceAdapter");
const axios = require("axios");

class ShopifyAdapter extends EcommerceAdapter {
    constructor(config) {
        super(config);
        this.api = axios.create({
            baseURL: `https://${config.shop}/admin/api/2023-01`,
            headers: {
                'X-Shopify-Access-Token': config.accessToken,
                'Content-Type': 'application/json'
            }
        });
    }

    async fetchProducts() {
        const res = await this.api.get("/products.json");
        return (res.data.products || []).map(product => ({
            platform: "Shopify",
            id: product.id,
            title: product.title,
            description: product.body_html,
            price: product.variants[0]?.price ? parseFloat(product.variants[0].price) : 0,
            stock: product.variants[0]?.inventory_quantity ?? 0,
       (orderData) {
        const res = await this.api.post("/orders.json", { order: orderData });
        return res.data.order;
    }

    async updateInventory(productId, quantity) {
        // Shopify uses InventoryLevel API for stock updates, requires inventory_item_id and location_id
        throw new Error("Shopify inventory update requires inventory_item_id and location_id. Implement as needed.");
    }
}

module.exports = ShopifyAdapter;
