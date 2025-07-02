import { Button, Card, Form, Space, Typography, message } from 'antd';

import styles from '../nim.module.less';

const { Text } = Typography;

// 自定义通知和广播通知的类型定义（基于知识库信息）
interface V2NIMCustomNotification {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  [key: string]: any;
}

interface V2NIMBroadcastNotification {
  id: string;
  content: string;
  timestamp: number;
  [key: string]: any;
}

const storageKey = `V2NIMNotificationService.on`;

const OnPage = () => {
  // 表单数据
  const [form] = Form.useForm();

  // 收到自定义通知
  const onReceiveCustomNotifications = (customNotifications: V2NIMCustomNotification[]) => {
    const count = customNotifications.length;
    const firstNotification = customNotifications[0];
    const summary = firstNotification
      ? `发送者: ${firstNotification.senderId}, 内容: ${firstNotification.content?.substring(0, 20)}${firstNotification.content?.length > 20 ? '...' : ''}`
      : '无内容';

    message.success(
      `收到 V2NIMNotificationService 模块的 onReceiveCustomNotifications 事件, 共${count}条通知, ${summary}, 详情见控制台`
    );
    console.log('收到自定义通知:', customNotifications);
  };

  // 收到广播通知
  const onReceiveBroadcastNotifications = (
    broadcastNotifications: V2NIMBroadcastNotification[]
  ) => {
    const count = broadcastNotifications.length;
    const firstNotification = broadcastNotifications[0];
    const summary = firstNotification
      ? `ID: ${firstNotification.id}, 内容: ${firstNotification.content?.substring(0, 20)}${firstNotification.content?.length > 20 ? '...' : ''}`
      : '无内容';

    message.info(
      `收到 V2NIMNotificationService 模块的 onReceiveBroadcastNotifications 事件, 共${count}条广播, ${summary}, 详情见控制台`
    );
    console.log('收到广播通知:', broadcastNotifications);
  };

  // 设置事件监听
  const handleSetListener = async () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 设置前先取消一遍能防止重复监听
    window.nim.V2NIMNotificationService.off(
      'onReceiveCustomNotifications',
      onReceiveCustomNotifications
    );
    window.nim.V2NIMNotificationService.off(
      'onReceiveBroadcastNotifications',
      onReceiveBroadcastNotifications
    );

    // 设置监听
    window.nim.V2NIMNotificationService.on(
      'onReceiveCustomNotifications',
      onReceiveCustomNotifications
    );
    window.nim.V2NIMNotificationService.on(
      'onReceiveBroadcastNotifications',
      onReceiveBroadcastNotifications
    );

    message.success('成功设置通知服务监听');
    console.log('通知服务监听已设置');
  };

  // 移除所有监听器
  const handleRemoveAllListeners = () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 取消掉所有通知服务相关的监听
    window.nim.V2NIMNotificationService.removeAllListeners('onReceiveCustomNotifications');
    window.nim.V2NIMNotificationService.removeAllListeners('onReceiveBroadcastNotifications');

    message.success('已取消所有通知服务监听');
    console.log('所有通知服务监听已取消');
  };

  // 输出监听设置代码到控制台
  const handleOutputCode = () => {
    const code = `
// 设置通知服务监听
const setupNotificationServiceListeners = () => {
  // 收到自定义通知
  window.nim.V2NIMNotificationService.on('onReceiveCustomNotifications', (customNotifications) => {
    console.log('收到自定义通知:', customNotifications);
    // 处理自定义通知
    customNotifications.forEach(notification => {
      console.log('通知详情:', {
        会话ID: notification.conversationId,
        发送者: notification.senderId,
        接收者: notification.receiverId,
        内容: notification.content,
        时间戳: notification.timestamp,
        时间: new Date(notification.timestamp).toLocaleString()
      });
    });
  });

  // 收到广播通知
  window.nim.V2NIMNotificationService.on('onReceiveBroadcastNotifications', (broadcastNotifications) => {
    console.log('收到广播通知:', broadcastNotifications);
    // 处理广播通知
    broadcastNotifications.forEach(notification => {
      console.log('广播详情:', {
        ID: notification.id,
        内容: notification.content,
        时间戳: notification.timestamp,
        时间: new Date(notification.timestamp).toLocaleString()
      });
    });
  });
};

// 调用设置函数
setupNotificationServiceListeners();
`;

    console.log('V2NIMNotificationService 监听设置代码:');
    console.log(code);
    message.success('监听设置代码已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ marginTop: 24 }}>
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMNotificationService`}
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
          <Text strong>通知接收事件：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>onReceiveCustomNotifications</Text> - 收到自定义通知
              <ul style={{ marginTop: 4 }}>
                <li>通过 sendCustomNotification 发送的自定义通知</li>
                <li>包含会话ID、发送者、接收者、内容、时间戳等信息</li>
                <li>可用于实现自定义业务逻辑的实时通知</li>
              </ul>
            </li>
            <li>
              <Text code>onReceiveBroadcastNotifications</Text> - 收到广播通知
              <ul style={{ marginTop: 4 }}>
                <li>从服务端API发起的广播消息，所有用户均会收到</li>
                <li>包含通知ID、内容、时间戳等信息</li>
                <li>通常用于系统级别的全局通知</li>
              </ul>
            </li>
          </ul>
        </div>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>本页面演示 V2NIMNotificationService 的事件监听功能</li>
          <li>设置监听后，接收到的通知会触发对应事件并显示消息提示</li>
          <li>对同一个事件 on 监听多次，都会生效并触发多次，使用时注意防止重复监听</li>
          <li>
            <Text type="success">触发通知事件的方式：</Text>
            <ul style={{ marginTop: 4 }}>
              <li>
                自定义通知：可以通过 <Text code>sendCustomNotification</Text>{' '}
                发送自定义通知给指定用户
              </li>
              <li>广播通知：需要通过服务端API发送，所有在线用户都会收到</li>
              <li>可以在多个客户端登录同一账号，互相发送自定义通知进行测试</li>
            </ul>
          </li>
          <li>使用"取消所有监听"可以一次性移除所有已设置的监听器</li>
          <li>
            <Text type="warning">注意：通知监听在 SDK 初始化且登录成功后才能正常接收通知</Text>
          </li>
          <li>所有通知事件都会在控制台输出详细信息，方便调试和学习</li>
        </ul>
      </Card>

      {/* API 参数说明 */}
      <Card title="通知对象参数说明" style={{ marginTop: 16 }} size="small">
        <div style={{ marginBottom: 16 }}>
          <Text strong>V2NIMCustomNotification 自定义通知对象：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>conversationId</Text> - 会话ID，标识通知所属的会话
            </li>
            <li>
              <Text code>senderId</Text> - 发送者账号ID
            </li>
            <li>
              <Text code>receiverId</Text> - 接收者账号ID
            </li>
            <li>
              <Text code>content</Text> - 通知内容，最大4096个字符
            </li>
            <li>
              <Text code>timestamp</Text> - 通知时间戳（毫秒）
            </li>
            <li>其他扩展字段可能包含推送配置、反垃圾配置等信息</li>
          </ul>
        </div>

        <div>
          <Text strong>V2NIMBroadcastNotification 广播通知对象：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>id</Text> - 广播通知的唯一标识ID
            </li>
            <li>
              <Text code>content</Text> - 广播通知内容
            </li>
            <li>
              <Text code>timestamp</Text> - 广播通知时间戳（毫秒）
            </li>
            <li>其他扩展字段可能包含广播类型、目标用户等信息</li>
          </ul>
        </div>
      </Card>

      {/* 测试建议 */}
      <Card title="测试建议" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <Text strong>自定义通知测试：</Text>
            <ul style={{ marginTop: 4 }}>
              <li>在当前页面设置监听</li>
              <li>
                打开 <Text code>sendCustomNotification</Text> 页面发送自定义通知
              </li>
              <li>可以发送给自己或其他用户进行测试</li>
              <li>观察控制台输出的通知详细信息</li>
            </ul>
          </li>
          <li>
            <Text strong>多端同步测试：</Text>
            <ul style={{ marginTop: 4 }}>
              <li>在多个浏览器窗口登录同一账号</li>
              <li>在一个窗口发送自定义通知</li>
              <li>观察其他窗口是否收到通知</li>
            </ul>
          </li>
          <li>
            <Text strong>广播通知测试：</Text>
            <ul style={{ marginTop: 4 }}>
              <li>广播通知需要通过服务端API发送</li>
              <li>可以联系后端开发人员协助测试</li>
              <li>或者查阅服务端API文档自行发送广播通知</li>
            </ul>
          </li>
        </ul>
      </Card>

      {/* 重要提醒 */}
      <Card
        title="⚠️ 重要提醒"
        style={{
          marginTop: 16,
          border: '2px solid #ff9c6e',
          backgroundColor: '#fff7e6',
        }}
        size="small"
        styles={{
          header: {
            backgroundColor: '#ffe7ba',
            color: '#d46b08',
            fontWeight: 'bold',
          },
        }}
      >
        <ul style={{ margin: 0, paddingLeft: 20, color: '#d46b08' }}>
          <li>
            <strong>确保SDK已初始化并登录成功</strong>
          </li>
          <li>通知监听在网络断开后重连时会自动恢复</li>
          <li>自定义通知不会存储在消息历史中，只用于实时通知</li>
          <li>广播通知的发送需要特殊权限，通常由服务端管理</li>
          <li>
            <strong>重复设置监听会导致同一通知触发多次</strong>
          </li>
          <li>通知内容可能包含敏感信息，注意数据安全</li>
          <li>
            <strong>及时移除不需要的监听器以避免内存泄漏</strong>
          </li>
          <li>通知监听器的回调函数应该尽量简洁，避免阻塞主线程</li>
          <li>在处理大量通知时，注意性能优化</li>
          <li>
            <strong>通知服务主要用于轻量级的实时通知，不建议用于传输大量数据</strong>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default OnPage;
