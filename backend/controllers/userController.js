// backend/controllers/userController.js
const UserService = require('../services/userService');

class UserController {
    // Register a new user
    static async register(req, res) {
        const { username, password } = req.body;
        try {
            const newUser  = await UserService.register(username, password);
            res.status(201).json({ message: 'User  registered successfully', user: newUser  });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // User login
    static async login(req, res) {
        const { username, password } = req.body;
        try {
            const { token, user } = await UserService.login(username, password);
            res.json({ token, user });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }

    // Get user profile
    static async getUser Profile(req, res) {
        const { username } = req.params;
        try {
            const userProfile = await UserService.getUser Profile(username);
            res.json(userProfile);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    // Update user profile
    static async updateUser Profile(req, res) {
        const { username } = req.params;
        const updates = req.body;
        try {
            const updatedUser  = await UserService.updateUser Profile(username, updates);
            res.json(updatedUser );
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    // Delete user account
    static async deleteUser (req, res) {
        const { username } = req.params;
        try {
            const deletedUser  = await UserService.deleteUser (username);
            res.json({ message: 'User  deleted successfully', user: deletedUser  });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}

module.exports = UserController;
