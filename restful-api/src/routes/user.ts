import Router from '@koa/router';
import User from '../db/models/user.js';
import VerificationCode from '../db/models/verification-code.js';
import ActivationCode from '../db/models/activation-code.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = new Router({
  prefix: '/api/user',
});

// 用户登录
router.post('/login', async (ctx) => {
  try {
    const { phone, password, deviceId } = ctx.request.body;

    // 参数验证
    if (!phone || !password || !deviceId) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '手机号、密码和设备ID不能为空'
      };
      return;
    }

    // 查找用户
    const user = await User.findOne({ phone });
    if (!user) {
      ctx.status = 200;
      ctx.body = {
        code: 401,
        message: '用户不存在'
      };
      return;
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      ctx.status = 200;
      ctx.body = {
        code: 401,
        message: '密码错误'
      };
      return;
    }

    // 检查用户状态
    if (!user.status) {
      ctx.status = 200;
      ctx.body = {
        code: 403,
        message: '登录失败，账号被禁用'
      };
      return;
    }

    // 检查设备码
    if (user.deviceId) {
      // 如果已有设备码，验证是否一致
      if (user.deviceId !== deviceId) {
        ctx.status = 200;
        ctx.body = {
          code: 400,
          message: '设备码不一致，登录失败'
        };
        return;
      }
    } else {
      // 首次绑定设备码
      user.deviceId = deviceId;
      // 设置到期时间为7天后
      user.expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    // 更新登录信息
    user.lastLoginAt = new Date();
    user.lastLoginIp = ctx.request.ip;
    await user.save();

    // 生成 JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        phone: user.phone,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    // 解析token获取到期时间
    const decoded = jwt.decode(token) as { exp: number };
    const tokenExpireAt = new Date(decoded.exp * 1000);

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: '登录成功',
      data: {
        token,
        tokenExpireAt,
        user: {
          phone: user.phone,
          inviteCode: user.inviteCode,
          maxTabs: user.maxTabs,
          status: user.status,
          deviceId: user.deviceId,
          expireAt: user.expireAt,
        },
      },
    };
  } catch (error) {
    console.error('登录失败:', error);
    ctx.status = 200;
    ctx.body = {
      code: 500,
      message: '登录失败',
      data: {
        error: error instanceof Error ? error.message : '未知错误'
      }
    };
  }
});

// 解绑设备
router.post('/unbind-device', async (ctx) => {
  try {
    const { phone, password } = ctx.request.body;

    // 参数验证
    if (!phone || !password) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '手机号和密码不能为空'
      };
      return;
    }

    // 查找用户
    const user = await User.findOne({ phone });
    if (!user) {
      ctx.status = 200;
      ctx.body = {
        code: 401,
        message: '用户不存在'
      };
      return;
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      ctx.status = 200;
      ctx.body = {
        code: 401,
        message: '密码错误'
      };
      return;
    }

    // 检查用户状态
    if (!user.status) {
      ctx.status = 200;
      ctx.body = {
        code: 403,
        message: '账号已被禁用'
      };
      return;
    }

    // 检查是否有设备码
    if (!user.deviceId) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '当前账号未绑定设备'
      };
      return;
    }

    // 解绑设备并减少到期时间
    user.deviceId = null;
    if (user.expireAt) {
      user.expireAt = new Date(user.expireAt.getTime() - 24 * 60 * 60 * 1000);
    }

    await user.save();

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: '解绑设备成功',
      data: {
        expireAt: user.expireAt,
      },
    };
  } catch (error) {
    console.error('解绑设备失败:', error);
    ctx.status = 200;
    ctx.body = {
      code: 500,
      message: '解绑设备失败',
      data: {
        error: error instanceof Error ? error.message : '未知错误'
      }
    };
  }
});

