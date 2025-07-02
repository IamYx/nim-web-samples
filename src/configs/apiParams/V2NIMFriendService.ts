import { V2API } from './types';

const apis: Record<string, V2API> = {
  addFriend: {
    name: '添加好友',
    params: [
      {
        name: 'accountId',
        type: 'string',
      },
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          addMode: 0,
          postscript: 'postscript',
        },
      },
    ],
  },
  deleteFriend: {
    name: '删除好友',
    params: [
      {
        name: 'accountId',
        type: 'string',
      },
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          deleteAlias: false,
        },
      },
    ],
  },
  acceptAddApplication: {
    name: '同意好友申请',
    params: [
      {
        name: 'application',
        type: 'json',
        defaultValue: {
          applicantAccountId: 'cs3',
          operatorAccountId: 'cs3',
          recipientAccountId: 'cs1',
          postscript: 'postscript',
          timestamp: 1699840284411,
          status: 0,
        },
      },
    ],
  },
  rejectAddApplication: {
    name: '拒绝好友申请',
    params: [
      {
        name: 'application',
        type: 'json',
        defaultValue: {
          applicantAccountId: 'cs3',
          recipientAccountId: 'cs1',
          operatorAccountId: 'cs3',
          postscript: 'postscript',
          timestamp: 1699840284411,
          status: 0,
        },
      },
      {
        name: 'postscript',
        type: 'string',
        defaultValue: 'postscript',
      },
    ],
  },
  setFriendInfo: {
    name: '设置好友信息',
    params: [
      {
        name: 'accountId',
        type: 'string',
      },
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          alias: 'alias',
          serverExtension: 'serverExtension',
        },
      },
    ],
  },
  getFriendList: {
    name: '获取好友列表',
    params: [],
  },
  getFriendByIds: {
    name: '通过Ids批量获取好友',
    params: [
      {
        name: 'accountIds',
        type: 'json',
        defaultValue: ['cs1', 'cs2'],
      },
    ],
  },
  checkFriend: {
    name: '查询是否是好友',
    params: [
      {
        name: 'accountIds',
        type: 'json',
        defaultValue: ['cs1', 'cs2'],
      },
    ],
  },

  getAddApplicationList: {
    name: '获取好友申请通知列表',
    params: [
      {
        name: 'option',
        type: 'json',
        defaultValue: {
          offset: 0,
          limit: 50,
          status: [],
        },
      },
    ],
  },

  getAddApplicationUnreadCount: {
    name: '获取未读好友申请通知数量',
    params: [],
  },

  setAddApplicationRead: {
    name: '设置所有的好友申请已读',
    params: [],
  },

  clearAllAddApplication: {
    name: '清空所有好友申请',
    params: [],
  },

  deleteAddApplication: {
    name: '删除好友申请',
    params: [
      {
        name: 'applicationInfo',
        type: 'json',
        defaultValue: {
          applicantAccountId: 'ctt1',
          recipientAccountId: 'ctt2',
          operatorAccountId: 'ctt1',
          postscript: '请求加为好友，第一次',
          status: 0,
          timestamp: 123,
        },
      },
    ],
  },

  searchFriendByOption: {
    name: '搜索好友',
    params: [
      {
        name: 'option',
        type: 'json',
        defaultValue: {
          keyword: 'name',
          searchAccountId: true,
        },
      },
    ],
  },
};
export default apis;
