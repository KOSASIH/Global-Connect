const WooCommerceAdapter = require('./WooCommerceAdapter');
const AmazonAdapter = require('./AmazonAdapter');
const ShopifyAdapter = require('./ShopifyAdapter');
const MagentoAdapter = require('./MagentoAdapter');

function getAdapter(platform, config) {
    switch (platform.toLowerCase()) {
        case "woocommerce": return new WooCommerceAdapter(config);
        case "amazon": return new AmazonAdapter(config);
        case "shopify": return new Shopify```

---

## 4. **How to Use**

Add your platform configuration in your backend (e.g., `server.js` or a config file):

```js
const PLATFORM_CONFIGS = {
    woocommerce: { /* ... */ },
    amazon: { /* ... */ },
    shopify: { shop: "your-shop.myshopify.com", accessToken: "shpat_..." },
    magento: { apiBase: "https://your-magento.com", accessToken: "..." }
};