// 用户注册
router.post('/register', async (ctx) => {
  try {
    const { phone, password, code, inviterCode } = ctx.request.body;

    // 参数验证
    if (!phone || !password || !code) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '手机号、密码和验证码不能为空'
      };
      return;
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '无效的手机号格式'
      };
      return;
    }

    // 验证密码长度
    if (password.length < 6 || password.length > 20) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '密码长度必须在6-20位之间'
      };
      return;
    }

    // 验证验证码
    const verificationCode = await VerificationCode.findOne({
      phone,
      code,
      used: false,
    });

    if (!verificationCode) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '验证码无效或已过期'
      };
      return;
    }

    // 检查手机号是否已注册
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '该手机号已注册'
      };
      return;
    }

    // 查找邀请人
    let inviterId = null;
    let expireAt = new Date();
    const defaultExpireDays = parseInt(process.env.DEFAULT_USER_EXPIRES_DAYS || '7', 10);
    expireAt.setDate(expireAt.getDate() + defaultExpireDays); // 默认有效期

    if (inviterCode) {
      const inviter = await User.findOne({ inviteCode: inviterCode });
      if (!inviter) {
        ctx.status = 200;
        ctx.body = {
          code: 400,
          message: '邀请码不存在'
        };
        return;
      }
      inviterId = inviter._id;

      // 计算新的到期时间
      const inviteExpireDays = parseInt(process.env.INVITE_USER_EXPIRES_DAYS || '15', 10);
      expireAt = new Date();
      expireAt.setDate(expireAt.getDate() + inviteExpireDays);

      // 更新邀请人的到期时间
      await User.findByIdAndUpdate(inviter._id, {
        $set: { expireAt: expireAt }
      });
    }

    // 创建新用户
    const user = new User({
      phone,
      password,
      inviterId,
      status: true,
      maxTabs: 3,
      expireAt: expireAt,
    });

    await user.save();

    // 标记验证码已使用
    verificationCode.used = true;
    await verificationCode.save();

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: '注册成功',
      data: {
        phone: user.phone,
        inviteCode: user.inviteCode,
        inviterId: user.inviterId,
        expireAt: user.expireAt,
      },
    };
  } catch (error) {
    console.error('注册失败:', error);
    ctx.status = 200;
    ctx.body = {
      code: 500,
      message: '注册失败',
      data: {
        error: error instanceof Error ? error.message : '未知错误'
      }
    };
  }
});

// 激活码激活
router.post('/activate', async (ctx) => {
  try {
    const { phone, password, code } = ctx.request.body;

    // 参数验证
    if (!phone || !password || !code) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '手机号、密码和激活码不能为空'
      };
      return;
    }

    // 查找用户
    const user = await User.findOne({ phone });
    if (!user) {
      ctx.status = 200;
      ctx.body = {
        code: 401,
        message: '用户不存在'
      };
      return;
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      ctx.status = 200;
      ctx.body = {
        code: 401,
        message: '密码错误'
      };
      return;
    }

    // 检查用户状态
    if (!user.status) {
      ctx.status = 200;
      ctx.body = {
        code: 403,
        message: '账号已被禁用'
      };
      return;
    }

    // 查找激活码
    const activationCode = await ActivationCode.findOne({ code });
    if (!activationCode) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '激活码无效'
      };
      return;
    }

    // 检查激活码是否已被使用
    if (activationCode.status) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '该激活码已被使用'
      };
      return;
    }

    // 更新激活码状态
    activationCode.status = true;
    activationCode.userId = user._id;
    activationCode.usedAt = new Date();
    await activationCode.save();

    // 更新用户到期时间：在现有到期时间基础上增加天数
    if (user.expireAt) {
      user.expireAt = new Date(user.expireAt.getTime() + activationCode.days * 24 * 60 * 60 * 1000);
    } else {
      // 如果用户没有到期时间，从当前时间开始计算
      user.expireAt = new Date(Date.now() + activationCode.days * 24 * 60 * 60 * 1000);
    }
    await user.save();

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: '激活成功',
      data: {
        expireAt: user.expireAt,
        days: activationCode.days,
      },
    };
  } catch (error) {
    console.error('激活失败:', error);
    ctx.status = 200;
    ctx.body = {
      code: 500,
      message: '激活失败',
      data: {
        error: error instanceof Error ? error.message : '未知错误'
      }
    };
  }
});

