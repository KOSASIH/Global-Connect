const WooCommerceAdapter = require('./WooCommerceAdapter');
const AmazonAdapter = require('./AmazonAdapter');
const ShopifyAdapter = require('./ShopifyAdapter');
const MagentoAdapter = require('./MagentoAdapter');
const BigCommerceAdapter = require('./BigCommerceAdapter');
const OpenCartAdapter = require('./OpenCartAdapter');
const PrestaShopAdapter = require('./PrestaShopAdapter');

function getAdapter(platform, config) {
    switch (platform.toLowerCase()) {
        case "woocommerce": return new WooCommerceAdapter(config);
        case "amazon": return new AmazonAdapter(config);
        case "shopify": return new ShopifyAdapter(config);
        case "magento": return new MagentoAdapter(config);
        case "bigcommerce": return new BigCommerceAdapter(config);
        case "opencart": return new OpenCartAdapter(config);
        case "prestashop": return new PrestaShopAdapter(config);
        default: throw new Error(`No adapter implemented for: ${platform}`);
    }
}

module.exports = { getAdapter };
