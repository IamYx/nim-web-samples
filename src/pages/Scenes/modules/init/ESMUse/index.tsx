import { Button } from 'antd';
import {
  NIM,
  V2NIMMessageService,
  browserAdapters,
  setAdapters,
} from 'nim-web-sdk-ng/dist/esm/nim';
import { useRef } from 'react';

import { TEST_DEMO_APP_KEY } from '@/configs/sceneConfig';

import styles from './index.module.less';

const ESMUse = () => {
  const nimRef = useRef<NIM & { destroy?: () => void }>(null);

  const init = () => {
    setAdapters(browserAdapters);

    // 注册服务，登录模块无需注册，其他服务如果不注册，无法使用
    NIM.registerService(V2NIMMessageService, 'V2NIMMessageService');
    // ...

    // 初始化实例
    nimRef.current = NIM.getInstance(
      {
        appkey: TEST_DEMO_APP_KEY,
        debugLevel: 'debug',
        apiVersion: 'v2',
      },
      {}
    );
  };

  // 销毁实例
  const destroy = () => {
    nimRef.current?.destroy?.();
  };

  return (
    <div className={styles.moduleWrapper}>
      <Button type="primary" onClick={init} style={{ marginRight: 16 }}>
        初始化实例
      </Button>
      <Button type="default" danger onClick={destroy}>
        销毁实例
      </Button>
    </div>
  );
};

export default ESMUse;
