import { Context, Next } from 'koa';
import { SignUtil } from '../utils/sign.js';

export async function signMiddleware(ctx: Context, next: Next) {
  try {
    // 只对 /api 开头的路由进行签名验证
    if (!ctx.path.startsWith('/api')) {
      await next();
      return;
    }

    // 获取请求参数
    const params = ctx.method === 'GET' ? ctx.query : ctx.request.body;
    const timestamp = parseInt(ctx.headers['x-request-timestamp'] as string, 10);
    const sign = ctx.headers['x-request-sign'] as string;

    // 验证必要参数
    if (!timestamp || !sign) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '缺少签名参数'
      };
      return;
    }

    // 验证签名
    const isValid = SignUtil.verifySign(params, timestamp, sign);

    if (!isValid) {
      ctx.status = 200;
      ctx.body = {
        code: 400,
        message: '签名验证失败'
      };
      return;
    }

    // 签名验证通过，继续处理请求
    await next();
  } catch (error) {
    console.error('签名验证失败:', error);
    ctx.status = 200;
    ctx.body = {
      code: 500,
      message: '签名验证失败',
      data: {
        error: error instanceof Error ? error.message : '未知错误'
      }
    };
  }
} 