const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
    },
    phone: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: [true, 'Vui lòng nhập mật khẩu'],
        minlength: 6,
        select: false
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    subscription: {
        plan: {
            type: String,
            enum: ['FREE', 'PREMIUM', 'FAMILY'],
            default: 'FREE'
        },
        startDate: Date,
        expiresAt: Date,
        autoRenew: {
            type: Boolean,
            default: false
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
    devices: [{
        deviceId: String,
        deviceName: String,
        lastActive: Date
    }]
}, {
    timestamps: true
});

// Encrypt password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Token
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Check if subscription is active
UserSchema.methods.hasActiveSubscription = function () {
    if (this.subscription.plan === 'FREE') return true;
    if (!this.subscription.expiresAt) return false;
    return new Date() < new Date(this.subscription.expiresAt);
};

module.exports = mongoose.model('User', UserSchema);
