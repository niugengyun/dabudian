import Router from '@koa/router';
import User from '../db/models/user.js';
import VerificationCode from '../db/models/verification-code.js';
const router = new Router({
    prefix: '/api/user',
});
router.post('/register', async (ctx) => {
    try {
        const { phone, password, code, inviterCode } = ctx.request.body;
        if (!phone || !password || !code) {
            ctx.status = 400;
            ctx.body = { error: '手机号、密码和验证码不能为空' };
            return;
        }
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            ctx.status = 400;
            ctx.body = { error: '无效的手机号格式' };
            return;
        }
        if (password.length < 6 || password.length > 20) {
            ctx.status = 400;
            ctx.body = { error: '密码长度必须在6-20位之间' };
            return;
        }
        const verificationCode = await VerificationCode.findOne({
            phone,
            code,
            used: false,
        });
        if (!verificationCode) {
            ctx.status = 400;
            ctx.body = { error: '验证码无效或已过期' };
            return;
        }
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            ctx.status = 400;
            ctx.body = { error: '该手机号已注册' };
            return;
        }
        let inviterId = null;
        if (inviterCode) {
            const inviter = await User.findOne({ inviteCode: inviterCode });
            if (inviter) {
                inviterId = inviter._id;
            }
        }
        const user = new User({
            phone,
            password,
            inviterId,
        });
        await user.save();
        verificationCode.used = true;
        await verificationCode.save();
        ctx.body = {
            message: '注册成功',
            data: {
                phone: user.phone,
                inviteCode: user.inviteCode,
            },
        };
    }
    catch (error) {
        console.error('注册失败:', error);
        ctx.status = 500;
        ctx.body = { error: '注册失败' };
    }
});
export default router;
