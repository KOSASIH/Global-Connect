const EcommerceAdapter = require("./EcommerceAdapter");
const axios = require("axios");

class NetSuiteAdapter extends EcommerceAdapter {
    constructor(config) {
        super(config);
        this.api = axios.create({
            baseURL: config.apiBase, // e.g. "https://<account-id>.suitetalk.api.netsuite.com/services/rest/record/v1"
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async fetchProducts() {
        const res = await this.api.get("/inventoryItem");
        return (res.data.items || []).map(product => ({
            platform: "NetSuite",
            id: product.id,
            title: product.displayName || product.itemId,
            description: product.description || "",
            price: product.basePrice ? parseFloat(product.basePrice) : 0,
            stock: product.quantityOnHand ?? 0,
        }));
    }

    async createOrder(orderData) {
        const res = await this.api.post("/salesOrder", orderData);
        return res.data;
    }

    async updateInventory(productId, quantity) {
        // NetSuite may require a custom record update for inventory
        const res = await this.api.patch(`/inventoryItem/${productId}`, { quantityOnHand: quantity });
        return res.data;
    }
}

module.exports = NetSuiteAdapter;
