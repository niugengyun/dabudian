import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid/non-secure';
import bcrypt from 'bcryptjs';
const nanoid = customAlphabet('1234567890', 6);
const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (v) => /^1[3-9]\d{9}$/.test(v),
            message: props => `${props.value} 不是有效的中国手机号!`
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 20,
    },
    inviterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        default: null
    },
    inviteCode: {
        type: String,
        unique: true,
        required: true
    },
    maxTabs: {
        type: Number,
        default: 3,
        min: 1,
        max: 10
    },
    status: {
        type: Boolean,
        default: true
    },
    deviceId: {
        type: String,
        required: false,
        default: null
    },
    lastLoginIp: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    expireAt: {
        type: Date,
        default: null
    }
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('phone'))
        return next();
    try {
        let inviteCode = this.phone.slice(-6);
        const existingUser = await mongoose.model('User').findOne({ inviteCode });
        if (existingUser) {
            inviteCode = nanoid();
        }
        this.inviteCode = inviteCode;
        next();
    }
    catch (error) {
        next(error);
    }
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
const User = mongoose.model('User', userSchema);
export default User;
