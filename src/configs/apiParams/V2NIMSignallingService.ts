import { V2API } from './types';

const apis: Record<string, V2API> = {
  call: {
    name: '直接呼叫对方加入房间',
    params: [
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          calleeAccountId: 'autotest80',
          requestId: '12233',
          channelType: 2,
          channelName: 'name',
          channelExtension: 'channel extension',
          serverExtension: 'server extension',
          signallingConfig: {
            offlineEnabled: true,
            unreadEnabled: true,
            selfUid: 2222,
          },
          pushConfig: {
            pushEnabled: true,
            pushTitle: 'push title',
            pushContent: 'push Content',
          },
          rtcConfig: {
            rtcChannelName: 'rtc channel name',
            rtcTokenTtl: 300000,
          },
        },
      },
    ],
  },
  callSetup: {
    name: '呼叫建立, 包括加入信令频道房间, 同时接受对方呼叫',
    params: [
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          channelId: 'xxxxxxx',
          callerAccountId: 'acc',
          requestId: 'yyyyyy',
          serverExtension: 'server extension',
        },
      },
    ],
  },
  createRoom: {
    name: '创建房间',
    params: [
      {
        name: 'channelType',
        type: 'number',
        defaultValue: 2,
      },
      {
        name: 'channelName',
        type: 'string',
        defaultValue: 'channelName',
      },
      {
        name: 'channelExtension',
        type: 'string',
        defaultValue: 'channel Ext',
      },
    ],
  },
  delayRoom: {
    name: '延迟房间有效期(不对外)',
    params: [
      {
        name: 'channelId',
        type: 'string',
        defaultValue: 'xxxxxx',
      },
    ],
  },
  closeRoom: {
    name: '关闭房间',
    params: [
      {
        name: 'channelId',
        type: 'string',
        defaultValue: 'xxxxxx',
      },
      {
        name: 'offlineEnabled',
        type: 'boolean',
        defaultValue: true,
      },
      {
        name: 'serverExtension',
        type: 'string',
        defaultValue: 'server Ext',
      },
    ],
  },
  joinRoom: {
    name: '加入房间',
    params: [
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          channelId: '12233',
          serverExtension: 'server extension',
          signallingConfig: {
            offlineEnabled: true,
            unreadEnabled: true,
            selfUid: 2222,
          },
          rtcConfig: {
            rtcChannelName: 'rtc channel name',
            rtcTokenTtl: 300000,
          },
        },
      },
    ],
  },
  leaveRoom: {
    name: '离开房间',
    params: [
      {
        name: 'channelId',
        type: 'string',
        defaultValue: 'xxxxxx',
      },
      {
        name: 'offlineEnabled',
        type: 'boolean',
        defaultValue: true,
      },
      {
        name: 'serverExtension',
        type: 'string',
        defaultValue: 'server Ext',
      },
    ],
  },
  invite: {
    name: '邀请',
    params: [
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          channelId: '12233',
          inviteeAccountId: 'invitee',
          requestId: 'xxxxx',
          serverExtension: 'server extension',
          signallingConfig: {
            offlineEnabled: true,
            unreadEnabled: true,
            selfUid: 2222,
          },
          pushConfig: {
            pushEnabled: true,
            pushTitle: 'push title',
            pushContent: 'push Content',
          },
        },
      },
    ],
  },
  cancelInvite: {
    name: '取消邀请',
    params: [
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          channelId: '12233',
          inviteeAccountId: 'invitee',
          requestId: 'xxxxx',
          serverExtension: 'server extension',
          offlineEnabled: true,
        },
      },
    ],
  },
  rejectInvite: {
    name: '拒绝别人的邀请加入信令房间请求',
    params: [
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          channelId: 'test_channelId',
          inviterAccountId: 'test_inviter_accountId',
          requestId: 'test_requestId_1',
          serverExtension: '',
          offlineEnabled: true,
        },
      },
    ],
  },
  acceptInvite: {
    name: '接受别人的邀请加入信令房间请求',
    params: [
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          channelId: 'test_channelId',
          inviterAccountId: 'test_inviter_accountId',
          requestId: 'test_requestId_1',
          serverExtension: '',
          offlineEnabled: true,
        },
      },
    ],
  },
  sendControl: {
    name: '发送自定义控制指令',
    params: [
      {
        name: 'channelId',
        type: 'string',
        defaultValue: 'dsdsds',
      },
      {
        name: 'receiverAccountId',
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
  getRoomInfoByChannelName: {
    name: '根据频道名称查询频道房间信息',
    params: [
      {
        name: 'channelName',
        type: 'string',
        defaultValue: 'test_channel_name_123',
      },
    ],
  },
};
export default apis;
