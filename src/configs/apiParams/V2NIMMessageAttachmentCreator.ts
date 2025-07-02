import { V2API } from './types';

const apis: Record<string, V2API> = {
  createLocationMessageAttachment: {
    name: '构造地理位置消息的附件',
    params: [
      {
        name: 'latitude',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'longitude',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'address',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  createCustomMessageAttachment: {
    name: '构造自定义消息的附件',
    params: [
      {
        name: 'rawAttachment',
        type: 'string',
        defaultValue: '{"test": 123456}',
      },
    ],
  },
};
export default apis;
