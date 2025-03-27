import ActivationCode from '../../db/models/activation-code.js';
export const activationCodeResourceOptions = {
    resource: ActivationCode,
    options: {
        navigation: {
            name: '激活码管理',
            icon: 'Key',
        },
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
        listProperties: ['code', 'userId', 'days', 'status', 'exportStatus', 'createdAt', 'usedAt'],
        properties: {
            code: {
                isTitle: true,
            },
            userId: {
                isVisible: {
                    list: true,
                    filter: true,
                    show: true,
                    edit: false,
                },
                reference: 'User',
                populate: {
                    property: 'phone',
                },
            },
            days: {
                type: 'number',
                isRequired: true,
            },
            status: {
                type: 'boolean',
                isVisible: {
                    list: true,
                    filter: true,
                    show: true,
                    edit: false,
                },
                custom: {
                    true: { label: 'Used', color: 'red' },
                    false: { label: 'Unused', color: 'green' },
                },
            },
            exportStatus: {
                type: 'boolean',
                isVisible: {
                    list: true,
                    filter: true,
                    show: true,
                    edit: false,
                },
                custom: {
                    true: { label: 'Exported', color: 'blue' },
                    false: { label: 'Not Exported', color: 'grey' },
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
            usedAt: {
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
        },
        actions: {
            new: {
                before: async (request) => {
                    const days = Number(request.payload.days);
                    if (!days || days < 1) {
                        throw new Error('Days must be greater than 0');
                    }
                    return request;
                },
            },
            bulkCreate: {
                actionType: 'resource',
                icon: 'Add',
                label: '批量创建',
                component: false,
                handler: async (request, response, context) => {
                    const count = 20;
                    const days = 30;
                    const codes = Array.from({ length: count }, () => ({
                        days,
                    }));
                    await ActivationCode.insertMany(codes);
                    return {
                        record: { params: { count, days } },
                        notice: {
                            message: `成功创建 ${count} 个激活码`,
                            type: 'success',
                        },
                    };
                },
            },
            edit: {
                isAccessible: false,
            },
            delete: {
                isAccessible: false,
            },
        },
    },
};
