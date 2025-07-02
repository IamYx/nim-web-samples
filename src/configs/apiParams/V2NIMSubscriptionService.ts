import { V2API } from './types';

const apis: Record<string, V2API> = {
  subscribeUserStatus: {
    name: '订阅用户状态',
    params: [
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          accountIds: ['autotest80', 'autotest81'],
          duration: 3000,
          immediateSync: true,
        },
      },
    ],
  },
  unsubscribeUserStatus: {
    name: '取消订阅用户状态',
    params: [
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          accountIds: ['autotest80', 'autotest81'],
        },
      },
    ],
  },
  publishCustomUserStatus: {
    name: '发布用户自定义状态',
    params: [
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          statusType: 10001,
          duration: 3000,
          extension: 'extension',
          onlineOnly: true,
          multiSync: true,
        },
      },
    ],
  },
  queryUserStatusSubscriptions: {
    name: '查询用户状态订阅',
    params: [
      {
        name: 'accountIds',
        type: 'json',
        defaultValue: ['autotest80', 'autotest81'],
      },
    ],
  },
};
export default apis;
