// backend/api/user.js
const express = require('express');
const UserService = require('../services/userService');
const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser  = await UserService.register(username, password);
        res.status(201).json({ message: 'User  registered successfully', user: newUser  });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// User login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const { token, user } = await UserService.login(username, password);
        res.json({ token, user });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

// Get user profile
router.get('/profile/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const userProfile = await UserService.getUser Profile(username);
        res.json(userProfile);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Update user profile
router.put('/profile/:username', async (req, res) => {
    const { username } = req.params;
    const updates = req.body;
    try {
        const updatedUser  = await UserService.updateUser Profile(username, updates);
        res.json(updatedUser );
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Delete user account
router.delete('/profile/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const deletedUser  = await UserService.deleteUser (username);
        res.json({ message: 'User  deleted successfully', user: deletedUser  });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

module.exports = router;
