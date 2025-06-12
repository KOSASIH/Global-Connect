const EcommerceAdapter = require("./EcommerceAdapter");
const axios = require("axios");

class BigCommerceAdapter extends EcommerceAdapter {
    constructor(config) {
        super(config);
        this.api = axios.create({
            baseURL: `https://api.bigcommerce.com/stores/${config.storeHash}/v3`,
            headers: {
                'X-Auth-Token': config.accessToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
    }

    async fetchProducts() {
        const res = await this.api.get("/catalog/products");
        return (res.data.data || []).map(product => ({
            platform: "Big }));
    }

    async createOrder(orderData) {
        const res = await this.api.post("/orders", orderData);
        return res.data;
    }

    async updateInventory(productId, quantity) {
        const res = await this.api.put(`/catalog/products/${productId}`, {
            inventory_level: quantity
        });
        return res.data;
    }
}

module.exports = BigCommerceAdapter;
