import { Button } from 'antd';
import NIM from 'nim-web-sdk-ng';
import { useRef } from 'react';

import { TEST_DEMO_APP_KEY } from '@/configs/sceneConfig';

import styles from './index.module.less';

const BasicUse = () => {
  const nimRef = useRef<NIM & { destroy?: () => void }>(null);

  const init = () => {
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

export default BasicUse;
