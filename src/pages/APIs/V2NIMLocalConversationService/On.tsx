import { Button, Card, Form, Space, Typography, message } from 'antd';
import { V2NIMLocalConversation } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMLocalConversationService';

import styles from '../nim.module.less';

const { Text } = Typography;

const storageKey = `V2NIMLocalConversationService.on`;

const OnPage = () => {
  // 表单数据
  const [form] = Form.useForm();

  // 会话被创建
  const onConversationCreated = (conversation: V2NIMLocalConversation) => {
    message.success(
      `收到 V2NIMLocalConversationService 模块的 onConversationCreated 事件, 详情见控制台`
    );
    console.log('会话被创建:', conversation);
  };

  // 会话被删除
  const onConversationDeleted = (conversationIds: string[]) => {
    message.warning(
      `收到 V2NIMLocalConversationService 模块的 onConversationDeleted 事件, 详情见控制台`
    );
    console.log('会话被删除:', conversationIds);
  };

  // 会话改变
  const onConversationChanged = (conversationList: V2NIMLocalConversation[]) => {
    message.info(
      `收到 V2NIMLocalConversationService 模块的 onConversationChanged 事件, 详情见控制台`
    );
    console.log('会话有更新:', conversationList);
  };

  // 总未读数改变
  const onTotalUnreadCountChanged = (unreadCount: number) => {
    message.info(
      `收到 V2NIMLocalConversationService 模块的 onTotalUnreadCountChanged 事件, 详情见控制台`
    );
    console.log('总未读数变更:', unreadCount);
  };

  // 指定过滤条件的未读数改变
  const onUnreadCountChangedByFilter = (filter: any, unreadCount: number) => {
    message.info(
      `收到 V2NIMLocalConversationService 模块的 onUnreadCountChangedByFilter 事件, 详情见控制台`
    );
    console.log('过滤条件未读数变更:', { filter, unreadCount });
  };

  // 会话已读时间戳更新
  const onConversationReadTimeUpdated = (conversationId: string, readTime: number) => {
    const readTimeStr = new Date(readTime).toLocaleString();
    message.info(
      `收到 V2NIMLocalConversationService 模块的 onConversationReadTimeUpdated 事件, 详情见控制台`
    );
    console.log('会话已读时间更新:', { conversationId, readTime, readTimeStr });
  };

  // 设置事件监听
  const handleSetListener = async () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 设置前先取消一遍能防止重复监听
    window.nim.V2NIMLocalConversationService.off('onConversationCreated', onConversationCreated);
    window.nim.V2NIMLocalConversationService.off('onConversationDeleted', onConversationDeleted);
    window.nim.V2NIMLocalConversationService.off('onConversationChanged', onConversationChanged);
    window.nim.V2NIMLocalConversationService.off(
      'onTotalUnreadCountChanged',
      onTotalUnreadCountChanged
    );
    window.nim.V2NIMLocalConversationService.off(
      'onUnreadCountChangedByFilter',
      onUnreadCountChangedByFilter
    );
    window.nim.V2NIMLocalConversationService.off(
      'onConversationReadTimeUpdated',
      onConversationReadTimeUpdated
    );

    // 设置监听
    window.nim.V2NIMLocalConversationService.on('onConversationCreated', onConversationCreated);
    window.nim.V2NIMLocalConversationService.on('onConversationDeleted', onConversationDeleted);
    window.nim.V2NIMLocalConversationService.on('onConversationChanged', onConversationChanged);
    window.nim.V2NIMLocalConversationService.on(
      'onTotalUnreadCountChanged',
      onTotalUnreadCountChanged
    );
    window.nim.V2NIMLocalConversationService.on(
      'onUnreadCountChangedByFilter',
      onUnreadCountChangedByFilter
    );
    window.nim.V2NIMLocalConversationService.on(
      'onConversationReadTimeUpdated',
      onConversationReadTimeUpdated
    );

    message.success('成功设置本地会话服务监听');
    console.log('本地会话服务监听已设置');
  };

  // 移除所有监听器
  const handleRemoveAllListeners = () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 取消掉所有本地会话服务相关的监听
    window.nim.V2NIMLocalConversationService.removeAllListeners('onConversationCreated');
    window.nim.V2NIMLocalConversationService.removeAllListeners('onConversationDeleted');
    window.nim.V2NIMLocalConversationService.removeAllListeners('onConversationChanged');
    window.nim.V2NIMLocalConversationService.removeAllListeners('onTotalUnreadCountChanged');
    window.nim.V2NIMLocalConversationService.removeAllListeners('onUnreadCountChangedByFilter');
    window.nim.V2NIMLocalConversationService.removeAllListeners('onConversationReadTimeUpdated');

    message.success('已取消所有本地会话服务监听');
    console.log('所有本地会话服务监听已取消');
  };

  // 输出监听设置代码到控制台
  const handleOutputCode = () => {
    const code = `
// 设置本地会话服务监听
const setupLocalConversationListeners = () => {
  // 会话被创建
  window.nim.V2NIMLocalConversationService.on('onConversationCreated', (conversation) => {
    console.log('会话被创建:', conversation);
  });

  // 会话被删除
  window.nim.V2NIMLocalConversationService.on('onConversationDeleted', (conversationIds) => {
    console.log('会话被删除:', conversationIds);
  });

  // 会话改变
  window.nim.V2NIMLocalConversationService.on('onConversationChanged', (conversationList) => {
    console.log('会话有更新:', conversationList);
  });

  // 总未读数改变
  window.nim.V2NIMLocalConversationService.on('onTotalUnreadCountChanged', (unreadCount) => {
    console.log('总未读数变更:', unreadCount);
  });

  // 指定过滤条件的未读数改变
  window.nim.V2NIMLocalConversationService.on('onUnreadCountChangedByFilter', (filter, unreadCount) => {
    console.log('过滤条件未读数变更:', { filter, unreadCount });
  });

  // 会话已读时间戳更新
  window.nim.V2NIMLocalConversationService.on('onConversationReadTimeUpdated', (conversationId, readTime) => {
    console.log('会话已读时间更新:', { conversationId, readTime });
  });
};

// 调用设置函数
setupLocalConversationListeners();
`;

    console.log('V2NIMLocalConversationService 监听设置代码:');
    console.log(code);
    message.success('监听设置代码已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ marginTop: 24 }}>
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMLocalConversationService`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>
        <Form.Item label={'操作项'}>
          <Space size="middle" style={{ width: '100%', flexWrap: 'wrap' }}>
            <Button type="primary" onClick={handleSetListener} style={{ minWidth: 120 }}>
              设置监听
            </Button>
            <Button type="default" danger onClick={handleRemoveAllListeners}>
              取消所有监听
            </Button>
            <Button type="default" onClick={handleOutputCode}>
              输出监听代码
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 事件说明 */}
      <Card title="监听事件说明" style={{ marginTop: 16 }} size="small">
        <div style={{ marginBottom: 16 }}>
          <Text strong>同步相关事件：</Text> 请直接使用 V2NIMLoginService 模块的 onDataSync
          事件来监听数据是否准备完毕
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>会话操作事件：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>onConversationCreated</Text> - 会话被创建
            </li>
            <li>
              <Text code>onConversationDeleted</Text> - 会话被删除
            </li>
            <li>
              <Text code>onConversationChanged</Text> -
              会话有更新（置顶、免打扰、扩展字段、未读数等）
            </li>
          </ul>
        </div>

        <div>
          <Text strong>未读数相关事件：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>onTotalUnreadCountChanged</Text> - 总未读数发生变化
            </li>
            <li>
              <Text code>onUnreadCountChangedByFilter</Text> - 指定过滤条件的未读数发生变化
            </li>
            <li>
              <Text code>onConversationReadTimeUpdated</Text> - 会话已读时间戳更新
            </li>
          </ul>
        </div>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>本页面演示 V2NIMLocalConversationService 的事件监听功能</li>
          <li>设置监听后，相关的会话操作会触发对应事件并显示消息提示</li>
          <li>对同一个事件 on 监听多次，都会生效并触发多次，使用时注意防止重复监听</li>
          <li>
            建议在 <Text code>onDataSync</Text> 事件告知数据准备完毕后,
            再使用会话模块数据，以保证数据完整性
          </li>
          <li>使用"取消所有监听"可以一次性移除所有已设置的监听器</li>
          <li>
            <Text type="warning">
              注意：设置监听后，可以去其他会话相关页面进行操作来触发事件（如创建会话、删除会话、置顶会话、标记已读等）
            </Text>
          </li>
          <li>所有事件都会在控制台输出详细信息，方便调试和学习</li>
        </ul>
      </Card>
    </div>
  );
};

export default OnPage;
