import { V2API } from './types';

const apis: Record<string, V2API> = {
  createConversation: {
    name: '创建本地会话',
    params: [
      {
        name: 'conversationId',
        type: 'string',
        defaultValue: 'cjhz1|1|cjhz2',
      },
    ],
  },
  deleteConversation: {
    name: '删除本地会话',
    params: [
      {
        name: 'conversationId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'clearMessage',
        type: 'boolean',
        defaultValue: false,
      },
    ],
  },
  deleteConversationListByIds: {
    name: '按 ID 删除会话',
    params: [
      {
        name: 'conversationIds',
        type: 'json',
        defaultValue: ['cs1|1|cs2', 'cs1|1|cs3'],
      },
      {
        name: 'clearMessage',
        type: 'boolean',
        defaultValue: false,
      },
    ],
  },
  updateConversationLocalExtension: {
    name: '修改会话的本地扩展',
    params: [
      {
        name: 'conversationId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'localExtension',
        type: 'string',
        defaultValue: 'This is a local extension',
      },
    ],
  },
  getConversation: {
    name: '获取会话',
    params: [
      {
        name: 'conversationId',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  getConversationListByIds: {
    name: '通过 ID 获取会话列表',
    params: [
      {
        name: 'conversationIds',
        type: 'json',
        defaultValue: [],
      },
    ],
  },
  getConversationList: {
    name: '分页获取会话列表',
    params: [
      {
        name: 'offset',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'limit',
        type: 'number',
        defaultValue: 10,
      },
    ],
  },
  getConversationListByOption: {
    name: '按条件获取会话',
    params: [
      {
        name: 'offset',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'limit',
        type: 'number',
        defaultValue: 10,
      },
      {
        name: 'option',
        type: 'json',
        defaultValue: {
          conversationTypes: [1],
          onlyUnread: false,
        },
      },
    ],
  },
  stickTopConversation: {
    name: '置顶会话',
    params: [
      {
        name: 'conversationId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'stickTop',
        type: 'boolean',
        defaultValue: false,
      },
    ],
  },
  getTotalUnreadCount: {
    name: '获取总会话未读数',
    params: [],
  },
  getUnreadCountByIds: {
    name: '根据 id 列表获取会话的未读数',
    params: [
      {
        name: 'conversationIds',
        type: 'json',
        defaultValue: ['cs1|1|cs2', 'cs1|1|cs3'],
      },
    ],
  },
  getUnreadCountByFilter: {
    name: '根据过滤参数获取相应的未读信息',
    params: [
      {
        name: 'filter',
        type: 'json',
        defaultValue: {
          conversationTypes: [1],
          ignoreMuted: false,
        },
      },
    ],
  },
  clearTotalUnreadCount: {
    name: '清空所有会话总的未读数',
    params: [],
  },
  clearUnreadCountByIds: {
    name: '根据会话 id 列表清空相应会话的未读数',
    params: [
      {
        name: 'conversationIds',
        type: 'json',
        defaultValue: ['cs1|1|cs2'],
      },
    ],
  },
  clearUnreadCountByTypes: {
    name: '清除对应指定类型下的会话的未读数',
    params: [
      {
        name: 'types',
        type: 'json',
        defaultValue: [1, 2],
      },
    ],
  },
  subscribeUnreadCountByFilter: {
    name: '订阅指定过滤条件的会话未读数变化',
    params: [
      {
        name: 'filter',
        type: 'json',
        defaultValue: {
          conversationTypes: [1],
          ignoreMuted: false,
        },
      },
    ],
  },
  unsubscribeUnreadCountByFilter: {
    name: '取消订阅指定过滤条件的会话未读数变化',
    params: [
      {
        name: 'filter',
        type: 'json',
        defaultValue: {
          conversationTypes: [1],
          ignoreMuted: false,
        },
      },
    ],
  },
  markConversationRead: {
    name: '标记会话为已读',
    params: [
      {
        name: 'conversationId',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  getConversationReadTime: {
    name: '获取会话的已读时间',
    params: [
      {
        name: 'conversationId',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
};
export default apis;
