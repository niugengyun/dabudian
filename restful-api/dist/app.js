import AdminJS from 'adminjs';
import AdminJSKoa from '@adminjs/koa';
import { Database, Resource } from '@adminjs/mongoose';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import provider from './admin/auth-provider.js';
import options from './admin/options.js';
import initializeDb from './db/index.js';
import createInitialAdmin from './db/init-admin.js';
import userRouter from './routes/user.js';
import verificationRouter from './routes/verification.js';
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
        app.use(bodyParser());
        const adminRouter = AdminJSKoa.buildAuthenticatedRouter(admin, app, {
            provider,
            sessionOptions: {
                renew: true,
            },
        });
        app.use(adminRouter.routes()).use(adminRouter.allowedMethods());
        app.use(userRouter.routes()).use(userRouter.allowedMethods());
        app.use(verificationRouter.routes()).use(verificationRouter.allowedMethods());
        app.listen(port, () => {
            console.log(`AdminJS available at http://localhost:${port}${admin.options.rootPath}`);
        });
    }
    catch (error) {
        console.error('Error starting application:', error);
        process.exit(1);
    }
};
start();
