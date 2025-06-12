const EcommerceAdapter = require("./EcommerceAdapter");
const axios = require("axios");

class SFCCAdapter extends EcommerceAdapter {
    constructor(config) {
        super(config);
        this.api = axios.create({
            baseURL: config.apiBase, // e.g., https://<your-instance>.commercecloud.salesforce.com/s/<site-id>/dw/shop/v23_2
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async fetchProducts() {
        // Fetch the first page of products (OCAPI paginates results)
        const res = await this.api.get("/products", {
            params: {
                start: 0,
                count: 50, // Adjust as needed
                select: "id,name,short_description,long_description,price,inventory"
            }
        });
        return (res.dataamount) : 0,
            stock: product.inventory && product.inventory.available_to_sell ? product.inventory.available_to_sell : 0,
        }));
    }

    async createOrder(orderData) {
        // OCAPI order creation is advanced and often requires a full basket flow.
        // Here, we assume a basket has been created and we place the order.
        // You may need to adapt this based on your site's OCAPI configuration.
        const res = await this.api.post("/orders", orderData);
        return res.data;
    }

    async updateInventory(productId, quantity) {
        // Inventory update typically requires OCAPI Data API or a custom endpoint
        // This is a sample using PATCH if available in your OCAPI config.
        // You may need to enable this feature or use a custom cartridge.
        const res = await this.api.patch(`/products/${productId}/inventory`, {
            available_to_sell: quantity
        });
        return res.data;
    }
}

module.exports = SFCCAdapter;
