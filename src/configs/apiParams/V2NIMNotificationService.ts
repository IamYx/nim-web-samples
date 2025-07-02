import { V2API } from './types';

const apis: Record<string, V2API> = {
  sendCustomNotification: {
    name: '发送自定义系统通知',
    params: [
      {
        name: 'conversationId',
        type: 'string',
        defaultValue: 'cjhz1|1|cs6',
      },

      {
        name: 'content',
        type: 'string',
        defaultValue: 'content',
      },
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          notificationConfig: {},
          pushConfig: {},
          antispamConfig: {},
          routeConfig: {},
        },
      },
    ],
  },
};
export default apis;
