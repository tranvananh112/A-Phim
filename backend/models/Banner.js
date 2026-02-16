const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    imageUrl: {
        type: String,
        required: true
    },
    linkUrl: String,
    position: {
        type: String,
        enum: ['hero', 'sidebar', 'footer', 'popup', 'inline'],
        default: 'hero'
    },
    type: {
        type: String,
        enum: ['promotion', 'movie', 'subscription', 'announcement'],
        default: 'promotion'
    },
    targetMovie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    startDate: Date,
    endDate: Date,
    clickCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Check if banner is currently active
BannerSchema.methods.isCurrentlyActive = function () {
    if (!this.isActive) return false;
    const now = new Date();
    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;
    return true;
};

module.exports = mongoose.model('Banner', BannerSchema);
