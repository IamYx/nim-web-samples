import { V2API } from './types';

const apis: Record<string, V2API> = {
  queueOffer: {
    name: '新增或更新元素',
    instance: 'chatroomV2',
    params: [
      {
        name: 'offerParams',
        type: 'json',
        defaultValue: {
          elementKey: 'key',
          elementValue: 'value',
          transient: false,
          elementOwnerAccountId: 'cs1',
        },
      },
    ],
  },
  queuePoll: {
    name: '取出头元素或者指定的元素',
    instance: 'chatroomV2',
    params: [
      {
        name: 'elementKey',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  queueList: {
    name: '获取队列所有元素',
    instance: 'chatroomV2',
    params: [],
  },
  queuePeek: {
    name: '查看队头元素',
    instance: 'chatroomV2',
    params: [],
  },
  queueDrop: {
    name: '清空队列',
    instance: 'chatroomV2',
    params: [],
  },
  queueInit: {
    name: '初始化队列',
    instance: 'chatroomV2',
    params: [
      {
        name: 'size',
        type: 'number',
        defaultValue: 100,
      },
    ],
  },
  queueBatchUpdate: {
    name: '批量更新队列元素',
    instance: 'chatroomV2',
    params: [
      {
        name: 'elements',
        type: 'json',
        defaultValue: [
          {
            key: 'key1',
            value: 'value1',
          },
          {
            key: 'key2',
            value: 'value2',
          },
        ],
      },
      {
        name: 'notificationEnabled',
        type: 'boolean',
        defaultValue: true,
      },
      {
        name: 'notificationExtension',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
};
export default apis;
