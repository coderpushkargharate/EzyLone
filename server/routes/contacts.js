const express = require('express');
const Contact = require('../models/Contact');
const router = express.Router();

// Get all contacts
router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contacts', error: error.message });
    }
});

// Create new contact
router.post('/', async (req, res) => {
    try {
        const contact = new Contact(req.body);
        await contact.save();
        res.status(201).json({ message: 'Contact form submitted successfully', contact });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting contact form', error: error.message });
    }
});

// Delete contact
router.delete('/:id', async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting contact', error: error.message });
    }
});

module.exports = router;