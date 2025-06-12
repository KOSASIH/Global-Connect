const EcommerceAdapter = require("./EcommerceAdapter");
const axios = require("axios");

class WeeblyAdapter extends EcommerceAdapter {
    constructor(config) {
        super(config);
        this.api = axios.create({
            baseURL: "https://api.weebly.com/v3",
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async fetchProducts() {
        const res = await this.api.get("/products");
        return (res.data.products || []).map(product => ({
            platform: "Weebly",
            id: product.id,
            title: product.name,
            description: product.description,
            price: product.variants && product.variants[0] ? parseFloat(product.variants[0].price.amount) : 0,
            stock: product.variants && product.variants[0] ? product.variants[0].inventory_quantity : 0,
        }));
    }

    async createOrder(orderData) {
        // Order creation may not be available via public API, depending on your Weebly/Square plan
        throw new Error("Order creation for Weebly is not supported via API.");
    }

    async updateInventory(productId, quantity) {
        // Inventory update for product's variant
        throw new Error("Inventory updates for Weebly must target a variant, not a product. Implement as needed.");
    }
}

module.exports = WeeblyAdapter;
