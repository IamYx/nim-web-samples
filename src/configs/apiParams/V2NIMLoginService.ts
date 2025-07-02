import { V2API } from './types';

const apis: Record<string, V2API> = {
  login: {
    name: '登录',
    params: [
      {
        name: 'user',
        type: 'string',
        defaultValue: 'account1',
      },
      {
        name: 'token',
        type: 'string',
        defaultValue: 'e10adc3************f20f883e',
      },
      {
        name: 'config',
        type: 'json',
        defaultValue: JSON.stringify(
          {
            retryCount: 3,
            timeout: 60000,
            forceMode: false,
            authType: 0,
          },
          null,
          2
        ),
      },
    ],
    bestPractice: `
// 事件监听推荐在登录前设置
nim.V2NIMLoginService.on("onLoginStatus", (status) => {
  console.log("登录状态变更：", status);
})
nim.V2NIMLoginService.on("onKickedOffline", (detail) => {
  console.log("被踢下线, 原因", detail.reason);
  // todo 被踢下线提示
})
nim.V2NIMLoginService.on("onDisconnected", function (error) {
  console.log("长连接断开, 明细", error.toString());
  // todo 断线提示
})
nim.V2NIMLoginService.on("onDataSync", function (type, state, error) {
  if (type === 1 && state === 3) {
    // 当同步主任务完毕时, todo 标记可以调用其他查询 API
    // 如 nim.V2NIMLocalConversationService.getConversationList(0, 10)
  }
})
await nim.V2NIMLoginService.login('account1', 'e10adc3************f20f883e', {
  retryCount: 3,
  timeout: 60000,
  forceMode: false,
  authType: 0,
})
    `,
  },
  getLoginUser: {
    name: '获取当前登录的用户账号 ID',
  },
  getConnectStatus: {
    name: '获取连接的状态',
  },
  getLoginStatus: {
    name: '获取当前登录状态',
  },
  getLoginClients: {
    name: '获取本账号多端登录的其他端信息',
  },
  getCurrentLoginClient: {
    name: '获取本账号本端的登录信息',
  },
  kickOffline: {
    name: '踢人',
    params: [
      {
        name: 'clientId',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  getKickedOfflineDetail: {
    name: '获取自己被踢的原因',
  },
  getDataSync: {
    name: '获取同步状态',
  },
  setReconnectDelayProvider: {
    name: '设置断网重连的等待间隔函数',
    params: [
      {
        name: 'reconnectDelayProvider',
        type: 'function',
        defaultValue: `return function(delay) { console.log('触发了 reconnectDelayProvider, 旧的间隔时间为:', delay); return 3000 }`,
      },
    ],
  },
  getChatroomLinkAddress: {
    name: '获取聊天室链接地址',
    params: [
      {
        name: 'roomId',
        type: 'string',
        defaultValue: '36',
      },
      {
        name: 'miniProgram',
        type: 'boolean',
        defaultValue: false,
      },
    ],
  },
};
export default apis;
