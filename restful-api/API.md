# API 文档

## 签名验证
所有 `/api` 开头的接口都需要进行签名验证。

### 请求头
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| X-Request-Timestamp | number | 是 | 请求时间戳（毫秒） |
| X-Request-Sign | string | 是 | 请求签名 |
| Content-Type | string | 是 | application/json |

### 签名生成规则
1. 按参数名称 ASCII 码从小到大排序（字典序）
2. 将参数名和参数值使用 `=` 拼接，多个参数使用 `&` 拼接
3. 拼接时间戳：`&timestamp=xxx`
4. 拼接密钥：`&key=xxx`
5. 对拼接后的字符串进行 MD5 加密，得到签名

### 示例代码
```javascript
const crypto = require('crypto');

// 请求参数
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

  // 4. 使用MD5生成签名
  return crypto.createHash('md5').update(signString).digest('hex');
}
```

## API 接口

### 发送验证码
```bash
curl -X POST 'http://localhost:3000/api/verification/send' \
  -H 'Content-Type: application/json' \
  -H 'X-Request-Timestamp: 1743078452634' \
  -H 'X-Request-Sign: dfc70a7c6395e28b2deb54f3a4014496' \
  -d '{
    "phone": "13800138000"
  }'
```

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| phone | string | 是 | 手机号 |

#### 响应结果
```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": {
    "code": "376208"  // 测试环境直接返回验证码
  }
}
```

### 用户注册
```bash
curl -X POST 'http://localhost:3000/api/user/register' \
  -H 'Content-Type: application/json' \
  -H 'X-Request-Timestamp: 1743078452634' \
  -H 'X-Request-Sign: dfc70a7c6395e28b2deb54f3a4014496' \
  -d '{
    "phone": "13800138000",
    "password": "123456",
    "code": "376208",
    "inviterCode": "888888"
  }'
```

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| phone | string | 是 | 手机号 |
| password | string | 是 | 密码（6-20位） |
| code | string | 是 | 验证码 |
| inviterCode | string | 否 | 邀请码 |

#### 响应结果
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "phone": "13800138000",
    "inviteCode": "123456",
    "expireAt": "2024-04-10T08:00:00.000Z"
  }
}
```

### 用户登录
```bash
curl -X POST 'http://localhost:3000/api/user/login' \
  -H 'Content-Type: application/json' \
  -H 'X-Request-Timestamp: 1743078452634' \
  -H 'X-Request-Sign: dfc70a7c6395e28b2deb54f3a4014496' \
  -d '{
    "phone": "13800138000",
    "password": "123456",
    "deviceId": "device_123456"
  }'
```

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| phone | string | 是 | 手机号 |
| password | string | 是 | 密码 |
| deviceId | string | 是 | 设备ID |

#### 响应结果
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "tokenExpireAt": "2024-04-10T08:00:00.000Z",
    "user": {
      "phone": "13800138000",
      "inviteCode": "123456",
      "maxTabs": 3,
      "status": true,
      "deviceId": "device_123456",
      "expireAt": "2024-04-10T08:00:00.000Z"
    }
  }
}
```

### 刷新Token
```bash
curl -X POST 'http://localhost:3000/api/user/refresh-token' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
  -H 'X-Request-Timestamp: 1743078452634' \
  -H 'X-Request-Sign: dfc70a7c6395e28b2deb54f3a4014496'
```

#### 请求头
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| Authorization | string | 是 | Bearer + 空格 + token |

#### 响应结果
```json
{
  "code": 200,
  "message": "刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "tokenExpireAt": "2024-04-10T08:00:00.000Z"
  }
}
```

### 验证设备ID
```bash
curl -X POST 'http://localhost:3000/api/user/verify-device' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
  -H 'X-Request-Timestamp: 1743078452634' \
  -H 'X-Request-Sign: dfc70a7c6395e28b2deb54f3a4014496' \
  -d '{
    "deviceId": "device_123456"
  }'
```

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| deviceId | string | 是 | 设备ID |

#### 响应结果
```json
{
  "code": 200,
  "message": "设备ID验证成功",
  "data": {
    "phone": "13800138000",
    "deviceId": "device_123456",
    "expireAt": "2024-04-10T08:00:00.000Z"
  }
}
```

## 错误码说明
| 错误码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权（token无效或过期） |
| 403 | 禁止访问（账号被禁用） |
| 500 | 服务器错误 | 