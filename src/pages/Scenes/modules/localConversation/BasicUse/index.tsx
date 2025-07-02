import { Button, Card, Form, Input, List, Space, Tag, message } from 'antd';
import NIM from 'nim-web-sdk-ng';
import { V2NIMLocalConversation } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMLocalConversationService';
import { useRef, useState } from 'react';

import { TEST_DEMO_ACCOUNT, TEST_DEMO_APP_KEY, TEST_DEMO_TOKEN } from '@/configs/sceneConfig';
import { to } from '@/utils/errorHandle';

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
  const [conversations, setConversations] = useState<V2NIMLocalConversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const nimRef = useRef<NIM & { destroy?: () => void }>(null);
  const [form] = Form.useForm();

  // 格式化会话类型
  const formatConversationType = (type: number) => {
    const typeMap: { [key: number]: string } = {
      1: 'P2P',
      2: '群聊',
      3: '超大群',
    };
    return typeMap[type] || '未知';
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    if (!timestamp) return '无消息';
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (date >= today) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (date >= yesterday) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    }
  };

  // 获取会话列表
  const getConversationList = async () => {
    if (!(nimRef.current && nimRef.current.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setConversationsLoading(true);
    const [error, result] = await to(() =>
      nimRef.current?.V2NIMLocalConversationService.getConversationList(0, 50)
    );
    if (error) {
      setConversationsLoading(false);
      message.error(`获取会话列表失败: ${error}`);
      console.error('获取会话列表失败:', error.toString());
      setConversations([]);
      return;
    }
    setConversationsLoading(false);

    console.log('获取到的会话列表:', result);
    setConversations(result?.conversationList || []);

    if (!result?.conversationList || result.conversationList.length === 0) {
      message.info('当前没有会话记录');
    } else {
      message.success(`获取到 ${result.conversationList.length} 个会话`);
    }
  };

  // 刷新会话列表
  const handleRefresh = async () => {
    setRefreshing(true);
    await getConversationList();
    setRefreshing(false);
  };

  // 监听会话变化
  const setupConversationListeners = () => {
    if (!nimRef.current) return;

    // 监听会话创建
    nimRef.current.V2NIMLocalConversationService.on(
      'onConversationCreated',
      (conversation: V2NIMLocalConversation) => {
        console.log('会话被创建:', conversation);
        getConversationList(); // 重新获取列表
      }
    );

    // 监听会话变化
    nimRef.current.V2NIMLocalConversationService.on(
      'onConversationChanged',
      (conversationList: V2NIMLocalConversation[]) => {
        console.log('会话有更新:', conversationList);
        getConversationList(); // 重新获取列表
      }
    );

    // 监听会话删除
    nimRef.current.V2NIMLocalConversationService.on(
      'onConversationDeleted',
      (conversationIds: string[]) => {
        console.log('会话被删除:', conversationIds);
        getConversationList(); // 重新获取列表
      }
    );
  };

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

        // 设置会话监听器
        setupConversationListeners();

        // 登录成功后自动获取会话列表
        setTimeout(() => {
          getConversationList();
        }, 1000);
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
      setConversations([]);
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
    setConversations([]);
    message.success('实例已销毁');
  };

  // 删除会话
  const handleDeleteConversation = async (conversationId: string) => {
    if (!nimRef.current) {
      message.error('NIM SDK 未初始化');
      return;
    }

    try {
      await nimRef.current?.V2NIMLocalConversationService.deleteConversation(conversationId, true);
      message.success('删除会话成功');
      getConversationList();
    } catch (error) {
      message.error(`删除会话失败: ${error}`);
    }
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

          <Space style={{ marginBottom: 16 }}>
            <Button type="default" onClick={handleLogout} loading={loading}>
              登出
            </Button>
            <Button type="default" danger onClick={destroy}>
              销毁实例
            </Button>
            <Button type="primary" onClick={handleRefresh} loading={refreshing}>
              刷新会话列表
            </Button>
          </Space>

          <Card title="会话列表" className={styles.conversationCard}>
            <List
              loading={conversationsLoading}
              dataSource={conversations}
              locale={{ emptyText: '暂无会话记录' }}
              renderItem={conversation => (
                <List.Item
                  key={conversation.conversationId}
                  className={styles.conversationItem}
                  actions={[
                    <Button
                      key="delete"
                      type="link"
                      danger
                      size="small"
                      onClick={() => handleDeleteConversation(conversation.conversationId)}
                    >
                      删除
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div className={styles.conversationTitle}>
                        {conversation.stickTop && <Tag color="orange">置顶</Tag>}
                        <Tag color="blue">{formatConversationType(conversation.type)}</Tag>
                        <span className={styles.conversationId}>{conversation.conversationId}</span>
                      </div>
                    }
                    description={
                      <div className={styles.conversationMeta}>
                        <div className={styles.lastMessage}>
                          {conversation.lastMessage?.text || '暂无消息'}
                        </div>
                        <div className={styles.conversationInfo}>
                          <span>更新时间: {formatTime(conversation.updateTime)}</span>
                          {conversation.unreadCount > 0 && (
                            <Tag color="red" className={styles.unreadBadge}>
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </Tag>
                          )}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default BasicUse;
