const EcommerceAdapter = require("./EcommerceAdapter");
const axios = require("axios");

class MagentoAdapter extends EcommerceAdapter {
    constructor(config) {
        super(config);
        this.api = axios.create({
            baseURL: `${config.apiBase}/rest/V1`,
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async fetchProducts() {
        const res = await this.api.get("/products?searchCriteria[pageSize]=20");
        || []).map(product => ({
            platform: "Magento",
            id: product.id,
            title: product.name,
            description: product.custom_attributes?.find(attr => attr.attribute_code === "description")?.value || "",
            price: product.price ? parseFloat(product.price) : 0,
            stock: product.extension_attributes?.stock_item?.qty ?? 0,
        }));
    }

    async createOrder(orderData) {
        // Implement order creation as needed for Magento 2
        throw new Error("Order creation for Magento 2 not implemented in this example.");
    }

    async updateInventory(productId, quantity) {
        const res = await this.api.put(`/products/${productId}/stockItems/1`, {
            stockItem: {
                qty: quantity,
                is_in_stock: quantity > 0
            }
        });
        return res.data}

module.exports = MagentoAdapter;
