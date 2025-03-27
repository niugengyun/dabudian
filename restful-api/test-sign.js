import crypto from 'crypto';

// 测试参数
const params = {
  phone: '13800138000'
};

// 生成时间戳
const timestamp = Date.now();

// 密钥
const SECRET_KEY = 'your-sign-secret-key-here';

// 生成签名
function generateSign(params, timestamp) {
  // 1. 将参数按照key升序排序
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  // 2. 将参数转换为字符串
  const paramString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // 3. 拼接时间戳和密钥
  const signString = `${paramString}&timestamp=${timestamp}&key=${SECRET_KEY}`;
  console.log('签名字符串:', signString);

  // 4. 使用MD5生成签名
  return crypto.createHash('md5').update(signString).digest('hex');
}

const sign = generateSign(params, timestamp);
console.log('Timestamp:', timestamp);
console.log('Sign:', sign); 
 