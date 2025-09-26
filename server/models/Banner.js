const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    page: {
        type: String,
        required: true,
        enum: ['home', 'about', 'contact', 'apply', 'car-refinance', 'new-car-loan', 'personal-loan', 'property-loan', 'commercial-vehicle-loan']
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Banner', BannerSchema);