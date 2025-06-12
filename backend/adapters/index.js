const AmazonAdapter = require('./AmazonAdapter');
function getAdapter(platform, config) {
    switch (platform.toLowerCase()) {
        case "woocommerce": return new WooCommerceAdapter(config);
        case "amazon": return new AmazonAdapter(config);
        default: throw new Error(`Adapter for ${platform} not implemented`);
    }
}
module.exports = { getAdapter };
