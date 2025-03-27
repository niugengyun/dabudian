import Router from '@koa/router';
import VerificationCode from '../db/models/verification-code.js';
const router = new Router({
    prefix: '/api/verification',
});
function generateCode() {
    return Math.random().toString().slice(-6);
}
router.post('/send', async (ctx) => {
    try {
        const { phone } = ctx.request.body;
        if (!phone) {
            ctx.status = 400;
            ctx.body = { error: '手机号不能为空' };
            return;
        }
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            ctx.status = 400;
            ctx.body = { error: '无效的手机号格式' };
            return;
        }
        const code = generateCode();
        await VerificationCode.create({
            phone,
            code,
        });
        console.log(`验证码已发送到 ${phone}: ${code}`);
        ctx.body = {
            message: '验证码已发送',
            code,
        };
    }
    catch (error) {
        console.error('发送验证码失败:', error);
        ctx.status = 500;
        ctx.body = { error: '发送验证码失败' };
    }
});
export default router;
