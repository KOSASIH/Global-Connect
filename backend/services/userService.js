// backend/services/userService.js
const User = require('../models/User'); // User model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SECRET_KEY'; // Replace with a strong secret key

class UserService {
    // Register a new user
    static async register(username, password) {
        // Check if user already exists
        const existingUser  = await User.findOne({ username });
        if (existingUser ) {
            throw new Error('User  already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser  = new User({ username, password: hashedPassword });
        await newUser .save();
        return newUser ;
    }

    // Authenticate user and return JWT
    static async login(username, password) {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        return { token, user };
    }

    // Get user profile
    static async getUser Profile(username) {
        const user = await User.findOne({ username });
        if (!user) {
            throw new Error('User  not found');
        }
        return user;
    }

    // Update user profile
    static async updateUser Profile(username, updates) {
        const user = await User.findOneAndUpdate({ username }, updates, { new: true });
        if (!user) {
            throw new Error('User  not found');
        }
        return user;
    }

    // Delete user account
    static async deleteUser (username) {
        const user = await User.findOneAndDelete({ username });
        if (!user) {
            throw new Error('User  not found');
        }
        return user;
    }
}

module.exports = UserService;
