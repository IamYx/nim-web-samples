import { V2API } from './types';

const apis: Record<string, V2API> = {
  checkTextAntispam: {
    name: '添加存储场景',
    params: [
      {
        name: 'text',
        type: 'string',
      },
      {
        name: 'replace',
        type: 'string',
      },
    ],
  },
};
export default apis;
