const EcommerceAdapter = require("./EcommerceAdapter");
const axios = require("axios");

class OpenCartAdapter extends EcommerceAdapter {
    constructor(config) {
        super(config);
        this.api = axios.create({
            baseURL: config.apiBase,
            headers: {
                'X-Oc-Merchant-Id': config.merchantId,
                'X-Oc-Session': config.sessionId,
                'Content-Type': 'application/json'
            }
        (res.data.data || []).map(product => ({
            platform: "OpenCart",
            id: product.product_id,
            title: product.name,
            description: product.description,
            price: product.price ? parseFloat(product.price) : 0,
            stock: product.quantity ?? 0,
        }));
    }

    async createOrder(orderData) {
        const res = await this.api.post("/order/add", orderData);
        return res.data;
    }

    async updateInventory(productId, quantity) {
        // OpenCart may require module or direct DB for inventory update, example below assumes API support
        const res = await this.api.put(`/product/${productId}`, { quantity });
        return res.data;
    }
}

module.exports = OpenCartAdapter;
