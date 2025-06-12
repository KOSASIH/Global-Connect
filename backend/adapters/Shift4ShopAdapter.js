const EcommerceAdapter = require("./EcommerceAdapter");
const axios = require("axios");

class Shift4ShopAdapter extends EcommerceAdapter {
    constructor(config) {
        super(config);
        this.api = axios.create({
            baseURL: config.apiBase,
            headers: {
                'Private-Token': config.privateToken-Type': 'application/json'
            }
        });
    }

    async fetchProducts() {
        const res = await this.api.get("/products");
        return (res.data || []).map(product => ({
            platform: "Shift4Shop",
            id: product.id,
            title: product.name,
            description: product.description,
 = await this.api.put(`/products/${productId}`, { stock: quantity });
        return res.data;
    }
}

module.exports = Shift4ShopAdapter;
