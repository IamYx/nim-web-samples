import { V2API } from './types';

const apis: Record<string, V2API> = {
  createTextMessage: {
    returnVar: '__message',
    name: '创建文本消息',
    params: [
      {
        name: 'text',
        type: 'string',
        defaultValue: 'hello',
      },
    ],
  },
  createImageMessage: {
    name: '创建图片消息',
    returnVar: '__message',
    params: [
      {
        name: 'imageObj',
        type: 'file',
      },
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'sceneName',
        type: 'string',
      },
      {
        name: 'width',
        type: 'number',
      },
      {
        name: 'height',
        type: 'number',
      },
    ],
  },
  createAudioMessage: {
    name: '创建音频消息',
    returnVar: '__message',
    params: [
      {
        name: 'audioObj',
        type: 'file',
      },
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'sceneName',
        type: 'string',
      },
      {
        name: 'duration',
        type: 'number',
      },
    ],
  },
  createVideoMessage: {
    name: '创建视频消息',
    returnVar: '__message',
    params: [
      {
        name: 'videoObj',
        type: 'file',
      },
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'sceneName',
        type: 'string',
      },
      {
        name: 'duration',
        type: 'number',
      },
      {
        name: 'width',
        type: 'number',
      },
      {
        name: 'height',
        type: 'number',
      },
    ],
  },
  createFileMessage: {
    name: '创建文件消息',
    returnVar: '__message',
    params: [
      {
        name: 'fileObj',
        type: 'file',
      },
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'sceneName',
        type: 'string',
      },
    ],
  },
  createLocationMessage: {
    name: '创建位置消息',
    returnVar: '__message',
    params: [
      {
        name: 'latitude',
        type: 'number',
      },
      {
        name: 'longitude',
        type: 'number',
      },
      {
        name: 'address',
        type: 'string',
      },
    ],
  },
  createCustomMessage: {
    name: '创建自定义消息',
    returnVar: '__message',
    params: [
      {
        name: 'text',
        type: 'string',
      },
      {
        name: 'rawAttachment',
        type: 'string',
        defaultValue: '{"test": 123456}',
      },
    ],
  },
  createCustomMessageWithAttachment: {
    name: '创建自定义消息',
    returnVar: '__message',
    params: [
      {
        name: 'attachment',
        type: 'json',
        defaultValue: { raw: '{"test":123}', test: 123 },
      },
      {
        name: 'subType',
        type: 'number',
        defaultValue: 0,
      },
    ],
  },
  createCallMessage: {
    name: '创建话单消息',
    returnVar: '__message',
    params: [
      {
        name: 'type',
        type: 'number',
      },
      {
        name: 'channelId',
        type: 'string',
      },
      {
        name: 'status',
        type: 'number',
      },
      {
        name: 'durations',
        type: 'json',
        defaultValue: '[{"accountId": "123456", "duration": 100}]',
      },
      {
        name: 'text',
        type: 'string',
      },
    ],
  },
  createForwardMessage: {
    name: '创建转发消息',
    returnVar: '__message',
    params: [
      {
        name: 'message',
        type: 'string',
        defaultValue: 'message',
      },
    ],
  },
  createTipsMessage: {
    name: '创建提示消息',
    returnVar: '__message',
    params: [
      {
        name: 'text',
        type: 'string',
      },
    ],
  },
};
export default apis;
