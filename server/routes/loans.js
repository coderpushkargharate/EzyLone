const express = require('express');
const LoanApplication = require('../models/LoanApplication');
const router = express.Router();

// Get all loan applications
router.get('/', async (req, res) => {
    try {
        const loans = await LoanApplication.find().sort({ createdAt: -1 });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching loan applications', error: error.message });
    }
});

// Create new loan application
router.post('/', async (req, res) => {
    try {
        const loanApplication = new LoanApplication(req.body);
        await loanApplication.save();
        res.status(201).json({ message: 'Loan application submitted successfully', loanApplication });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting loan application', error: error.message });
    }
});

// Update loan application status
router.put('/:id/status', async (req, res) => {
    try {
        const loan = await LoanApplication.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(loan);
    } catch (error) {
        res.status(500).json({ message: 'Error updating loan status', error: error.message });
    }
});

// Delete loan application
router.delete('/:id', async (req, res) => {
    try {
        await LoanApplication.findByIdAndDelete(req.params.id);
        res.json({ message: 'Loan application deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting loan application', error: error.message });
    }
});

module.exports = router;