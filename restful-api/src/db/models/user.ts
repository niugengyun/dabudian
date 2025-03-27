import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid/non-secure';
import bcrypt from 'bcryptjs';

// 创建 nanoid 生成器，只使用数字
const nanoid = customAlphabet('1234567890', 6);

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v: string) => /^1[3-9]\d{9}$/.test(v),
      message: props => `${props.value} 不是有效的中国手机号!`
    }
  },
  password: {
    type: String,
    required: true,
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
  },
  activationCode: {
    type: String,
    default: null,
  },
  isActivated: {
    type: Boolean,
    default: false,
  },
});

// 生成邀请码的中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('phone')) return next();
  
  try {
    // 尝试使用手机号后6位作为邀请码
    let inviteCode = this.phone.slice(-6);
    
    // 检查是否已存在
    const existingUser = await mongoose.model('User').findOne({ inviteCode });
    
    // 如果已存在，使用 nanoid 生成新的邀请码
    if (existingUser) {
      inviteCode = nanoid();
    }
    
    this.inviteCode = inviteCode;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

const User = mongoose.model('User', userSchema);

export default User; 