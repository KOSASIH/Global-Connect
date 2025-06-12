const EcommerceAdapter = require("./EcommerceAdapter");
const axios = require("axios");

class PrestaShopAdapter extends EcommerceAdapter {
    constructor(config) {
        super(config);
        this.api = axios.create({
            baseURL: config.apiBase,
            auth: { username: config.apiKey, password: "" },
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async fetchProducts() {
        const res = await this.api.get("/products?output_format=JSON");
        return (res.data.products || []).map(product => ({
            platform: "PrestaShop",
            id: product.id,
            title: product.name?.[0]?.value || "",
            description: product.description?.[0]?.value || "",
            price: product.price ? parseFloat(product.price) : 0,
            stock: product.quantity ?? 0,
        }));
   stashop-api-key"
}
