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
const ZohoCommerceAdapter = require('./ZohoCommerceAdapter');
const WeeblyAdapter = require('./WeeblyAdapter');
const WooCommerceRestAdapter = require('./WooCommerceRestAdapter');
const LightspeedAdapter = require('./LightspeedAdapter');
const NetSuiteAdapter = require('./NetSuiteAdapter');
const SAPHybrisAdapter = require('./SAPHybisAdapter');

function getAdapter(platform, config) {
    switch (platform.toLowerCase()) {
        case "woocommerce":         return new WooCommerceAdapter(config);
        case "amazon":              return new AmazonAdapter(config);
        case "shopify":             return new ShopifyAdapter(config);
        case "magento":             return new MagentoAdapter(config);
        case "bigcommerce":         return new BigCommerceAdapter(config);
        case "opencart":            return new OpenCartAdapter(config);
        case "prestashop":          return new PrestaShopAdapter(config);
        case "squarespace":         return new SquarespaceAdapter(config);
        case "ecwid":               return new EcwidAdapter(config);
        case "wix":                 return new WixAdapter(config);
        case "shift4shop":          return new Shift4ShopAdapter(config);
        case "volusion":            return new VolusionAdapter(config);
        case "sfcc":                return new SFCCAdapter(config);
        case "zoho":                return new ZohoCommerceAdapter(config);
        case "weebly":              return new WeeblyAdapter(config);
        case "woocommercerest":     return new WooCommerceRestAdapter(config);
        case "lightspeed":          return new LightspeedAdapter(config);
        case "netsuite":            return new NetSuiteAdapter(config);
        case "saphybris":           return new SAPHybrisAdapter(config);
        default:
            throw new Error(`No adapter implemented for: ${platform}`);
    }
}

module.exports = { getAdapter };
