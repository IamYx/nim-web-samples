import { V2API } from './types';

const apis: Record<string, V2API> = {
  messageSerialization: {
    name: '序列化消息',
    params: [
      {
        name: 'message',
        type: 'json',
        defaultValue: '[[__message]]',
      },
    ],
  },
  messageDeserialization: {
    returnVar: '__message',
    name: '反序列化消息',
    params: [
      {
        name: 'messageString',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
};
export default apis;
