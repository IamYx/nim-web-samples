// import msg from './msg'
import { V2API } from './types';

const apis: Record<string, V2API> = {
  sendMessage: {
    name: '发送消息',
    returnVar: '__message',
    params: [
      {
        name: 'message',
        type: 'json',
        defaultValue: '[[__message]]',
      },
      {
        name: 'conversationId',
        type: 'string',
        defaultValue: 'cjhz1|1|cs6',
      },
      {
        name: 'params',
        type: 'json',
        defaultValue: JSON.stringify(
          {
            messageConfig: {},
            routeConfig: {},
            pushConfig: {},
            antispamConfig: {},
            robotConfig: {},
            // aiConfig: {
            //   accountId: '',
            //   content: {
            //     msg: '',
            //     type: 0
            //   },
            //   messages: [
            //     {
            //       msg: '',
            //       type: 0,
            //       role: 'user'
            //     },
            //     {
            //       msg: '',
            //       type: 0,
            //       role: 'assistant'
            //     }
            //   ],
            //   promptVariables: '',
            //   modelConfigParams: {
            //     prompt: '',
            //     maxTokens: 10,
            //     topP: 0.8,
            //     temperature: 1.0
            //   }
            // },
            clientAntispamEnabled: true,
            clientAntispamReplace: '******',
          },
          null,
          2
        ),
      },
      {
        name: 'progress',
        type: 'function',
        defaultValue: `return function(progress) { console.log('上传中', progress) }`,
      },
    ],
    bestPractice: `
const messageBeforeSend = nim.V2NIMMessageCreator.createTextMessage("hello world")
const conversationId = nim.V2NIMConversationIdUtil.p2pConversationId("targetAccid")
const message = await nim.V2NIMMessageService.sendMessage(messageBeforeSend, conversationId, {
  "clientAntispamEnabled": true,
  "clientAntispamReplace": "******"
})
    `,
  },
  replyMessage: {
    name: '回复消息',
    params: [
      {
        name: 'message',
        type: 'json',
        defaultValue: '[[__targetMessage]]',
      },
      {
        name: 'replyMessage',
        type: 'json',
        defaultValue: '[[__message]]',
      },
      {
        name: 'param',
        type: 'json',
        defaultValue: {
          messageConfig: {},
          routeConfig: {},
          pushConfig: {},
          antispamConfig: {},
          robotConfig: {},
        },
      },
    ],
    bestPractice: `
// 制造一条消息
const messageBeforeSend = nim.V2NIMMessageCreator.createTextMessage("hello world")
const conversationId = nim.V2NIMConversationIdUtil.p2pConversationId("targetAccid")
const targetMessage = await nim.V2NIMMessageService.sendMessage(messageBeforeSend, conversationId, {
  "clientAntispamEnabled": true,
  "clientAntispamReplace": "******"
})

// 回复上面制造的消息
const replyBeforeSend = nim.V2NIMMessageCreator.createTextMessage("The reply message")
const message = await nim.V2NIMMessageService.replyMessage(targetMessage, replyBeforeSend)
    `,
  },
  modifyMessage: {
    name: '修改消息',
    returnVar: '__message',
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
          subType: 0,
          text: '测试文本12345',
          // attachment: {},
          serverExtension: '{"a": 123}',
          routeConfig: {},
          pushConfig: {},
          antispamConfig: {},
          clientAntispamEnabled: true,
          clientAntispamReplace: '******',
        },
      },
    ],
    bestPractice: `
// 制造一条消息
const messageBeforeSend = nim.V2NIMMessageCreator.createTextMessage("hello world")
const conversationId = nim.V2NIMConversationIdUtil.p2pConversationId("targetAccid")
const targetMessage = await nim.V2NIMMessageService.sendMessage(messageBeforeSend, conversationId, {
  "clientAntispamEnabled": true,
  "clientAntispamReplace": "******"
})

// 回复上面制造的消息
const message = await nim.V2NIMMessageService.modifyMessage(targetMessage, {
  subType: 0,
  text: "修改后的文本1",
  serverExtension: '{"a": 123}',
})
    `,
  },
  revokeMessage: {
    name: '撤回消息',
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
          postscript: '',
          serverExtension: '',
          pushContent: '',
          pushPayload: '',
          env: '',
        },
      },
    ],
    bestPractice: `
// 制造一条消息
const messageBeforeSend = nim.V2NIMMessageCreator.createTextMessage("hello world")
const conversationId = nim.V2NIMConversationIdUtil.p2pConversationId("targetAccid")
const targetMessage = await nim.V2NIMMessageService.sendMessage(messageBeforeSend, conversationId, {
  "clientAntispamEnabled": true,
  "clientAntispamReplace": "******"
})

// 撤回上面制造的消息
await nim.V2NIMMessageService.revokeMessage(targetMessage, {
  postscript: '撤回的附言',
  serverExtension: '{"reason": 1}',
})
    `,
  },
  getP2PMessageReceipt: {
    name: '获取 p2p 消息已读回执(内存获取)',
    params: [
      {
        name: 'conversationId',
        type: 'string',
        defaultValue: 'cjhz1|1|cs6',
      },
    ],
  },
  getTeamMessageReceipts: {
    name: '批量获取 team 消息已读回执',
    params: [
      {
        name: 'messages',
        type: 'json',
        defaultValue: '[[__messages]]',
      },
    ],
  },
  getTeamMessageReceiptDetail: {
    name: '获取 team 消息已读回执详情',
    params: [
      {
        name: 'message',
        type: 'json',
        defaultValue: '[[__message]]',
      },
    ],
  },
  sendP2PMessageReceipt: {
    name: '发送 p2p 消息已读回执',
    params: [
      {
        name: 'message',
        type: 'json',
        defaultValue: '[[__message]]',
      },
    ],
  },
  isPeerRead: {
    name: '判断消息是否被对方已读',
    params: [
      {
        name: 'message',
        type: 'json',
        defaultValue: '[[__message]]',
      },
    ],
  },
  sendTeamMessageReceipts: {
    name: '批量发送 team 消息已读回执',
    params: [
      {
        name: 'messageArr',
        type: 'json',
      },
    ],
  },
  getMessageList: {
    name: '获取消息列表',
    returnVar: '__messages',
    params: [
      {
        name: 'option',
        type: 'json',
        defaultValue: {
          conversationId: 'cs1|1|cs6',
          messageTypes: [0, 1, 2, 3],
          beginTime: 0,
          endTime: 0,
          limit: 50,
          // anchorMessage: {}
          direction: 0,
        },
      },
    ],
  },
  getMessageListByRefers: {
    name: '根据messageRefer消息列表',
    params: [
      {
        name: 'messageRefers',
        type: 'json',
      },
    ],
  },
  deleteMessage: {
    name: '单向删除消息',
    params: [
      {
        name: 'message',
        type: 'json',
        defaultValue: '[[__message]]',
      },
      {
        name: 'serverExtension',
        type: 'string',
        defaultValue: '{}',
      },
    ],
    bestPractice: `
// 制造一条消息
const messageBeforeSend = nim.V2NIMMessageCreator.createTextMessage("hello world")
const conversationId = nim.V2NIMConversationIdUtil.p2pConversationId("targetAccid")
const targetMessage = await nim.V2NIMMessageService.sendMessage(messageBeforeSend, conversationId, {
  "clientAntispamEnabled": true,
  "clientAntispamReplace": "******"
})

// 删除上面制造的消息
await nim.V2NIMMessageService.deleteMessage(targetMessage)
    `,
  },
  deleteMessages: {
    name: '批量单向删除消息',
    params: [
      {
        name: 'messages',
        type: 'json',
        defaultValue: '[[__messages]]',
      },
      {
        name: 'serverExtension',
        type: 'string',
        defaultValue: '{}',
      },
    ],
    bestPractice: `
// 制造一条消息
const messageBeforeSend = nim.V2NIMMessageCreator.createTextMessage("hello world")
const conversationId = nim.V2NIMConversationIdUtil.p2pConversationId("targetAccid")
const targetMessage = await nim.V2NIMMessageService.sendMessage(messageBeforeSend, conversationId, {
  "clientAntispamEnabled": true,
  "clientAntispamReplace": "******"
})

// 删除上面制造的消息
await nim.V2NIMMessageService.deleteMessages([targetMessage])
    `,
  },
  clearHistoryMessage: {
    name: '清空单聊历史消息',
    params: [
      {
        name: 'conversationId',
        type: 'string',
        defaultValue: 'cs1|1|cs6',
      },
      {
        name: 'deleteRoam',
        type: 'boolean',
        defaultValue: true,
      },
      {
        name: 'onlineSync',
        type: 'boolean',
        defaultValue: false,
      },
      {
        name: 'serverExtension',
        type: 'string',
        defaultValue: 'ext',
      },
    ],
  },
  pinMessage: {
    name: 'pin消息',
    params: [
      {
        name: 'message',
        type: 'json',
        defaultValue: '[[__message]]',
      },
      {
        name: 'serverExtension',
        type: 'string',
        defaultValue: 'ext',
      },
    ],
  },
  unpinMessage: {
    name: 'unpin消息',
    params: [
      {
        name: 'messageRefer',
        type: 'json',
        defaultValue: '[[__message]]',
      },
      {
        name: 'serverExtension',
        type: 'string',
        defaultValue: 'ext',
      },
    ],
  },
  updatePinMessage: {
    name: '更新pin消息扩展字段',
    params: [
      {
        name: 'message',
        type: 'json',
        defaultValue: '[[__message]]',
      },
      {
        name: 'serverExtension',
        type: 'string',
        defaultValue: 'ext',
      },
    ],
  },
  getPinnedMessageList: {
    name: '获取pin消息列表',
    params: [
      {
        name: 'conversationId',
        type: 'string',
        defaultValue: 'cjhz1|1|cs6',
      },
    ],
  },
  addQuickComment: {
    name: '添加快捷回复',
    params: [
      {
        name: 'message',
        type: 'json',
        defaultValue: '[[__message]]',
      },
      {
        name: 'index',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'serverExtension',
        type: 'string',
        defaultValue: 'ext',
      },
      {
        name: 'pushConfig',
        type: 'json',
        defaultValue: {
          pushContent: 'quickCommentPushContent',
          pushPayload: 'quickCommentPushPayload',
          title: 'quickCommentPushTitle',
          pushEnabled: true,
          needBadge: true,
        },
      },
    ],
  },
  removeQuickComment: {
    name: '删除快捷回复',
    params: [
      {
        name: 'messageRefer',
        type: 'json',
        defaultValue: '[[__message]]',
      },
      {
        name: 'index',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'serverExtension',
        type: 'string',
        defaultValue: 'ext',
      },
    ],
  },
  getQuickCommentList: {
    name: '获取快捷回复列表',
    params: [
      {
        name: 'message',
        type: 'json',
        defaultValue: '[[__messages]]',
      },
    ],
  },
  addCollection: {
    name: '添加收藏',
    params: [
      {
        name: 'param',
        type: 'json',
        defaultValue: {
          collectionType: 1,
          collectionData: '',
          serverExtension: 'ext',
          uniqueId: '1',
        },
      },
    ],
  },
  removeCollections: {
    name: '批量删除收藏',
    params: [
      {
        name: 'collections',
        type: 'json',
        defaultValue: {},
      },
    ],
  },
  updateCollectionExtension: {
    name: '更新收藏扩展字段',
    params: [
      {
        name: 'collection',
        type: 'json',
        defaultValue: {},
      },
      {
        name: 'serverExtension',
        type: 'string',
        defaultValue: 'ext',
      },
    ],
  },
  getCollectionListByOption: {
    name: '分页查询收藏',
    params: [
      {
        name: 'param',
        type: 'json',
        defaultValue: {
          beginTime: 0,
          endTime: 0,
          anchorCollection: {
            collectionType: 1,
            collectionData: '',
            serverExtension: 'ext',
            uniqueId: '1',
          },
          direction: 0,
          limit: 100,
          collectionType: 0,
        },
      },
    ],
  },
  getCollectionListExByOption: {
    name: '分页查询收藏',
    params: [
      {
        name: 'param',
        type: 'json',
        defaultValue: {
          beginTime: 0,
          endTime: 0,
          anchorCollection: {
            collectionType: 1,
            collectionData: '',
            serverExtension: 'ext',
            uniqueId: '1',
          },
          direction: 0,
          limit: 100,
          collectionType: 0,
        },
      },
    ],
  },
  voiceToText: {
    name: '语音转文字',
    params: [
      {
        name: 'voiceObj',
        type: 'json',
        defaultValue: {
          // voicePath: 'nim-external',
          // file: '',
          voiceUrl:
            'https://nim.nosdn.127.net/MTAxMTAwMg==/bmltYV8xMDMwMzI4XzE2OTI5NDM0NTgxNDlfMmU2Y2YwMGQtOGJkYi00NTNhLWI3MTctMGQ2OWUwZDVjNjEw',
          mimeType: '',
          sampleRate: '',
          duration: 30000,
          sceneName: '',
        },
      },
    ],
    bestPractice: `
// 现成有的 NOS 链接
await nim.V2NIMMessageService.voiceToText({
  voiceUrl:
    'https://nim.nosdn.127.net/MTAxMTAwMg==/bmltYV8xMDMwMzI4XzE2OTI5NDM0NTgxNDlfMmU2Y2YwMGQtOGJkYi00NTNhLWI3MTctMGQ2OWUwZDVjNjEw',
  mimeType: 'audio/mpeg',
  duration: 27000
})

// or 有文件对象
await nim.V2NIMMessageService.voiceToText({
  // 假设有这么一个 DOM 结构 <input type="file" id="nim-external">
  // 获取文件对象. 先上传后解析.
  file: document.getElementById('nim-external').files[0],
  mimeType: 'audio/mpeg',
  duration: 27000
})
    `,
  },
  cancelMessageAttachmentUpload: {
    name: '取消消息附件上传',
    params: [
      {
        name: 'message',
        type: 'json',
        defaultValue: '[[__message]]',
      },
    ],
  },
  searchCloudMessages: {
    name: '云端消息检索',
    params: [
      {
        name: 'param',
        type: 'json',
        defaultValue: {
          keyword: 'keyword',
          beginTime: 0,
          endTime: 0,
          conversationLimit: 0,
          sortOrder: 0,
          p2pAccountIds: ['cs1', 'cs2'],
          teamIds: ['team1', 'team2'],
          senderAccountIds: ['zk1', 'zk2'],
          messageTypes: [0, 1, 2, 3],
          messageSubtypes: [0, 1, 2, 3],
        },
      },
    ],
  },
  getThreadMessageList: {
    name: '云端获取thread消息列表',
    params: [
      {
        name: 'param',
        type: 'json',
        defaultValue: {
          messageRefer: {
            senderId: 'cs1',
            receiverId: 'cs2',
            messageClientId: 'clientId',
            messageServerId: 'serverId',
            createTime: 2131232,
            conversationType: 1,
            conversationId: 'cs1|1|cs2',
          },
          beginTime: 0,
          limit: 50,
          direction: 0,
        },
      },
    ],
  },
  registerCustomAttachmentParser: {
    name: '注册自定义附件解析器',
    params: [
      {
        name: 'parser',
        type: 'function',
        defaultValue: `return function (subType, raw) { const rawObj = JSON.parse(raw); rawObj.subType = subType;  return rawObj; }`,
      },
    ],
    // returnFn: (res: any) => {
    //   if (window.nim.V2NIMMessageService && window.nim.V2NIMMessageService.customAttachmentParsers) {
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     window.parser = window.nim.V2NIMMessageService.customAttachmentParsers[0]
    //   }
    // }
  },
  unregisterCustomAttachmentParser: {
    name: '反注册自定义附件解析器',
    params: [
      {
        name: 'parser',
        type: 'string',
        defaultValue: '[[__parser]]',
      },
    ],
  },
  stopAIStreamMessage: {
    name: '停止AI流式消息',
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
          operationType: 0,
        },
      },
    ],
    bestPractice: `
// 前置获取 AI 数字人列表. 假设有一项目
const aiUserList = await nim.V2NIMAIService.getAIUserList()
// 前置选择一个 AI 数字人
const aiUserAccid = aiUserList[0].accountId

/** step 1: 监听收消息事件 **/
nim.V2NIMMessageService.on('onReceiveMessages', function(msgs) {
  msgs.forEach(msg => {
    // 筛选出 AI 消息且是一个流式消息
    if (msg.aiConfig && msg.aiConfig.accountId && msg.streamConfig) {        
      /** step 3: 过一阵子收到了 AI 响应的消息, 试图停止流式输出 **/
      console.log('Trigger onReceiveMessages and get ai message', msg)
      nim.V2NIMMessageService.stopAIStreamMessage(msg, {
        operationType: 0
      })
    }
  })
})

/** step 2: 制造一条流式 AI 消息 **/
const messageBeforeSend = nim.V2NIMMessageCreator.createTextMessage("如何做一份番茄炒蛋?")
const conversationId = nim.V2NIMConversationIdUtil.p2pConversationId(aiUserAccid)
const targetMessage = await nim.V2NIMMessageService.sendMessage(messageBeforeSend, conversationId, {
  aiConfig: {
    accountId: aiUserAccid,
    // 流式消息输出
    aiStream: true,
  },
})
    `,
  },
  regenAIMessage: {
    name: '重新生成AI消息',
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
          operationType: 1,
        },
      },
    ],
  },
  setMessageFilter: {
    name: '设置消息过滤器',
    params: [
      {
        name: 'filter',
        type: 'json',
        defaultValue: {
          shouldIgnore: `return function (message) { if (message.subType === 1) return true; return false; }`,
        },
      },
    ],
  },
};
export default apis;
