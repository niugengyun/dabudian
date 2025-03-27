import mongoose from 'mongoose';
import crypto from 'crypto';
const activationCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        default: () => crypto.randomBytes(16).toString('hex'),
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    days: {
        type: Number,
        required: true,
        min: 1,
        comment: 'Activation code duration in days',
    },
    status: {
        type: Boolean,
        default: false,
        comment: 'false: unused, true: used',
    },
    exportStatus: {
        type: Boolean,
        default: false,
        comment: 'false: not exported, true: exported',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    usedAt: {
        type: Date,
        default: null,
    },
});
const ActivationCode = mongoose.model('ActivationCode', activationCodeSchema);
export default ActivationCode;
