// backend/app.js

const express = require('express');
const mongoose = require('mongoose');
const logger = require('./config/logger');
const { isPurePiCoin } = require('./services/badgeService');

const app = express();
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/global_connect';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => logger.info('MongoDB connected successfully'))
    .catch(err => logger.error('MongoDB connection error:', err));

// Example route
app.post('/api/validate-coin', async (req, res) => {
    const coin = req.body;
    try {
        const isValid = await isPurePiCoin(coin);
        res.status(200).json({ valid: isValid });
    } catch (error) {
        logger.error(error.message);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
