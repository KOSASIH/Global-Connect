// Load .env variables
require('dotenv').config();
const config = require('config');

module.exports = {
  // Server
  port: process.env.PORT || config.get('server.port'),

  // Database
  db: {
    host: process.env.DB_HOST || config.get('database.host'),
    port: process.env.DB_PORT || config.get('database.port'),
    user: process.env.DB_USER || config.get('database.user'),
    password: process.env.DB_PASSWORD || config.get('database.password'),
    name: process.env.DB_NAME || config.get('database.name')
  },

  // Stellar
  stellar: {
    network: process.env.STELLAR_NETWORK || config.get('stellar.network'),
    secretKey: process.env.STELLAR_SECRET_KEY,
    publicKey: process.env.STELLAR_PUBLIC_KEY
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION || config.get('jwt.expiration')
  },

  // Email
  email: {
    service: process.env.EMAIL_SERVICE || config.get('email.service'),
    user: process.env.EMAIL_USER || config.get('email.user'),
    password: process.env.EMAIL_PASSWORD || config.get('email.password')
  },

  // AI Services
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY,
    googleCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || config.get('ai.googleCredentials')
  },

  // Node environment
  nodeEnv: process.env.NODE_ENV ||.WOOCOMMERCE_API_URL,
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET
    },
    magento: {
      apiUrl: process.env.MAGENTO_API_URL,
      apiToken: process.env.MAGENTO_API_TOKEN
    },
    bigcommerce: {
      storeHash: process.env.BIGCOMMERCE_STORE_HASH,
      clientId: process.env.BIGCOMMERCE_CLIENT_ID,
      accessToken: process.env.BIGCOMMERCE_ACCESS_TOKEN,
      apiUrl: process.env.B apiKey: process.env.PRESTASHOP_API_KEY
    },
    squarespace: {
      apiKey: process.env.SQUARESPACE_API_KEY
    },
    ecwid: {
      storeId: process.env.ECWID_STORE_ID,
      apiToken: process.env.ECWID_API_TOKEN
    },
    wix: {
      apiKey: process.env.WIX_API_KEY
    },
    shift4shop: {
      apiUrl: process.env.SHIFT4SHOP_API_URL,
      privateKey: process.env.SHIFT4SHOP_PRIVATE_KEY,
      publicKey: process.env.SHIFT4SHOP_PUBLIC_KEY,
      token: process.env.SHIFT4SHOP_TOKEN,
      storeUrl: process.env.SHIFT4SHOP_STORE_URL
    },
    volusion },
    zoho: {
      portalId: process.env.ZOHO_PORTAL_ID,
      accessToken: process.env.ZOHO_ACCESS_TOKEN
    },
    weebly: {
      accessToken: process.env.WEEBLY_ACCESS_TOKEN
    },
    lightspeed: {
      accountId: process.env.LIGHTSPEED_ACCOUNT_ID,
      accessToken: process.env.LIGHTSPEED_ACCESS_TOKEN
    },
    netsuite: {
      apiBase: process.env.NETSUITE_API_BASE,
      accessToken: process.env.NETSUITE_ACCESS_TOKEN
    },
    saphybris: {
      apiBase: process.env.SAPHYBRIS_API_BASE,
      accessToken: process.env.SAPHYBRIS_ACCESS_TOKEN
    },
    amazon: {
      accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
      secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY,
      mwsAuthToken: process.env.AMAZON_MWS_AUTH_TOKEN,
      sellerId: process.env.AMAZON_SELLER_ID,
      marketplaceId: process.env.AMAZON_MARKETPLACE_ID
    }
    // Add additional platforms here as needed
  }
};
