const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Banner = require('../models/Banner');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'server/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Get all banners
router.get('/', async (req, res) => {
    try {
        const { page } = req.query;
        const query = page ? { page } : {};
        const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching banners', error: error.message });
    }
});

// Add new banner
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required' });
        }

        const banner = new Banner({
            image: `/uploads/${req.file.filename}`,
            page: req.body.page,
            order: req.body.order || 0,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true
        });

        await banner.save();
        res.status(201).json(banner);
    } catch (error) {
        res.status(500).json({ message: 'Error creating banner', error: error.message });
    }
});

// Delete banner
router.delete('/:id', async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        // Delete image file
        const imagePath = path.join(__dirname, '..', banner.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await Banner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting banner', error: error.message });
    }
});

// Update banner order
router.put('/:id/order', async (req, res) => {
    try {
        const banner = await Banner.findByIdAndUpdate(
            req.params.id,
            { order: req.body.order },
            { new: true }
        );
        res.json(banner);
    } catch (error) {
        res.status(500).json({ message: 'Error updating banner order', error: error.message });
    }
});

module.exports = router;