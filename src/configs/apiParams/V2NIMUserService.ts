import { V2API } from './types';

const apis: Record<string, V2API> = {
  getUserList: {
    name: '批量获取用户资料',
    params: [
      {
        name: 'accountIds',
        type: 'json',
        defaultValue: ['cs1', 'cs2'],
      },
    ],
  },
  getUserListFromCloud: {
    name: '从云端获取批量获取用户资料',
    params: [
      {
        name: 'accountIds',
        type: 'json',
        defaultValue: ['cs1', 'cs2'],
      },
    ],
  },
  updateSelfUserProfile: {
    name: '更新用户资料',
    params: [
      {
        name: 'updateParams',
        type: 'json',
        defaultValue: {
          name: 'newNick',
          sign: 'signature',
          email: 'yunxin@corp.netease.com',
        },
      },
    ],
  },
  addUserToBlockList: {
    name: '添加黑名单',
    params: [
      {
        name: 'accountId',
        type: 'string',
        defaultValue: 'cs1',
      },
    ],
  },
  removeUserFromBlockList: {
    name: '移除黑名单',
    params: [
      {
        name: 'accountId',
        type: 'string',
        defaultValue: 'cs1',
      },
    ],
  },
  getBlockList: {
    name: '获取黑名单列表',
    params: [],
  },
  searchUserByOption: {
    name: '搜索用户',
    params: [
      {
        name: 'option',
        type: 'json',
        defaultValue: {
          keyword: 'name',
          searchName: true,
          searchAccountId: true,
          searchMobile: false,
        },
      },
    ],
  },
};
export default apis;
