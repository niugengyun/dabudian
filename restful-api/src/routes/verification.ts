import Router from '@koa/router';
import VerificationCode from '../db/models/verification-code.js';

const router = new Router({
  prefix: '/api/verification',
});

// 生成6位随机验证码
function generateCode(): string {
  return Math.random().toString().slice(-6);
}

// 发送验证码
router.post('/send', async (ctx) => {
  try {
    const { phone } = ctx.request.body;

    if (!phone) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '手机号不能为空'
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

    // 生成验证码
    const code = generateCode();
    
    // 保存验证码到数据库
    await VerificationCode.create({
      phone,
      code,
    });

    // 测试期间，在日志中输出验证码
    console.log(`验证码已发送到 ${phone}: ${code}`);

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: '验证码已发送',
      data: {
        code, // 测试期间，直接返回验证码
      },
    };
  } catch (error) {
    console.error('发送验证码失败:', error);
    ctx.status = 200;
    ctx.body = {
      code: 500,
      message: '发送验证码失败',
      data: {
        error: error instanceof Error ? error.message : '未知错误'
      }
    };
  }
});

export default router; 