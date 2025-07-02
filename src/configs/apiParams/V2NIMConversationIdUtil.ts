import { V2API } from './types';

const apis: Record<string, V2API> = {
  p2pConversationId: {
    name: '构造点对点会话ID',
    params: [
      {
        name: 'accountId',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  teamConversationId: {
    name: '构造群会话ID',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  superTeamConversationId: {
    name: '构造超大群会话ID',
    params: [
      {
        name: 'superTeamId',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  parseConversationType: {
    name: '解析会话类型',
    params: [
      {
        name: 'conversationId',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  parseConversationTargetId: {
    name: '解析会话目标账号',
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
