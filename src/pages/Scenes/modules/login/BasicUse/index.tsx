import { Button, Form, Input, Space, message } from 'antd';
import NIM from 'nim-web-sdk-ng';
import { useRef, useState } from 'react';

import { TEST_DEMO_ACCOUNT, TEST_DEMO_APP_KEY, TEST_DEMO_TOKEN } from '@/configs/sceneConfig';

import styles from './index.module.less';

interface LoginFormValues {
  appkey: string;
  account: string;
  token: string;
}

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const BasicUse = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('');

  const nimRef = useRef<NIM & { destroy?: () => void }>(null);

  const [form] = Form.useForm();

  // 初始化并登录
  const handleLogin = async ({ appkey, account, token }: LoginFormValues) => {
    setLoading(true);
    try {
      // 先销毁之前的实例
      if (nimRef.current) {
        nimRef.current.destroy?.();
      }

      // 初始化新实例
      nimRef.current = NIM.getInstance(
        {
          appkey: appkey || TEST_DEMO_APP_KEY,
          debugLevel: 'debug',
          apiVersion: 'v2',
        },
        {
          V2NIMLoginServiceConfig: {
            lbsUrls: ['https://imtest-gy.netease.im/lbs/webconf'],
            linkUrl: 'weblink-dev-gy.netease.im:443',
          },
        }
      );

      // 执行登录
      try {
        await nimRef.current.V2NIMLoginService.login(account, token);
        message.success('登录成功');
        setIsLoggedIn(true);
        setCurrentAccount(account);
      } catch (loginError: any) {
        message.error(`登录失败: ${loginError.toString()}`);
        return;
      }
    } catch (error: any) {
      message.error(`操作失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const handleLogout = async () => {
    if (!nimRef.current) {
      message.error('NIM SDK 未初始化');
      return;
    }

    setLoading(true);
    try {
      await nimRef.current.V2NIMLoginService.logout();

      message.success('登出成功');
      setIsLoggedIn(false);
      setCurrentAccount('');
    } catch (error) {
      message.error(`登出失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 销毁实例
  const destroy = () => {
    nimRef.current?.destroy?.();
    setIsLoggedIn(false);
    setCurrentAccount('');
    message.success('实例已销毁');
  };

  return (
    <div className={styles.moduleWrapper}>
      {!isLoggedIn ? (
        <Form
          {...layout}
          form={form}
          onFinish={handleLogin}
          initialValues={{
            account: TEST_DEMO_ACCOUNT,
            token: TEST_DEMO_TOKEN,
          }}
        >
          <Form.Item label="AppKey" name="appkey">
            <Input placeholder="可以替换为自己的AppKey" />
          </Form.Item>

          <Form.Item
            label="账号"
            name="account"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input placeholder="请输入账号" />
          </Form.Item>

          <Form.Item
            label="Token"
            name="token"
            rules={[{ required: true, message: '请输入Token' }]}
          >
            <Input.Password placeholder="请输入Token" />
          </Form.Item>

          <Form.Item className={styles.loginButtonWrapper}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className={styles.loginButton}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <div>
          <div className={styles.statusCard}>
            <p className={styles.statusTitle}>✓ 登录状态：已登录</p>
            <p className={styles.statusAccount}>当前账号：{currentAccount}</p>
          </div>

          <Space>
            <Button type="default" onClick={handleLogout} loading={loading}>
              登出
            </Button>
            <Button type="default" danger onClick={destroy}>
              销毁实例
            </Button>
          </Space>
        </div>
      )}
    </div>
  );
};

export default BasicUse;
