import { Button, Card, Form, Space, Typography, message } from 'antd';
import {
  V2NIMFriend,
  V2NIMFriendAddApplication,
  V2NIMFriendDeletionType,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMFriendService';

import styles from '../nim.module.less';

const { Text } = Typography;

const storageKey = `V2NIMFriendService.on`;

const OnPage = () => {
  // 表单数据
  const [form] = Form.useForm();

  // 好友添加通知
  const onFriendAdded = (friend: V2NIMFriend) => {
    message.success(`收到 V2NIMFriendService 模块的 onFriendAdded 事件, 详情见控制台`);
    console.log('好友添加通知:', friend);
  };

  // 好友删除通知
  const onFriendDeleted = (accountId: string, deletionType: V2NIMFriendDeletionType) => {
    message.warning(`收到 V2NIMFriendService 模块的 onFriendDeleted 事件, 详情见控制台`);
    console.log('好友删除通知:', { accountId, deletionType });
  };

  // 收到好友申请
  const onFriendAddApplication = (application: V2NIMFriendAddApplication) => {
    message.info(`收到 V2NIMFriendService 模块的 onFriendAddApplication 事件, 详情见控制台`);
    console.log('收到好友申请:', application);
  };

  // 好友申请被拒绝通知
  const onFriendAddRejected = (rejection: any) => {
    message.error(`收到 V2NIMFriendService 模块的 onFriendAddRejected 事件, 详情见控制台`);
    console.log('好友申请被拒绝通知:', rejection);
  };

  // 好友信息变更通知
  const onFriendInfoChanged = (friend: V2NIMFriend) => {
    message.info(`收到 V2NIMFriendService 模块的 onFriendInfoChanged 事件, 详情见控制台`);
    console.log('好友信息变更通知:', friend);
  };

  // 设置事件监听
  const handleSetListener = async () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 设置前先取消一遍能防止重复监听
    window.nim.V2NIMFriendService.off('onFriendAdded', onFriendAdded);
    window.nim.V2NIMFriendService.off('onFriendDeleted', onFriendDeleted);
    window.nim.V2NIMFriendService.off('onFriendAddApplication', onFriendAddApplication);
    window.nim.V2NIMFriendService.off('onFriendAddRejected', onFriendAddRejected);
    window.nim.V2NIMFriendService.off('onFriendInfoChanged', onFriendInfoChanged);

    // 设置监听
    window.nim.V2NIMFriendService.on('onFriendAdded', onFriendAdded);
    window.nim.V2NIMFriendService.on('onFriendDeleted', onFriendDeleted);
    window.nim.V2NIMFriendService.on('onFriendAddApplication', onFriendAddApplication);
    window.nim.V2NIMFriendService.on('onFriendAddRejected', onFriendAddRejected);
    window.nim.V2NIMFriendService.on('onFriendInfoChanged', onFriendInfoChanged);

    message.success('成功设置好友服务监听');
    console.log('好友服务监听已设置');
  };

  // 移除所有监听器
  const handleRemoveAllListeners = () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 取消掉所有好友服务相关的监听
    window.nim.V2NIMFriendService.removeAllListeners('onFriendAdded');
    window.nim.V2NIMFriendService.removeAllListeners('onFriendDeleted');
    window.nim.V2NIMFriendService.removeAllListeners('onFriendAddApplication');
    window.nim.V2NIMFriendService.removeAllListeners('onFriendAddRejected');
    window.nim.V2NIMFriendService.removeAllListeners('onFriendInfoChanged');

    message.success('已取消所有好友服务监听');
    console.log('所有好友服务监听已取消');
  };

  // 输出监听设置代码到控制台
  const handleOutputCode = () => {
    const code = `
// 设置好友服务监听
const setupFriendServiceListeners = () => {
  // 好友添加通知
  window.nim.V2NIMFriendService.on('onFriendAdded', (friend) => {
    console.log('好友添加通知:', friend);
    // friend 是 V2NIMFriend 对象，包含新添加的好友信息
    // 包含字段：accountId, alias, serverExtension, createTime, updateTime 等
  });

  // 好友删除通知
  window.nim.V2NIMFriendService.on('onFriendDeleted', (accountId, deletionType) => {
    console.log('好友删除通知:', { accountId, deletionType });
    // accountId: 被删除的好友账号ID
    // deletionType: 删除类型 (V2NIMFriendDeletionType 枚举值)
  });

  // 收到好友申请
  window.nim.V2NIMFriendService.on('onFriendAddApplication', (application) => {
    console.log('收到好友申请:', application);
    // application 是 V2NIMFriendAddApplication 对象
    // 包含字段：applicantAccountId, recipientAccountId, postscript, status, timestamp 等
  });

  // 好友申请被拒绝通知
  window.nim.V2NIMFriendService.on('onFriendAddRejected', (rejection) => {
    console.log('好友申请被拒绝通知:', rejection);
    // rejection 是拒绝信息对象，包含拒绝相关的详细信息
  });

  // 好友信息变更通知
  window.nim.V2NIMFriendService.on('onFriendInfoChanged', (friend) => {
    console.log('好友信息变更通知:', friend);
    // friend 是 V2NIMFriend 对象，包含变更后的好友信息
  });
};

// 调用设置函数
setupFriendServiceListeners();
`;

    console.log('V2NIMFriendService 监听设置代码:');
    console.log(code);
    message.success('监听设置代码已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ marginTop: 24 }}>
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMFriendService`}
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
          <Text strong>好友关系事件：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>onFriendAdded</Text> - 好友添加通知
              <div style={{ marginLeft: 20, color: '#666', fontSize: '12px' }}>
                触发条件：成功添加好友时，包括本端添加和多端同步
              </div>
            </li>
            <li>
              <Text code>onFriendDeleted</Text> - 好友删除通知
              <div style={{ marginLeft: 20, color: '#666', fontSize: '12px' }}>
                触发条件：删除好友时，包括本端删除和多端同步
              </div>
            </li>
            <li>
              <Text code>onFriendInfoChanged</Text> - 好友信息变更通知
              <div style={{ marginLeft: 20, color: '#666', fontSize: '12px' }}>
                触发条件：好友备注、服务端扩展等信息发生变化时
              </div>
            </li>
          </ul>
        </div>

        <div>
          <Text strong>好友申请相关事件：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>onFriendAddApplication</Text> - 收到好友申请
              <div style={{ marginLeft: 20, color: '#666', fontSize: '12px' }}>
                触发条件：收到他人的好友申请时
              </div>
            </li>
            <li>
              <Text code>onFriendAddRejected</Text> - 好友申请被拒绝通知
              <div style={{ marginLeft: 20, color: '#666', fontSize: '12px' }}>
                触发条件：自己发出的好友申请被对方拒绝时，或多端同步拒绝操作时
              </div>
            </li>
          </ul>
        </div>
      </Card>

      {/* 事件参数说明 */}
      <Card title="事件参数说明" style={{ marginTop: 16 }} size="small">
        <div style={{ marginBottom: 16 }}>
          <Text strong>onFriendAdded 参数：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>friend: V2NIMFriend</Text> - 新添加的好友信息
            </li>
            <li>
              包含字段：accountId（好友账号ID）、alias（好友备注）、serverExtension（服务端扩展）、createTime（创建时间）、updateTime（更新时间）等
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>onFriendDeleted 参数：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>accountId: string</Text> - 被删除的好友账号ID
            </li>
            <li>
              <Text code>deletionType: V2NIMFriendDeletionType</Text> - 删除类型（枚举值）
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>onFriendAddApplication 参数：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>application: V2NIMFriendAddApplication</Text> - 好友申请信息
            </li>
            <li>
              包含字段：applicantAccountId（申请人账号）、recipientAccountId（接收人账号）、postscript（申请消息）、status（申请状态）、timestamp（申请时间）等
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>onFriendAddRejected 参数：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>rejection: V2NIMFriendAddRejection</Text> - 拒绝申请信息
            </li>
            <li>包含拒绝相关的详细信息，如拒绝原因、拒绝时间等</li>
          </ul>
        </div>

        <div>
          <Text strong>onFriendInfoChanged 参数：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>friend: V2NIMFriend</Text> - 信息变更后的好友信息
            </li>
            <li>包含更新后的好友完整信息</li>
          </ul>
        </div>
      </Card>

      {/* 测试建议 */}
      <Card title="测试建议" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <Text strong>测试好友添加事件：</Text>
            <div style={{ marginLeft: 20, color: '#666' }}>
              可以去 "添加好友" 或 "接受好友申请" 页面进行操作来触发 onFriendAdded 事件
            </div>
          </li>
          <li>
            <Text strong>测试好友删除事件：</Text>
            <div style={{ marginLeft: 20, color: '#666' }}>
              可以去 "删除好友" 页面进行操作来触发 onFriendDeleted 事件
            </div>
          </li>
          <li>
            <Text strong>测试好友申请事件：</Text>
            <div style={{ marginLeft: 20, color: '#666' }}>
              让其他用户向当前用户发送好友申请，会触发 onFriendAddApplication 事件
            </div>
          </li>
          <li>
            <Text strong>测试申请拒绝事件：</Text>
            <div style={{ marginLeft: 20, color: '#666' }}>
              向其他用户发送好友申请后，如果被拒绝会触发 onFriendAddRejected 事件
            </div>
          </li>
          <li>
            <Text strong>多端同步测试：</Text>
            <div style={{ marginLeft: 20, color: '#666' }}>
              在其他设备或客户端上进行好友相关操作，可以测试多端同步的事件触发
            </div>
          </li>
        </ul>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>本页面演示 V2NIMFriendService 的事件监听功能</li>
          <li>设置监听后，相关的好友操作会触发对应事件并显示消息提示</li>
          <li>对同一个事件 on 监听多次，都会生效并触发多次，使用时注意防止重复监听</li>
          <li>所有事件都会在控制台输出详细信息，方便调试和学习</li>
          <li>使用"取消所有监听"可以一次性移除所有已设置的监听器</li>
          <li>
            <Text type="warning">
              注意：设置监听后，可以去其他好友相关页面进行操作来触发事件（如添加好友、删除好友、处理好友申请等）
            </Text>
          </li>
          <li>
            <Text type="warning">
              建议：在应用初始化时设置好友事件监听，以便及时收到好友状态变化通知
            </Text>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default OnPage;
