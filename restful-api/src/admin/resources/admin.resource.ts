import { ResourceOptions } from 'adminjs';
import Admin from '../../db/models/admin.js';

export const adminResourceOptions = {
  resource: Admin,
  options: {
    navigation: {
      name: '系统管理',
      icon: 'User',
    },
    properties: {
      password: {
        isVisible: {
          list: false,
          filter: false,
          show: false,
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
      },
      updatedAt: {
        isVisible: {
          list: true,
          filter: true,
          show: true,
          edit: false,
        },
      },
    },
    actions: {
      new: {
        before: async (request: any) => {
          if (request.payload.password) {
            request.payload = {
              ...request.payload,
              encryptedPassword: request.payload.password,
            };
          }
          return request;
        },
      },
      edit: {
        before: async (request: any) => {
          if (request.payload.password) {
            request.payload = {
              ...request.payload,
              encryptedPassword: request.payload.password,
            };
          }
          return request;
        },
      },
    },
  },
}; 