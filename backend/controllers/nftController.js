// backend/controllers/nftController.js

const NFTService = require('../services/nftService');
const UserService = require('../services/userService'); // Assuming you have a userService
const { validate } = require('uuid'); // For NFT ID validation
const { isPositiveNumber } = require('../utils/validation'); // Custom validation utility
const logger = require('../config/logger'); // Assuming you have a logger

class NFTController {
    /**
     * Creates a new NFT.  Requires authentication and authorization (e.g., only certain users can create NFTs).
     * @param {Request} req - Express request object.  Expects title, description, imageUrl, and price in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async createNFT(req, res) {
        const creatorId = req.user.id; // ID of the user creating the NFT
        const { title, description, imageUrl, price } = req.body;

        logger.info(`User ${creatorId} attempting to create NFT with title ${title}.`);

        try {
            // 1. Input Validation
            if (!title || !description || !imageUrl || !price) {
                logger.warn(`User ${creatorId} - Missing NFT creation details.`);
                return res.status(400).json({ message: 'Title, description, image URL, and price are required.' });
            }

            if (!isPositiveNumber(price)) {
                logger.warn(`User ${creatorId} - Invalid NFT price: ${price}`);
                return res.status(400).json({ message: 'Price must be a positive number.' });
            }

            // 2. Authorization Check (Example: Only users with 'creator' role can create NFTs)
            const creator = await UserService.getUserById(creatorId);
            if (!creator || !creator.isNFTCreator) {
                logger.warn(`User ${creatorId} - Unauthorized attempt to create NFT.`);
                return res.status(403).json({ message: 'Unauthorized to create NFTs.' }); // 403 Forbidden
            }

            // 3. NFT Creation Logic (Using NFTService)
            const nft = await NFTService.createNFT({
                title: title,
                description: description,
                imageUrl: imageUrl,
                price: price,
                creatorId: creatorId,
                ownerId: creatorId // Initially, the creator owns the NFT
            });

            // 4. Audit Logging
            logger.info(`User ${creatorId} successfully created NFT ${nft.id} with title ${title}.`);

            // 5. Response
            res.status(201).json({ message: 'NFT created successfully', nft: nft });

        } catch (error) {
            logger.error(`User ${creatorId} - Error creating NFT: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to create NFT. Please try again later.' });
        }
    }

    /**
     * Gets an NFT by ID.  No authentication required (NFTs are publicly viewable), but authorization may be needed for certain actions.
     * @param {Request} req - Express request object.  Expects nftId in the request parameters.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async getNFT(req, res) {
        const { nftId } = req.params;

        logger.info(`Requesting NFT with ID ${nftId}.`);

        try {
            // 1. Input Validation
            if (!nftId) {
                logger.warn(`Missing nftId in getNFT request.`);
                return res.status(400).json({ message: 'NFT ID is required.' });
            }

            if (!validate(nftId)) { // Use uuid package for UUID validation
                logger.warn(`Invalid NFT ID format: ${nftId}`);
                return res.status(400).json({ message: 'Invalid NFT ID format.' });
            }

            // 2. NFT Retrieval (Using NFTService)
            const nft = await NFTService.getNFTById(nftId);

            if (!nft) {
                logger.warn(`NFT not found: ${nftId}`);
                return res.status(404).json({ message: 'NFT not found.' });
            }

            // 3. Response
            res.status(200).json({ nft: nft });

        } catch (error) {
            logger.error(`Error getting NFT: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to get NFT. Please try again later.' });
        }
    }

    /**
     * Lists all NFTs.  Supports pagination and filtering (e.g., by owner, price range).
     * @param {Request} req - Express request object.  Supports optional query parameters: page, limit, ownerId, minPrice, maxPrice.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async listNFTs(req, res) {
        const { page = 1, limit = 10, ownerId, minPrice, maxPrice } = req.query; // Default pagination values

        logger.info(`Listing NFTs. Page: ${page}, Limit: ${limit}, Owner: ${ownerId}, MinPrice: ${minPrice}, MaxPrice: ${maxPrice}`);

        try {
            // 1. Input Validation (Sanitize and validate pagination parameters)
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            if (isNaN(pageNumber) || pageNumber < 1) {
                logger.warn(`Invalid page number: ${page}`);
                return res.status(400).json({ message: 'Invalid page number.' });
            }

            if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) { // Limit the maximum page size
                logger.warn(`Invalid limit: ${limit}`);
                return res.status(400).json({ message: 'Invalid limit. Must be between 1 and 100.' });
            }

            const filter = {
                ownerId: ownerId,
                minPrice: minPrice,
                maxPrice: maxPrice
            };

            // 2. NFT Retrieval (Using NFTService)
            const { nfts, totalCount } = await NFTService.listNFTs(filter, pageNumber, limitNumber);

            // 3. Audit Logging
            logger.info(`Successfully retrieved ${nfts.length} NFTs.`);

            // 4. Response (Include pagination metadata)
            res.status(200).json({
                nfts: nfts,
                page: pageNumber,
                limit: limitNumber,
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / limitNumber) // Calculate total pages
            });

        } catch (error) {
            logger.error(`Error listing NFTs: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to list NFTs. Please try again later.' });
        }
    }

    /**
     * Buys an NFT.  Requires authentication and sufficient funds.
     * @param {Request} req - Express request object.  Expects nftId in the request parameters.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async buyNFT(req, res) {
        const buyerId = req.user.id;
        const { nftId } = req.params;

        logger.info(`User ${buyerId} attempting to buy NFT ${nftId}.`);

        try {
            // 1. Input Validation
            if (!nftId) {
                logger.warn(`User ${buyerId} - Missing nftId in buyNFT request.`);
                return res.status(400).json({ message: 'NFT ID is required.' });
            }

            if (!validate(nftId)) { // Use uuid package for UUID validation
                logger.warn(`User ${buyerId} - Invalid NFT ID format: ${nftId}`);
                return res.status(400).json({ message: 'Invalid NFT ID format.' });
            }

            // 2. Purchase Logic (Using NFTService)
            const transaction = await NFTService.buyNFT(nftId, buyerId);

            // 3. Audit Logging
            logger.info(`User ${buyerId} successfully bought NFT ${nftId}. Transaction ID: ${transaction.id}`);

            // 4. Response
            res.status(200).json({ message: 'NFT purchased successfully', transaction: transaction });

        } catch (error) {
            logger.error(`User ${buyerId} - Error buying NFT: ${error.message}`, { stack: error.stack });

            // 5. Error Handling
            if (error.name === 'InsufficientFundsError') {
                return res.status(400).json({ message: 'Insufficient funds.' });
            } else if (error.name === 'NFTNotFoundError') {
                return res.status(404).json({ message: 'NFT not found.' });
            } else if (error.name === 'NFTAlreadyOwnedError') {
                return res.status(400).json({ message: 'You already own this NFT.' });
            }

            res.status(500).json({ message: 'Failed to buy NFT. Please try again later.' });
        }
    }

    /**
     * Lists an NFT for sale.  Requires authentication and ownership of the NFT.
     * @param {Request} req - Express request object.  Expects nftId in the request parameters and price in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async listNFTForSale(req, res) {
        const sellerId = req.user.id;
        const { nftId } = req.params;
        const { price } = req.body;

        logger.info(`User ${sellerId} attempting to list NFT ${nftId} for sale with price ${price}.`);

        try {
            // 1. Input Validation
            if (!nftId || !price) {
                logger.warn(`User ${sellerId} - Missing nftId or price in listNFTForSale request.`);
                return res.status(400).json({ message: 'NFT ID and price are required.' });
            }

            if (!validate(nftId)) { // Use uuid package for UUID validation
                logger.warn(`User ${sellerId} - Invalid NFT ID format: ${nftId}`);
                return res.status(400).json({ message: 'Invalid NFT ID format.' });
            }

            if (!isPositiveNumber(price)) {
                logger.warn(`User ${sellerId} - Invalid NFT price: ${price}`);
                return res.status(400).json({ message: 'Price must be a positive number.' });
            }

            // 2. Listing Logic (Using NFTService)
            const listing = await NFTService.listNFTForSale(nftId, sellerId, price);

            // 3. Audit Logging
            logger.info(`User ${sellerId} successfully listed NFT ${nftId} for sale with price ${price}. Listing ID: ${listing.id}`);

            // 4. Response
            res.status(200).json({ message: 'NFT listed for sale successfully', listing: listing });

        } catch (error) {
            logger.error(`User ${sellerId} - Error listing NFT for sale: ${error.message}`, { stack: error.stack });

            // 5. Error Handling
            if (error.name === 'NFTNotFoundError') {
                return res.status(404).json({ message: 'NFT not found.' });
            } else if (error.name === 'UnauthorizedError') {
                return res.status(403).json({ message: 'Unauthorized to list this NFT for sale.' });
            }

            res.status(500).json({ message: 'Failed to list NFT for sale. Please try again later.' });
        }
    }

    /**
     * Removes an NFT from sale. Requires authentication and ownership of the NFT.
     * @param {Request} req - Express request object. Expects nftId in the request parameters.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async removeNFTFromSale(req, res) {
        const sellerId = req.user.id;
        const { nftId } = req.params;

        logger.info(`User ${sellerId} attempting to remove NFT ${nftId} from sale.`);

        try {
            // 1. Input Validation
            if (!nftId) {
                logger.warn(`User ${sellerId} - Missing nftId in removeNFTFromSale request.`);
                return res.status(400).json({ message: 'NFT ID is required.' });
            }

            if (!validate(nftId)) { // Use uuid package for UUID validation
                logger.warn(`User ${sellerId} - Invalid NFT ID format: ${nftId}`);
                return res.status(400).json({ message: 'Invalid NFT ID format.' });
            }

            // 2. Removal Logic (Using NFTService)
            await NFTService.removeNFTFromSale(nftId, sellerId);

            // 3. Audit Logging
            logger.info(`User ${sellerId} successfully removed NFT ${nftId} from sale.`);

            // 4. Response
            res.status(200).json({ message: 'NFT removed from sale successfully' });

        } catch (error) {
            logger.error(`User ${sellerId} - Error removing NFT from sale: ${error.message}`, { stack: error.stack });

            // 5. Error Handling
            if (error.name === 'NFTNotFoundError') {
                return res.status(404).json({ message: 'NFT not found.' });
            } else if (error.name === 'UnauthorizedError') {
                return res.status(403).json({ message: 'Unauthorized to remove this NFT from sale.' });
            }

            res.status(500).json({ message: 'Failed to remove NFT from sale. Please try again later.' });
        }
    }
}

module.exports = NFTController;
