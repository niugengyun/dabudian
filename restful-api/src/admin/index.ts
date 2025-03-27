import AdminJS from 'adminjs';
import User from '../db/models/user.js';
import VerificationCode from '../db/models/verification-code.js';
import bcrypt from 'bcryptjs';

const adminJs = new AdminJS({
  resources: [
    {
      resource: User,
      options: {
        navigation: {
          name: '用户管理',
          icon: 'User',
        },
        listProperties: ['phone', 'createdAt', 'lastLoginIp', 'lastLoginAt', 'status', 'maxTabs', 'inviteCode', 'deviceId', 'expireAt'],
        properties: {
          phone: {
            isVisible: {
              list: true,
              edit: true,
              filter: true,
              show: true,
            },
          },
          password: {
            isVisible: {
              list: false,
              edit: true,
              filter: false,
              show: false,
            },
          },
          createdAt: {
            isVisible: {
              list: true,
              edit: false,
              filter: true,
              show: true,
            },
          },
          lastLoginIp: {
            isVisible: {
              list: true,
              edit: false,
              filter: true,
              show: true,
            },
          },
          lastLoginAt: {
            isVisible: {
              list: true,
              edit: false,
              filter: true,
              show: true,
            },
          },
          status: {
            isVisible: {
              list: true,
              edit: true,
              filter: true,
              show: true,
            },
          },
          maxTabs: {
            isVisible: {
              list: true,
              edit: true,
              filter: true,
              show: true,
            },
          },
          inviteCode: {
            isVisible: {
              list: true,
              edit: false,
              filter: true,
              show: true,
            },
          },
          deviceId: {
            isVisible: {
              list: true,
              edit: false,
              filter: true,
              show: true,
            },
          },
          expireAt: {
            isVisible: {
              list: true,
              edit: false,
              filter: true,
              show: true,
            },
          },
        },
        actions: {
          new: {
            before: async (request: any) => {
              if (request.payload.password) {
                request.payload.password = await bcrypt.hash(request.payload.password, 10);
              }
              return request;
            },
          },
          edit: {
            before: async (request: any) => {
              if (request.payload.password) {
                request.payload.password = await bcrypt.hash(request.payload.password, 10);
              }
              return request;
            },
          },
        },
      },
    },
    {
      resource: VerificationCode,
      options: {
        navigation: {
          name: '验证码管理',
          icon: 'Key',
        },
        properties: {
          createdAt: {
            isVisible: {
              list: true,
              edit: false,
              filter: true,
              show: true,
            },
          },
          used: {
            isVisible: {
              list: true,
              edit: false,
              filter: true,
              show: true,
            },
          },
        },
      },
    },
  ],
  rootPath: '/admin',
  locale: {
    language: 'zh',
    translations: {
      labels: {
        User: '用户',
        VerificationCode: '验证码',
        properties: {
          phone: '手机号',
          createdAt: '创建时间',
          lastLoginIp: '最后登录IP',
          lastLoginAt: '最后登录时间',
          status: '状态',
          maxTabs: '最大标签数',
          inviteCode: '邀请码',
          deviceId: '设备码',
          expireAt: '到期时间',
        },
      },
    },
  },
});

export default adminJs; 