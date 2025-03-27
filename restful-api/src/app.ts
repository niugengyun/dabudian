import AdminJS from 'adminjs';
import AdminJSKoa from '@adminjs/koa';
import { Database, Resource } from '@adminjs/mongoose';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { signMiddleware } from './middleware/sign.js';
import userRouter from './routes/user.js';
import verificationRouter from './routes/verification.js';

import provider from './admin/auth-provider.js';
import options from './admin/options.js';
import initializeDb from './db/index.js';
import createInitialAdmin from './db/init-admin.js';

// 注册 Mongoose 适配器
AdminJS.registerAdapter({ Database, Resource });

const port = process.env.PORT ? +process.env.PORT : 3000;

const start = async () => {
  try {
    const app = new Koa();

    await initializeDb();
    await createInitialAdmin();

    const admin = new AdminJS({
      ...options,
      rootPath: '/admin',
    });

    app.keys = [process.env.COOKIE_SECRET];
    
    // 添加body解析中间件
    app.use(bodyParser());

    // 注册路由
    const adminRouter = AdminJSKoa.buildAuthenticatedRouter(
      admin,
      app,
      {
        provider,
        sessionOptions: {
          renew: true,
        },
      },
    );

    // 管理后台路由
    app.use(adminRouter.routes()).use(adminRouter.allowedMethods());

    // API路由（需要签名验证）
    app.use(signMiddleware);
    app.use(userRouter.routes()).use(userRouter.allowedMethods());
    app.use(verificationRouter.routes()).use(verificationRouter.allowedMethods());

    app.listen(port, () => {
      console.log(`AdminJS available at http://localhost:${port}${admin.options.rootPath}`);
    });
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
};

start();
