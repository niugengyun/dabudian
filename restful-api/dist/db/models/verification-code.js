import mongoose from 'mongoose';
const verificationCodeSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600,
    },
    used: {
        type: Boolean,
        default: false,
    },
});
const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);
export default VerificationCode;
