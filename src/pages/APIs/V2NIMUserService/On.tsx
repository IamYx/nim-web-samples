import { Button, Card, Form, Space, Typography, message } from 'antd';
import { V2NIMUser } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMUserService';

import styles from '../nim.module.less';

const { Text } = Typography;

const storageKey = `V2NIMUserService.on`;

const OnPage = () => {
  // 表单数据
  const [form] = Form.useForm();

  // 用户资料变更
  const onUserProfileChanged = (users: V2NIMUser[]) => {
    // const userInfo = users.map(user => `${user.accountId}(${user.name || '无昵称'})`).join(', ');
    message.info(`收到 V2NIMUserService 模块的 onUserProfileChanged 事件, 详情见控制台`);
    console.log('用户资料变更:', users);
  };

  // 黑名单添加通知
  const onBlockListAdded = (user: V2NIMUser) => {
    message.warning(`收到 V2NIMUserService 模块的 onBlockListAdded 事件, 详情见控制台`);
    console.log('用户被添加到黑名单:', user);
  };

  // 黑名单移除通知
  const onBlockListRemoved = (accountId: string) => {
    message.success(`收到 V2NIMUserService 模块的 onBlockListRemoved 事件, 详情见控制台`);
    console.log('用户被从黑名单移除:', accountId);
  };

  // 设置事件监听
  const handleSetListener = async () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 设置前先取消一遍能防止重复监听
    window.nim.V2NIMUserService.off('onUserProfileChanged', onUserProfileChanged);
    window.nim.V2NIMUserService.off('onBlockListAdded', onBlockListAdded);
    window.nim.V2NIMUserService.off('onBlockListRemoved', onBlockListRemoved);

    // 设置监听
    window.nim.V2NIMUserService.on('onUserProfileChanged', onUserProfileChanged);
    window.nim.V2NIMUserService.on('onBlockListAdded', onBlockListAdded);
    window.nim.V2NIMUserService.on('onBlockListRemoved', onBlockListRemoved);

    message.success('成功设置用户服务监听');
    console.log('用户服务监听已设置');
  };

  // 移除所有监听器
  const handleRemoveAllListeners = () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 取消掉所有用户服务相关的监听
    window.nim.V2NIMUserService.removeAllListeners('onUserProfileChanged');
    window.nim.V2NIMUserService.removeAllListeners('onBlockListAdded');
    window.nim.V2NIMUserService.removeAllListeners('onBlockListRemoved');

    message.success('已取消所有用户服务监听');
    console.log('所有用户服务监听已取消');
  };

  // 输出监听设置代码到控制台
  const handleOutputCode = () => {
    const code = `
// 设置用户服务监听
const setupUserServiceListeners = () => {
  // 用户资料变更
  window.nim.V2NIMUserService.on('onUserProfileChanged', (users) => {
    console.log('用户资料变更:', users);
    // users 是 V2NIMUser[] 数组，包含变更的用户信息
  });

  // 黑名单添加通知
  window.nim.V2NIMUserService.on('onBlockListAdded', (user) => {
    console.log('用户被添加到黑名单:', user);
    // user 是 V2NIMUser 对象，包含被添加到黑名单的用户信息
  });

  // 黑名单移除通知
  window.nim.V2NIMUserService.on('onBlockListRemoved', (accountId) => {
    console.log('用户被从黑名单移除:', accountId);
    // accountId 是字符串，被移除的用户账号ID
  });
};

// 调用设置函数
setupUserServiceListeners();
`;

    console.log('V2NIMUserService 监听设置代码:');
    console.log(code);
    message.success('监听设置代码已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ marginTop: 24 }}>
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMUserService`}
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
          <Text strong>用户资料事件：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>onUserProfileChanged</Text> - 用户资料变更通知
              <div style={{ marginLeft: 20, color: '#666', fontSize: '12px' }}>
                触发条件：用户昵称、头像、签名等资料发生变化时
              </div>
            </li>
          </ul>
        </div>

        <div>
          <Text strong>黑名单相关事件：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>onBlockListAdded</Text> - 黑名单添加通知
              <div style={{ marginLeft: 20, color: '#666', fontSize: '12px' }}>
                触发条件：本端直接添加黑名单，或多端同步添加黑名单
              </div>
            </li>
            <li>
              <Text code>onBlockListRemoved</Text> - 黑名单移除通知
              <div style={{ marginLeft: 20, color: '#666', fontSize: '12px' }}>
                触发条件：本端移除黑名单，或多端同步移除黑名单
              </div>
            </li>
          </ul>
        </div>
      </Card>

      {/* 事件参数说明 */}
      <Card title="事件参数说明" style={{ marginTop: 16 }} size="small">
        <div style={{ marginBottom: 16 }}>
          <Text strong>onUserProfileChanged 参数：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>users: V2NIMUser[]</Text> - 用户资料变更的用户列表
            </li>
            <li>
              每个 V2NIMUser
              对象包含：accountId（用户ID）、name（昵称）、avatar（头像）、sign（签名）等字段
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>onBlockListAdded 参数：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>user: V2NIMUser</Text> - 加入黑名单的用户信息
            </li>
          </ul>
        </div>

        <div>
          <Text strong>onBlockListRemoved 参数：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>accountId: string</Text> - 移除黑名单的用户账号ID
            </li>
          </ul>
        </div>
      </Card>

      {/* 测试建议 */}
      <Card title="测试建议" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <Text strong>测试用户资料变更事件：</Text>
            <div style={{ marginLeft: 20, color: '#666' }}>
              可以去 "更新自己的用户资料" 页面修改昵称、头像等信息来触发 onUserProfileChanged 事件
            </div>
          </li>
          <li>
            <Text strong>测试黑名单事件：</Text>
            <div style={{ marginLeft: 20, color: '#666' }}>
              可以去 "黑名单管理" 页面添加或移除黑名单用户来触发 onBlockListAdded 和
              onBlockListRemoved 事件
            </div>
          </li>
          <li>
            <Text strong>多端同步测试：</Text>
            <div style={{ marginLeft: 20, color: '#666' }}>
              在其他设备或客户端上进行相同操作，可以测试多端同步的事件触发
            </div>
          </li>
        </ul>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>本页面演示 V2NIMUserService 的事件监听功能</li>
          <li>设置监听后，相关的用户操作会触发对应事件并显示消息提示</li>
          <li>对同一个事件 on 监听多次，都会生效并触发多次，使用时注意防止重复监听</li>
          <li>所有事件都会在控制台输出详细信息，方便调试和学习</li>
          <li>使用"取消所有监听"可以一次性移除所有已设置的监听器</li>
          <li>
            <Text type="warning">
              注意：设置监听后，可以去其他用户相关页面进行操作来触发事件（如更新用户资料、管理黑名单等）
            </Text>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default OnPage;
