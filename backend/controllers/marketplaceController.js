// backend/controllers/marketplaceController.js

const MarketplaceService = require('../services/marketplaceService');
const NFTService = require('../services/nftService');
const UserService = require('../services/userService');
const { validate } = require('uuid');
const { isPositiveNumber } = require('../utils/validation');
const logger = require('../config/logger');

class MarketplaceController {
    /**
     * Lists an NFT on the marketplace.  This is distinct from simply listing an NFT for sale;
     * this adds it to the decentralized marketplace contract.
     * @param {Request} req - Express request object.  Expects nftId and price in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async listNFT(req, res) {
        const sellerId = req.user.id;
        const { nftId, price } = req.body;

        logger.info(`User ${sellerId} attempting to list NFT ${nftId} on the marketplace for price ${price}.`);

        try {
            // 1. Input Validation
            if (!nftId || !price) {
                logger.warn(`User ${sellerId} - Missing nftId or price in listNFT request.`);
                return res.status(400).json({ message: 'NFT ID and price are required.' });
            }

            if (!validate(nftId)) {
                logger.warn(`User ${sellerId} - Invalid NFT ID format: ${nftId}`);
                return res.status(400).json({ message: 'Invalid NFT ID format.' });
            }

            if (!isPositiveNumber(price)) {
                logger.warn(`User ${sellerId} - Invalid NFT price: ${price}`);
                return res.status(400).json({ message: 'Price must be a positive number.' });
            }

            // 2. Authorization Check (Ensure user owns the NFT)
            const nft = await NFTService.getNFTById(nftId);
            if (!nft) {
                logger.warn(`User ${sellerId} - NFT not found: ${nftId}`);
                return res.status(404).json({ message: 'NFT not found.' });
            }

            if (nft.ownerId !== sellerId) {
                logger.warn(`User ${sellerId} - Unauthorized attempt to list NFT ${nftId} (not owner).`);
                return res.status(403).json({ message: 'Unauthorized to list this NFT.' });
            }

            // 3. Marketplace Listing Logic (Using MarketplaceService)
            const listing = await MarketplaceService.listNFT(nftId, sellerId, price);

            // 4. Audit Logging
            logger.info(`User ${sellerId} successfully listed NFT ${nftId} on the marketplace. Listing ID: ${listing.id}`);

            // 5. Response
            res.status(201).json({ message: 'NFT listed on the marketplace successfully', listing: listing });

        } catch (error) {
            logger.error(`User ${sellerId} - Error listing NFT on the marketplace: ${error.message}`, { stack: error.stack });

            // 6. Error Handling
            if (error.name === 'NFTNotFoundError') {
                return res.status(404).json({ message: 'NFT not found.' });
            } else if (error.name === 'ContractError') {
                return res.status(500).json({ message: 'Error interacting with the marketplace contract.' });
            }

            res.status(500).json({ message: 'Failed to list NFT on the marketplace. Please try again later.' });
        }
    }

    /**
     * Unlists an NFT from the marketplace.
     * @param {Request} req - Express request object.  Expects nftId in the request parameters.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async unlistNFT(req, res) {
        const sellerId = req.user.id;
        const { nftId } = req.params;

        logger.info(`User ${sellerId} attempting to unlist NFT ${nftId} from the marketplace.`);

        try {
            // 1. Input Validation
            if (!nftId) {
                logger.warn(`User ${sellerId} - Missing nftId in unlistNFT request.`);
                return res.status(400).json({ message: 'NFT ID is required.' });
            }

            if (!validate(nftId)) {
                logger.warn(`User ${sellerId} - Invalid NFT ID format: ${nftId}`);
                return res.status(400).json({ message: 'Invalid NFT ID format.' });
            }

            // 2. Authorization Check (Ensure user owns the NFT)
            const nft = await NFTService.getNFTById(nftId);
            if (!nft) {
                logger.warn(`User ${sellerId} - NFT not found: ${nftId}`);
                return res.status(404).json({ message: 'NFT not found.' });
            }

            if (nft.ownerId !== sellerId) {
                logger.warn(`User ${sellerId} - Unauthorized attempt to unlist NFT ${nftId} (not owner).`);
                return res.status(403).json({ message: 'Unauthorized to unlist this NFT.' });
            }

            // 3. Marketplace Unlisting Logic (Using MarketplaceService)
            await MarketplaceService.unlistNFT(nftId, sellerId);

            // 4. Audit Logging
            logger.info(`User ${sellerId} successfully unlisted NFT ${nftId} from the marketplace.`);

            // 5. Response
            res.status(200).json({ message: 'NFT unlisted from the marketplace successfully' });

        } catch (error) {
            logger.error(`User ${sellerId} - Error unlisting NFT from the marketplace: ${error.message}`, { stack: error.stack });

            // 6. Error Handling
            if (error.name === 'NFTNotFoundError') {
                return res.status(404).json({ message: 'NFT not found.' });
            } else if (error.name === 'ContractError') {
                return res.status(500).json({ message: 'Error interacting with the marketplace contract.' });
            }

            res.status(500).json({ message: 'Failed to unlist NFT from the marketplace. Please try again later.' });
        }
    }

    /**
     * Buys an NFT from the marketplace.  This involves interacting with the decentralized marketplace contract.
     * @param {Request} req - Express request object.  Expects nftId in the request parameters.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async buyNFT(req, res) {
        const buyerId = req.user.id;
        const { nftId } = req.params;

        logger.info(`User ${buyerId} attempting to buy NFT ${nftId} from the marketplace.`);

        try {
            // 1. Input Validation
            if (!nftId) {
                logger.warn(`User ${buyerId} - Missing nftId in buyNFT request.`);
                return res.status(400).json({ message: 'NFT ID is required.' });
            }

            if (!validate(nftId)) {
                logger.warn(`User ${buyerId} - Invalid NFT ID format: ${nftId}`);
                return res.status(400).json({ message: 'Invalid NFT ID format.' });
            }

            // 2. Purchase Logic (Using MarketplaceService)
            const transaction = await MarketplaceService.buyNFT(nftId, buyerId);

            // 3. Audit Logging
            logger.info(`User ${buyerId} successfully bought NFT ${nftId} from the marketplace. Transaction ID: ${transaction.id}`);

            // 4. Response
            res.status(200).json({ message: 'NFT purchased from the marketplace successfully', transaction: transaction });

        } catch (error) {
            logger.error(`User ${buyerId} - Error buying NFT from the marketplace: ${error.message}`, { stack: error.stack });

            // 5. Error Handling
            if (error.name === 'InsufficientFundsError') {
                return res.status(400).json({ message: 'Insufficient funds.' });
            } else if (error.name === 'NFTNotFoundError') {
                return res.status(404).json({ message: 'NFT not found.' });
            } else if (error.name === 'ContractError') {
                return res.status(500).json({ message: 'Error interacting with the marketplace contract.' });
            }

            res.status(500).json({ message: 'Failed to buy NFT from the marketplace. Please try again later.' });
        }
    }

    /**
     * Lists all NFTs on the marketplace.  Supports pagination and filtering.
     * @param {Request} req - Express request object.  Supports optional query parameters: page, limit, minPrice, maxPrice.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async listMarketplaceNFTs(req, res) {
        const { page = 1, limit = 10, minPrice, maxPrice } = req.query;

        logger.info(`Listing marketplace NFTs. Page: ${page}, Limit: ${limit}, MinPrice: ${minPrice}, MaxPrice: ${maxPrice}`);

        try {
            // 1. Input Validation
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            if (isNaN(pageNumber) || pageNumber < 1) {
                logger.warn(`Invalid page number: ${page}`);
                return res.status(400).json({ message: 'Invalid page number.' });
            }

            if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
                logger.warn(`Invalid limit: ${limit}`);
                return res.status(400).json({ message: 'Invalid limit. Must be between 1 and 100.' });
            }

            const filter = {
                minPrice: minPrice,
                maxPrice: maxPrice
            };

            // 2. Marketplace NFT Retrieval (Using MarketplaceService)
            const { nfts, totalCount } = await MarketplaceService.listMarketplaceNFTs(filter, pageNumber, limitNumber);

            // 3. Audit Logging
            logger.info(`Successfully retrieved ${nfts.length} marketplace NFTs.`);

            // 4. Response
            res.status(200).json({
                nfts: nfts,
                page: pageNumber,
                limit: limitNumber,
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / limitNumber)
            });

        } catch (error) {
            logger.error(`Error listing marketplace NFTs: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to list marketplace NFTs. Please try again later.' });
        }
    }
}

module.exports = MarketplaceController;
