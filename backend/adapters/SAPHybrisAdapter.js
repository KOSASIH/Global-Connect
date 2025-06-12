const EcommerceAdapter = require("./EcommerceAdapter");
const axios = require("axios");

class SAPHybrisAdapter extends EcommerceAdapter {
    constructor(config) {
        super(config);
        this.api = axios.create({
            baseURL: config.apiBase, // e.g. "https://<your-hybris-instance>/rest/v2/<site-id>"
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async fetchProducts() {
        const res = await this.api.get("/products/search", { params: { pageSize: 50 } });
        return (res.data.products || []).map(product => ({
            platform: "SAP Hybris",
            id: product.code,
            title: product.name,
            description: product.summary || "",
            price: product.price?.value ? parseFloat(product.price.value) : 0,
            stock: product.stock?.stockLevel ?? 0,
        }));
    }

    async createOrder(orderData) {
        const res = await this.api.post("/users/current/orders", orderData);
        return res.data;
    }

    async updateInventory(productId, quantity) {
        // Typically, inventory is managed via a backend system, but this is a placeholder if API is available
        throw new Error("Inventory updates must be handled through SAP backend integration.");
    }
}

module.exports = SAPHybrisAdapter;
