const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Create default admin user if doesn't exist
const createDefaultAdmin = async () => {
    try {
        const adminExists = await User.findOne({ username: 'pushkar' });
        if (!adminExists) {
            await User.create({
                username: 'pushkar',
                password: 'pushkar3011'
            });
            console.log('Default admin user created');
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
};

createDefaultAdmin();

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

router.get('/verify', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;