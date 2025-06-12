const EcommerceAdapter = require("./EcommerceAdapter");
const axios = require("axios");

class WixAdapter extends EcommerceAdapter {
    constructor(config) {
        super(config);
        this.api = axios.create({
            baseURL: "https://www.wixapis.com/stores/v: "Wix",
            id: product._id,
            title: product.name,
            description: product.description,
            price: product.price?.amount ? parseFloat(product.price.amount) : 0,
            stock: product.stock?.quantity ?? 0,
        }));
    }

    async createOrder(orderData) {
        // Wix API order creation is complex}/inventory`, {
            inventory: { quantity }
        });
        return res.data;
    }
}

module.exports = WixAdapter;
