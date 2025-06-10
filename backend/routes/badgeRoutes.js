// backend/routes/badgeRoutes.js

const express = require('express');
const router = express.Router();
const BadgeController = require('../controllers/badgeController');
const { authenticate } = require('../middleware/authMiddleware'); // Assuming you have authentication middleware
const { validateCreateBadge, validateUpdateBadge } = require('../middleware/badgeValidationMiddleware'); // Validation middleware

/**
 * @route POST /api/badges
 * @desc Create a new badge. Requires authentication and admin privileges.
 * @access Private (Admin only)
 */
router.post('/', authenticate, validateCreateBadge, BadgeController.createBadge);

/**
 * @route GET /api/badges/:badgeId
 * @desc Get a badge by ID.
 * @access Public
 */
router.get('/:badgeId', BadgeController.getBadge);

/**
 * @route GET /api/badges
 * @desc List all badges. Supports pagination and filtering.
 * @access Public
 */
router.get('/', BadgeController.listBadges);

/**
 * @route PUT /api/badges/:badgeId
 * @desc Update a badge by ID. Requires authentication and admin privileges.
 * @access Private (Admin only)
 */
router.put('/:badgeId', authenticate, validateUpdateBadge, BadgeController.updateBadge);

/**
 * @route DELETE /api/badges/:badgeId
 * @desc Delete a badge by ID. Requires authentication and admin privileges.
 * @access Private (Admin only)
 */
router.delete('/:badgeId', authenticate, BadgeController.deleteBadge);

/**
 * @route POST /api/badges/:badgeId/award/:userId
 * @desc Award a badge to a user. Requires authentication and admin privileges.
 * @access Private (Admin only)
 */
router.post('/:badgeId/award/:userId', authenticate, BadgeController.awardBadgeToUser);

/**
 * @route GET /api/badges/user/:userId
 * @desc Get all badges awarded to a specific user. Requires authentication.
 * @access Private (User only or Admin)
 */
router.get('/user/:userId', authenticate, BadgeController.getUserBadges);

module.exports = router;
