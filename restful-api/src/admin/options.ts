import { AdminJSOptions } from 'adminjs';
import { adminResourceOptions } from './resources/admin.resource.js';
import { userResourceOptions } from './resources/user.resource.js';
import { activationCodeResourceOptions } from './resources/activation-code.resource.js';
import VerificationCode from '../db/models/verification-code.js';
import componentLoader from './component-loader.js';

const options: AdminJSOptions = {
  componentLoader,
  rootPath: '/admin',
  resources: [
    adminResourceOptions,
    userResourceOptions,
    activationCodeResourceOptions,
    {
      resource: VerificationCode,
      options: {
        navigation: {
          name: '用户管理',
          icon: 'User',
        },
        actions: {
          // 禁用所有修改操作，只保留列表和查看
          new: { isAccessible: false },
          edit: { isAccessible: false },
          delete: { isAccessible: false },
          bulkDelete: { isAccessible: false },
        },
        properties: {
          phone: {
            isTitle: true,
            position: 1,
          },
          code: {
            position: 2,
          },
          createdAt: {
            position: 3,
          },
          used: {
            position: 4,
          },
        },
      },
    },
  ],
  databases: [],
  branding: {
    companyName: '后台管理系统',
    logo: '',
    favicon: '',
  },
  locale: {
    language: 'en',
    translations: {
      labels: {
        Admin: '管理员',
        User: '用户',
        ActivationCode: '激活码',
        VerificationCode: '验证码',
      },
      resources: {
        Admin: {
          properties: {
            username: '用户名',
            password: '密码',
          },
        },
        VerificationCode: {
          properties: {
            phone: '手机号',
            code: '验证码',
            createdAt: '创建时间',
            used: '是否已使用',
          },
        },
      },
    },
  },
};

export default options;
