# 大布点 API 服务

## 项目介绍
大布点 API 服务是一个基于 Node.js + Koa2 + TypeScript + MongoDB 构建的 RESTful API 服务，提供用户管理、验证码、设备绑定等功能。

## 技术栈
- Node.js
- Koa2
- TypeScript
- MongoDB
- JWT
- AdminJS (管理后台)

## 功能特性
- 用户注册与登录
- 手机号验证码
- 设备绑定与验证
- Token 管理
- 邀请码系统
- 用户到期时间管理
- 管理后台

## 环境要求
- Node.js >= 16
- MongoDB >= 4.4
- TypeScript >= 4.5

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `.env.example` 文件为 `.env`，并修改相关配置：
```bash
cp .env.example .env
```

### 3. 编译 TypeScript
```bash
npm run build
```

### 4. 启动服务
```bash
npm start
```

## 开发
```bash
# 开发模式启动（支持热重载）
npm run dev

# 代码检查
npm run lint

# 构建
npm run build
```

## 目录结构
```
restful-api/
├── src/
│   ├── admin/          # 管理后台配置
│   ├── db/             # 数据库配置和模型
│   ├── middleware/     # 中间件
│   ├── routes/         # 路由
│   ├── utils/          # 工具类
│   └── app.ts          # 应用入口
├── dist/               # 编译后的文件
├── .env               # 环境变量
├── package.json       # 项目配置
└── tsconfig.json      # TypeScript 配置
```

## 环境变量说明
| 变量名 | 说明 | 默认值 |
|-------|------|--------|
| PORT | 服务端口 | 3000 |
| MONGODB_URI | MongoDB 连接地址 | mongodb://localhost:27017/dabudian |
| JWT_SECRET | JWT 密钥 | your-secret-key |
| JWT_EXPIRES_IN | Token 过期时间 | 7d |
| SIGN_SECRET_KEY | 签名密钥 | your-sign-secret-key-here |
| SIGN_EXPIRE_TIME | 签名有效期（秒） | 600 |
| DEFAULT_USER_EXPIRES_DAYS | 默认用户到期天数 | 7 |
| INVITE_USER_EXPIRES_DAYS | 邀请用户到期天数 | 15 |

## API 文档
详细的 API 文档请查看 [API.md](./API.md)

## 管理后台
访问地址：`http://localhost:3000/admin`

## 开发团队
- 后端开发：xxx
- 测试：xxx

## 许可证
MIT 