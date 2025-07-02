import { V2API } from './types';

const apis: Record<string, V2API> = {
  httpProxy: {
    name: 'http 服务代理',
    params: [
      {
        name: 'proxyRequest',
        type: 'json',
        defaultValue: JSON.stringify(
          {
            path: '/nimserver/friend/get.action',
            zone: 'http://imtest.netease.im',
            method: 2,
            header:
              '{"Nonce":"EvrYDSfpHwXVbeAUdOji","CheckSum":"589f2778d81e296441f262b4f3b111e89cbaf077","AppKey":"fe416640c8e8a72734219e1847ad2547","CurTime":"1730186843","Content-Type":"application/x-www-form-urlencoded"}',
            body: 'accid=ctt1&updatetime=0',
          },
          null,
          2
        ),
      },
    ],
  },
};
export default apis;
