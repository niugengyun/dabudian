import { ResourceOptions } from 'adminjs';
import AdminJS from 'adminjs';
import User from '../../db/models/user.js';
import { customAlphabet } from 'nanoid/non-secure';

// 创建 nanoid 生成器，只使用数字
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
    listProperties: ['phone', 'inviterId', 'inviteCode', 'status', 'expireAt', 'createdAt', 'lastLoginAt'],
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
      inputInviteCode: {
        isVisible: {
          list: false,
          filter: false,
          show: false,
          edit: true,
        },
        isRequired: false,
        label: '邀请码（选填）',
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
        before: async (request: any) => {
          // 验证手机号格式
          const phone = request.payload.phone;
          if (!/^1[3-9]\d{9}$/.test(phone)) {
            throw new Error('无效的手机号格式');
          }

          // 验证密码长度
          const password = request.payload.password;
          if (!password || password.length < 6 || password.length > 20) {
            throw new Error('密码长度必须在6-20位之间');
          }

          // 生成邀请码
          let inviteCode = phone.slice(-6);
          const existingUser = await User.findOne({ inviteCode });
          if (existingUser) {
            inviteCode = nanoid();
          }
          request.payload.inviteCode = inviteCode;

          // 处理邀请码
          const inputInviteCode = request.payload.inputInviteCode;
          if (inputInviteCode) {
            // 查找邀请人
            const inviter = await User.findOne({ inviteCode: inputInviteCode });
            if (!inviter) {
              throw new Error('邀请码不存在');
            }

            // 设置邀请人
            request.payload.inviterId = inviter._id;

            // 计算新的到期时间（当前时间 + 15天）
            const newExpireAt = new Date();
            newExpireAt.setDate(newExpireAt.getDate() + 15);

            // 更新邀请人的到期时间
            await User.findByIdAndUpdate(inviter._id, {
              $set: { expireAt: newExpireAt }
            });

            // 设置新用户的到期时间
            request.payload.expireAt = newExpireAt;
          }

          // 删除 inputInviteCode 字段，因为它只用于验证
          delete request.payload.inputInviteCode;

          return request;
        },
        after: async (response: any) => {
          if (response.record && response.record.errors) {
            console.error('创建用户时的验证错误:', response.record.errors);
          }
          return response;
        },
      },
      edit: {
        before: async (request: any) => {
          // 验证手机号格式
          const phone = request.payload.phone;
          if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
            throw new Error('无效的手机号格式');
          }

          // 验证密码长度（如果提供了密码）
          const password = request.payload.password;
          if (password && (password.length < 6 || password.length > 20)) {
            throw new Error('密码长度必须在6-20位之间');
          }

          // 如果修改了邀请码，检查是否已存在
          if (request.payload.inviteCode) {
            const existingUser = await User.findOne({
              inviteCode: request.payload.inviteCode,
              _id: { $ne: request.record.params.id }
            });
            if (existingUser) {
              throw new Error('该邀请码已被使用');
            }
          }

          // 如果没有提供密码，删除密码字段
          if (!password) {
            delete request.payload.password;
          }

          return request;
        },
        after: async (response: any) => {
          if (response.record && response.record.errors) {
            console.error('编辑用户时的验证错误:', response.record.errors);
          }
          return response;
        },
      },
    },
  },
}; 