import crypto from 'crypto';

export class SignUtil {
  private static readonly SECRET_KEY = process.env.SIGN_SECRET_KEY || 'your-sign-secret-key-here';
  private static readonly SIGN_EXPIRE_TIME = parseInt(process.env.SIGN_EXPIRE_TIME || '600', 10) * 1000; // 默认600秒(10分钟)有效期

  /**
   * 生成签名
   * @param params 请求参数
   * @param timestamp 时间戳
   * @returns 签名
   */
  static generateSign(params: Record<string, any>, timestamp: number): string {
    // 1. 将参数按照key升序排序
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc: Record<string, any>, key) => {
        acc[key] = params[key];
        return acc;
      }, {});

    // 2. 将参数转换为字符串
    const paramString = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    // 3. 拼接时间戳和密钥
    const signString = `${paramString}&timestamp=${timestamp}&key=${this.SECRET_KEY}`;
    console.log('签名字符串:', signString);

    // 4. 使用MD5生成签名
    return crypto.createHash('md5').update(signString).digest('hex');
  }

  /**
   * 验证签名
   * @param params 请求参数
   * @param timestamp 时间戳
   * @param sign 签名
   * @returns 是否有效
   */
  static verifySign(params: Record<string, any>, timestamp: number, sign: string): boolean {
    // 1. 验证时间戳是否在有效期内
    const now = Date.now();
    if (Math.abs(now - timestamp) > this.SIGN_EXPIRE_TIME) {
      console.log('时间戳超出有效期');
      console.log('当前时间:', now);
      console.log('请求时间:', timestamp);
      console.log('有效期(秒):', this.SIGN_EXPIRE_TIME / 1000);
      return false;
    }

    // 2. 生成签名并比对
    const generatedSign = this.generateSign(params, timestamp);
    return generatedSign === sign;
  }
} 