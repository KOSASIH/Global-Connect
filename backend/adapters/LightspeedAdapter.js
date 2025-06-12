const EcommerceAdapter = require("./EcommerceAdapter");
const axios = require("axios");

class LightspeedAdapter extends EcommerceAdapter {
    constructor(config) {
        super(config);
        this.api = axios.create({
            baseURL: `https://api.lightspeedapp.com/API/Account/${config.accountId}`,
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async fetchProducts() {
        const res = await this.api.get("/Product.json");
        return (res.data.Product || []).map(product => ({
            platform: "Lightspeed",
            id: product.productID,
            title: product.description,
            description: product.longDescription || "",
            price: product.DefaultSalePrice ? parseFloat(product.DefaultSalePrice) : 0,
            stock: product.QtyOnHand ?? 0,
        }));
    }

    async createOrder(orderData) {
        const res = await this.api.post("/Sale.json", orderData);
        return res.data;
    }

    async updateInventory(productId, quantity) {
        const res = await this.api.put(`/Product/${productId}.json`, { QtyOnHand: quantity });
        return res.data;
    }
}

module.exports = LightspeedAdapter;
