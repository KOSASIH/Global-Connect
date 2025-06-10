// backend/routes/nftRoutes.js

const express = require('express');
const router = express.Router();
const NFTController = require('../controllers/nftController');
const { authenticate } = require('../middleware/authMiddleware'); // Assuming you have authentication middleware
const { validateCreateNFT, validateUpdateNFT } = require('../middleware/nftValidationMiddleware'); // Validation middleware

/**
 * @route POST /api/nfts
 * @desc Create a new NFT. Requires authentication and admin privileges.
 * @access Private (Admin only)
 */
router.post('/', authenticate, validateCreateNFT, NFTController.createNFT);

/**
 * @route GET /api/nfts/:nftId
 * @desc Get an NFT by ID.
 * @access Public
 */
router.get('/:nftId', NFTController.getNFT);

/**
 * @route GET /api/nfts
 * @desc List all NFTs. Supports pagination and filtering.
 * @access Public
 */
router.get('/', NFTController.listNFTs);

/**
 * @route PUT /api/nfts/:nftId
 * @desc Update an NFT by ID. Requires authentication and admin privileges.
 * @access Private (Admin only)
 */
router.put('/:nftId', authenticate, validateUpdateNFT, NFTController.updateNFT);

/**
 * @route DELETE /api/nfts/:nftId
 * @desc Delete an NFT by ID. Requires authentication and admin privileges.
 * @access Private (Admin only)
 */
router.delete('/:nftId', authenticate, NFTController.deleteNFT);

/**
 * @route GET /api/nfts/owner/:ownerId
 * @desc Get all NFTs owned by a specific user. Requires authentication.
 * @access Private (User or Admin)
 */
router.get('/owner/:ownerId', authenticate, NFTController.getNFTsByOwner);

/**
 * @route POST /api/nfts/:nftId/transfer/:newOwnerId
 * @desc Transfer ownership of an NFT to a new user. Requires authentication.
 * @access Private (Owner or Admin)
 */
router.post('/:nftId/transfer/:newOwnerId', authenticate, NFTController.transferNFT);

/**
 * @route POST /api/nfts/:nftId/mint
 * @desc Mint a new NFT (create on the blockchain). Requires authentication and admin privileges.
 * @access Private (Admin only)
 */
router.post('/:nftId/mint', authenticate, NFTController.mintNFT);

module.exports = router;
