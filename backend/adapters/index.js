const WooCommerceAdapter = require('./WooCommerceAdapter');
const AmazonAdapter = require('./AmazonAdapter');
const ShopifyAdapter = require('./ShopifyAdapter');
const MagentoAdapter = require('./MagentoAdapter');
const BigCommerceAdapter = require('./BigCommerceAdapter');
const OpenCartAdapter = require('./OpenCartAdapter');
const PrestaShopAdapter = require('./PrestaShopAdapter');
const SquarespaceAdapter = require('./SquarespaceAdapter');
const EcwidAdapter = require('./EcwidAdapter');
const WixAdapter = require('./WixAdapter');
const Shift4ShopAdapter = require('./Shift4ShopAdapter'); // 3dcart
const VolusionAdapter = require('./VolusionAdapter');
const SFCCAdapter = require('./SFCCAdapter'); // Salesforce Commerce Cloud

function getAdapter(platform, config) {
    switch (platform.toLowerCase()) {
        case "woocommerce":   return case "shopify":       return new ShopifyAdapter(config);
        case "magento":       return new MagentoAdapter(config);
        case "bigcommerce":   return new BigCommerceAdapter(config);
        case "opencart":      return new OpenCartAdapter(config);
        case "prestashop":    return new PrestaShop}`);
    }
}

module.exports = { getAdapter };
