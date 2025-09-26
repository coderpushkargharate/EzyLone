const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    loanType: {
        type: String,
        required: true
    },
    loanAmount: {
        type: String,
        required: true
    },
    message: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Contact', ContactSchema);