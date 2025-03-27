import { adminResourceOptions } from './resources/admin.resource.js';
import { userResourceOptions } from './resources/user.resource.js';
import { activationCodeResourceOptions } from './resources/activation-code.resource.js';
import componentLoader from './component-loader.js';
const options = {
    componentLoader,
    rootPath: '/admin',
    resources: [
        adminResourceOptions,
        userResourceOptions,
        activationCodeResourceOptions,
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
            },
            resources: {
                Admin: {
                    properties: {
                        username: '用户名',
                        password: '密码',
                    },
                },
            },
        },
    },
};
export default options;