// 验证设备ID
router.post('/verify-device', async (ctx) => {
  try {
    const { deviceId } = ctx.request.body;
    const token = ctx.request.headers.authorization?.split(' ')[1];

    // 参数验证
    if (!deviceId || !token) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '设备ID和token不能为空'
      };
      return;
    }

    // 验证token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    } catch (error) {
      ctx.status = 200;
      ctx.body = {
        code: 401,
        message: 'token无效或已过期'
      };
      return;
    }

    // 查找用户
    const user = await User.findById(decoded.userId);
    if (!user) {
      ctx.status = 200;
      ctx.body = {
        code: 401,
        message: '用户不存在'
      };
      return;
    }

    // 检查用户状态
    if (!user.status) {
      ctx.status = 200;
      ctx.body = {
        code: 403,
        message: '账号已被禁用'
      };
      return;
    }

    // 检查设备ID是否一致
    if (!user.deviceId) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '用户未绑定设备'
      };
      return;
    }

    if (user.deviceId !== deviceId) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '设备ID不一致'
      };
      return;
    }

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: '设备ID验证成功',
      data: {
        phone: user.phone,
        deviceId: user.deviceId,
        expireAt: user.expireAt,
      },
    };
  } catch (error) {
    console.error('设备ID验证失败:', error);
    ctx.status = 200;
    ctx.body = {
      code: 500,
      message: '设备ID验证失败',
      data: {
        error: error instanceof Error ? error.message : '未知错误'
      }
    };
  }
});

// 刷新token
router.post('/refresh-token', async (ctx) => {
  try {
    const token = ctx.request.headers.authorization?.split(' ')[1];

    // 参数验证
    if (!token) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: 'token不能为空'
      };
      return;
    }

    // 验证旧token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string, phone: string };
    } catch (error) {
      // 如果token已过期，尝试解析token内容
      try {
        decoded = jwt.decode(token) as { userId: string, phone: string };
      } catch (decodeError) {
        ctx.status = 200;
        ctx.body = {
          code: 401,
          message: 'token无效'
        };
        return;
      }
    }

    if (!decoded || !decoded.userId) {
      ctx.status = 200;
      ctx.body = {
        code: 401,
        message: 'token无效'
      };
      return;
    }

    // 查找用户
    const user = await User.findById(decoded.userId);
    if (!user) {
      ctx.status = 200;
      ctx.body = {
        code: 401,
        message: '用户不存在'
      };
      return;
    }

    // 检查用户状态
    if (!user.status) {
      ctx.status = 200;
      ctx.body = {
        code: 403,
        message: '账号已被禁用'
      };
      return;
    }

    // 生成新的 JWT token
    const newToken = jwt.sign(
      { 
        userId: user._id,
        phone: user.phone,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    // 解析token获取到期时间
    const tokenDecoded = jwt.decode(newToken) as { exp: number };
    const tokenExpireAt = new Date(tokenDecoded.exp * 1000);

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: 'token刷新成功',
      data: {
        token: newToken,
        tokenExpireAt,
        user: {
          phone: user.phone,
          inviteCode: user.inviteCode,
          maxTabs: user.maxTabs,
          status: user.status,
          deviceId: user.deviceId,
          expireAt: user.expireAt,
        },
      },
    };
  } catch (error) {
    console.error('刷新token失败:', error);
    ctx.status = 200;
    ctx.body = {
      code: 500,
      message: '刷新token失败',
      data: {
        error: error instanceof Error ? error.message : '未知错误'
      }
    };
  }
});

export default router; 