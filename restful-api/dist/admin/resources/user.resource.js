import User from '../../db/models/user.js';
import { customAlphabet } from 'nanoid/non-secure';
const nanoid = customAlphabet('1234567890', 6);
export const userResourceOptions = {
    resource: User,
    options: {
        navigation: {
            name: '用户管理',
            icon: 'User',
        },
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
        listProperties: ['phone', 'inviterId', 'inviteCode', 'lastLoginIp', 'status', 'createdAt', 'lastLoginAt'],
        properties: {
            phone: {
                isTitle: true,
            },
            password: {
                isVisible: {
                    list: false,
                    filter: false,
                    show: false,
                    edit: true,
                },
                isRequired: true,
                type: 'password',
            },
            inviterId: {
                isVisible: {
                    list: true,
                    filter: true,
                    show: true,
                    edit: true,
                },
                isRequired: false,
                reference: 'User',
                populate: {
                    property: 'phone',
                },
                label: 'Inviter',
            },
            inviteCode: {
                isVisible: {
                    list: true,
                    filter: true,
                    show: true,
                    edit: true,
                },
                isRequired: false,
            },
            lastLoginIp: {
                isVisible: {
                    list: true,
                    filter: true,
                    show: true,
                    edit: false,
                },
            },
            deviceId: {
                isVisible: {
                    list: true,
                    filter: true,
                    show: true,
                    edit: true,
                },
                isRequired: false,
            },
            status: {
                isVisible: {
                    list: true,
                    filter: true,
                    show: true,
                    edit: true,
                },
            },
            createdAt: {
                isVisible: {
                    list: true,
                    filter: true,
                    show: true,
                    edit: false,
                },
                type: 'datetime',
                format: 'yyyy-MM-dd HH:mm:ss',
                dateFormat: 'yyyy-MM-dd HH:mm:ss',
                showTime: true,
                showDate: true,
                showSeconds: true,
            },
            lastLoginAt: {
                isVisible: {
                    list: true,
                    filter: true,
                    show: true,
                    edit: false,
                },
                type: 'datetime',
                format: 'yyyy-MM-dd HH:mm:ss',
                dateFormat: 'yyyy-MM-dd HH:mm:ss',
                showTime: true,
                showDate: true,
                showSeconds: true,
            },
            expireAt: {
                isVisible: {
                    list: true,
                    filter: true,
                    show: true,
                    edit: true,
                },
                type: 'datetime',
                format: 'yyyy-MM-dd HH:mm:ss',
                dateFormat: 'yyyy-MM-dd HH:mm:ss',
                showTime: true,
                showDate: true,
                showSeconds: true,
            },
        },
        actions: {
            new: {
                before: async (request) => {
                    const phone = request.payload.phone;
                    if (!/^1[3-9]\d{9}$/.test(phone)) {
                        throw new Error('无效的手机号格式');
                    }
                    const password = request.payload.password;
                    if (!password || password.length < 6 || password.length > 20) {
                        throw new Error('密码长度必须在6-20位之间');
                    }
                    let inviteCode = phone.slice(-6);
                    const existingUser = await User.findOne({ inviteCode });
                    if (existingUser) {
                        inviteCode = nanoid();
                    }
                    request.payload.inviteCode = inviteCode;
                    return request;
                },
                after: async (response) => {
                    if (response.record && response.record.errors) {
                        console.error('创建用户时的验证错误:', response.record.errors);
                    }
                    return response;
                },
            },
            edit: {
                before: async (request) => {
                    const phone = request.payload.phone;
                    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
                        throw new Error('无效的手机号格式');
                    }
                    const password = request.payload.password;
                    if (password && (password.length < 6 || password.length > 20)) {
                        throw new Error('密码长度必须在6-20位之间');
                    }
                    if (request.payload.inviteCode) {
                        const existingUser = await User.findOne({
                            inviteCode: request.payload.inviteCode,
                            _id: { $ne: request.record.params.id }
                        });
                        if (existingUser) {
                            throw new Error('该邀请码已被使用');
                        }
                    }
                    if (!password) {
                        delete request.payload.password;
                    }
                    return request;
                },
                after: async (response) => {
                    if (response.record && response.record.errors) {
                        console.error('编辑用户时的验证错误:', response.record.errors);
                    }
                    return response;
                },
            },
        },
    },
};
