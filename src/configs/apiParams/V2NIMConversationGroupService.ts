import { V2API } from './types';

const apis: Record<string, V2API> = {
  createConversationGroup: {
    name: '创建会话分组',
    params: [
      {
        name: 'name',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'serverExtension',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'conversationIds',
        type: 'json',
        defaultValue: [],
      },
    ],
  },
  deleteConversationGroup: {
    name: '删除会话分组',
    params: [
      {
        name: 'groupId',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  updateConversationGroup: {
    name: '更新会话分组',
    params: [
      {
        name: 'groupId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'name',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'serverExtension',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  getConversationGroup: {
    name: '通过 id 获取会话分组',
    params: [
      {
        name: 'groupId',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  getConversationGroupListByIds: {
    name: '通过 id 列表获取会话分组列表',
    params: [
      {
        name: 'groupIds',
        type: 'json',
        defaultValue: [],
      },
    ],
  },
  getConversationGroupList: {
    name: '获取会话分组列表',
    params: [],
  },

  addConversationsToGroup: {
    name: '添加会话去会话分组',
    params: [
      {
        name: 'groupId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'conversationIds',
        type: 'json',
        defaultValue: [],
      },
    ],
  },
  removeConversationsFromGroup: {
    name: '从会话分组中移除会话',
    params: [
      {
        name: 'groupId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'conversationIds',
        type: 'json',
        defaultValue: [],
      },
    ],
  },
};
export default apis;
