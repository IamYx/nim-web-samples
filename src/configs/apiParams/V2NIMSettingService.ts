import { V2API } from './types';

const apis: Record<string, V2API> = {
  getConversationMuteStatus: {
    name: '获取会话消息免打扰状态',
    params: [
      {
        name: 'conversationId',
        type: 'string',
        defaultValue: 'cs1|2|23498761',
      },
    ],
  },

  setTeamMessageMuteMode: {
    name: '设置群消息免打扰模式',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '12312312',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'muteMode',
        type: 'number',
        defaultValue: 1,
      },
    ],
  },

  getTeamMessageMuteMode: {
    name: '获取群消息免打扰模式',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '1231231',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
    ],
  },

  setP2PMessageMuteMode: {
    name: '设置点对点消息免打扰模式',
    params: [
      {
        name: 'accountId',
        type: 'string',
        defaultValue: 'cs3',
      },
      {
        name: 'muteMode',
        type: 'number',
        defaultValue: 1,
      },
    ],
  },

  getP2PMessageMuteMode: {
    name: '获取用户消息免打扰模式',
    params: [
      {
        name: 'accountId',
        type: 'string',
        defaultValue: '1231231',
      },
    ],
  },

  getP2PMessageMuteList: {
    name: '获取用户消息免打扰列表',
    params: [],
  },

  setAppBackground: {
    name: '设置应用前后台状态',
    params: [
      {
        name: 'isBackground',
        type: 'boolean',
        defaultValue: false,
      },
      {
        name: 'badge',
        type: 'number',
        defaultValue: 0,
      },
    ],
  },

  setPushMobileOnDesktopOnline: {
    name: '设置桌面端在线时，移动端是否需要推送',
    params: [
      {
        name: 'need',
        type: 'boolean',
        defaultValue: true,
      },
    ],
  },
};
export default apis;
