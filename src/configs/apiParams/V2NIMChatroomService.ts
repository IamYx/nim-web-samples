import { V2API } from './types';

const apis: Record<string, V2API> = {
  updateChatroomInfo: {
    name: '更新聊天室信息',
    instance: 'chatroomV2',
    params: [
      {
        name: 'updateParams',
        type: 'json',
        defaultValue: {
          roomName: 'name',
          announcement: 'announcement',
          liveUrl: '',
          serverExtension: 'serverExtension',
          notificationEnabled: true,
          notificationExtension: 'notificationExtension',
        },
      },
      {
        name: 'antispamConfig',
        type: 'json',
        defaultValue: {
          antispamBusinessId: 'xxx',
        },
      },
    ],
  },
  updateChatroomLocationInfo: {
    name: '更新聊天室地址信息',
    instance: 'chatroomV2',
    params: [
      {
        name: 'locationConfig',
        type: 'json',
        defaultValue: {
          locationInfo: {
            x: 33,
            y: 44,
            z: 55,
          },
          distance: 77,
        },
      },
    ],
  },
  updateChatroomTags: {
    name: '更新聊天室标签',
    instance: 'chatroomV2',
    params: [
      {
        name: 'updateParams',
        type: 'json',
        defaultValue: {
          tags: ['tag1', 'tag2'],
          notifyTargetTags: '{tag: "tag1"}',
          notificationEnabled: true,
          notificationExtension: 'notificationExtension',
        },
      },
    ],
  },
  sendMessage: {
    name: '发送聊天室消息',
    instance: 'chatroomV2',
    params: [
      {
        name: 'message',
        type: 'json',
        defaultValue: '[[__message]]',
      },
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          messageConfig: {
            historyEnabled: true,
            highPriority: false,
            highPriorityNeedAck: false,
          },
          routeConfig: {
            routeEnabled: true,
            routeEnvironment: 'xxx',
          },
          antispamConfig: {
            antispamEnabled: true,
          },
          clientAntispamEnabled: true,
          clientAntispamReplace: '******',
          receiverIds: ['cs1'],
          notifyTargetTags: '{"tag": "bbb2"}',
          locationInfo: {
            x: 1,
            y: 1,
            z: 1,
          },
        },
      },
      {
        name: 'progress',
        type: 'function',
        defaultValue: `return function(progress) { console.log('上传中', progress) }`,
      },
    ],
  },
  cancelMessageAttachmentUpload: {
    name: '取消消息附件上传',
    instance: 'chatroomV2',
    params: [
      {
        name: 'message',
        type: 'json',
        defaultValue: '[[__message]]',
      },
    ],
  },
  registerCustomAttachmentParser: {
    name: '注册自定义附件解析器',
    instance: 'chatroomV2',
    params: [
      {
        name: 'parser',
        type: 'function',
        defaultValue: `return function (subType, raw) { const rawObj = JSON.parse(raw); rawObj.subType = subType;  return rawObj; }`,
      },
    ],
    // returnFn: (res: any) => {
    //   if (
    //     window.chatroomV2 &&
    //     window.chatroomV2.V2NIMChatroomMessageService &&
    //     window.chatroomV2.V2NIMChatroomMessageService.customAttachmentParsers
    //   ) {
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     window.parser = window.chatroomV2.V2NIMChatroomMessageService.customAttachmentParsers[0];
    //   }
    // },
  },
  unregisterCustomAttachmentParser: {
    name: '反注册自定义附件解析器',
    instance: 'chatroomV2',
    params: [
      {
        name: 'parser',
        type: 'string',
        defaultValue: '[[__parser]]',
      },
    ],
  },
  getMessageList: {
    name: '获取聊天室消息历史',
    instance: 'chatroomV2',
    params: [
      {
        name: 'option',
        type: 'json',
        defaultValue: {
          direction: 0,
          messageTypes: [],
          beginTime: 0,
          limit: 100,
        },
      },
    ],
  },
  getMessageListByTag: {
    name: '获取聊天室消息历史',
    instance: 'chatroomV2',
    params: [
      {
        name: 'option',
        type: 'json',
        defaultValue: {
          tags: ['tag1'],
          direction: 0,
          messageTypes: [],
          beginTime: 0,
          endTime: 0,
          limit: 100,
        },
      },
    ],
  },
  setTempChatBannedByTag: {
    name: '按标签设置聊天室禁言状态',
    instance: 'chatroomV2',
    params: [
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          targetTag: 'tag1',
          notifyTargetTags: '{tag: "tag1"}',
          duration: 1000,
          notificationEnabled: true,
        },
      },
    ],
  },
  getMemberByIds: {
    name: '获取聊天室成员信息',
    instance: 'chatroomV2',
    params: [
      {
        name: 'accountIds',
        type: 'json',
        defaultValue: ['accountId1', 'accountId2'],
      },
    ],
  },
  getMemberListByOption: {
    name: '获取聊天室成员信息',
    instance: 'chatroomV2',
    params: [
      {
        name: 'option',
        type: 'json',
        defaultValue: {
          memberRoles: [],
          onlyBlocked: false,
          onlyChatBanned: false,
          onlyOnline: false,
          pageToken: '',
          limit: 100,
        },
      },
    ],
  },
  updateSelfMemberInfo: {
    name: '更新聊天室成员信息',
    instance: 'chatroomV2',
    params: [
      {
        name: 'updateParams',
        type: 'json',
        defaultValue: {
          roomNick: 'roomNick',
          roomAvatar: 'roomAvatar',
          serverExtension: 'serverExtension',
          notificationEnabled: true,
          notifyExtension: 'notifyExtension',
          persistence: true,
        },
      },
      {
        name: 'antispamConfig',
        type: 'json',
        defaultValue: {
          antispamBusinessId: 'xxx',
        },
      },
    ],
  },
  updateMemberRole: {
    name: '更新聊天室成员信息',
    instance: 'chatroomV2',
    params: [
      {
        name: 'accountId',
        type: 'string',
        defaultValue: 'accountId',
      },
      {
        name: 'updateParams',
        type: 'json',
        defaultValue: {
          memberRole: 0,
          memberLevel: 10,
          notificationExtension: 'notificationExtension',
        },
      },
    ],
  },
  setMemberBlockedStatus: {
    name: '设置聊天室成员黑名单状态',
    instance: 'chatroomV2',
    params: [
      {
        name: 'accountId',
        type: 'string',
        defaultValue: 'accountId',
      },
      {
        name: 'blocked',
        type: 'boolean',
        defaultValue: true,
      },
      {
        name: 'notificationExtension',
        type: 'string',
        defaultValue: 'notificationExtension',
      },
    ],
  },
  setMemberChatBannedStatus: {
    name: '设置聊天室成员禁言状态',
    instance: 'chatroomV2',
    params: [
      {
        name: 'accountId',
        type: 'string',
        defaultValue: 'accountId',
      },
      {
        name: 'chatBanned',
        type: 'boolean',
        defaultValue: true,
      },
      {
        name: 'notificationExtension',
        type: 'string',
        defaultValue: 'notificationExtension',
      },
    ],
  },
  setMemberTempChatBanned: {
    name: '设置聊天室成员临时禁言状态',
    instance: 'chatroomV2',
    params: [
      {
        name: 'accountId',
        type: 'string',
        defaultValue: 'accountId',
      },
      {
        name: 'tempChatBannedDuration',
        type: 'number',
        defaultValue: 100,
      },
      {
        name: 'notificationEnabled',
        type: 'boolean',
        defaultValue: true,
      },
      {
        name: 'notificationExtension',
        type: 'string',
        defaultValue: 'notificationExtension',
      },
    ],
  },

  getMemberListByTag: {
    name: '按聊天室标签获取成员信息',
    instance: 'chatroomV2',
    params: [
      {
        name: 'option',
        type: 'json',
        defaultValue: {
          tag: 'tag1',
          pageToken: '',
          limit: 100,
        },
      },
    ],
  },

  getMemberCountByTag: {
    name: '按聊天室标签获取成员信息',
    instance: 'chatroomV2',
    params: [
      {
        name: 'tag',
        type: 'string',
        defaultValue: 'tag1',
      },
    ],
  },
  kickMember: {
    name: '踢掉聊天室成员',
    instance: 'chatroomV2',
    params: [
      {
        name: 'accountId',
        type: 'string',
        defaultValue: 'accountId',
      },
      {
        name: 'notificationExtension',
        type: 'string',
        defaultValue: 'notificationExtension',
      },
    ],
  },
};
export default apis;
