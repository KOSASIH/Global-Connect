const redis = require('redis');
const client = redis.createClient();

client.on('error', (err) => {
    console.error('Redis error:', err);
});

async function getCachedData(key) {
    return new Promise((resolve, reject) => {
        client.get(key, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

async function setCachedData(key, value) {
    client.setex(key, 3600, value); // Cache for 1 hour
}
