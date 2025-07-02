import { V2API } from './types';

const apis: Record<string, V2API> = {
  getAIUserList: {
    name: '获取 AI 机器人列表',
    params: [
      // {
      //   name: 'tag',
      //   type: 'string',
      //   defaultValue: {
      //     // pageToken: '',
      //     // limit: 100
      //   }
      // }
    ],
  },
  proxyAIModelCall: {
    name: 'AI 数字人请求代理接口',
    params: [
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          accountId: '',
          requestId: '',
          aiStream: false,
          content: {
            msg: '',
            type: 0,
          },
          messages: [
            {
              msg: '',
              type: 0,
              role: 'user',
            },
            {
              msg: '',
              type: 0,
              role: 'assistant',
            },
          ],
          promptVariables: '',
          modelConfigParams: {
            prompt: '',
            maxTokens: 10,
            topP: 0.8,
            temperature: 1.0,
          },
        },
      },
    ],
  },
  stopAIModelStreamCall: {
    name: '停止AI数字人流式输出',
    params: [
      {
        name: 'params',
        type: 'json',
        defaultValue: {
          accountId: '',
          requestId: '',
        },
      },
    ],
  },
};
export default apis;
