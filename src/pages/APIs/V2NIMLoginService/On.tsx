import { Button, Card, Form, Space, Typography, message } from 'antd';
import { V2NIMConst } from 'nim-web-sdk-ng';

import styles from '../nim.module.less';

const { Text } = Typography;

const storageKey = `V2NIMLoginService.on`;

const OnPage = () => {
  // 表单数据
  const [form] = Form.useForm();

  // 登录状态的监听
  const onLoginStatusFn = (loginStatus: number) => {
    message.info('收到 V2NIMLoginService 模块的 onLoginStatus 事件, 详情见控制台');
    if (loginStatus === V2NIMConst.V2NIMLoginStatus.V2NIM_LOGIN_STATUS_LOGINED) {
      console.info('V2NIMLoginService.onLoginStatus => 登录成功(也可以表示断线重连成功)');
    } else if (loginStatus === V2NIMConst.V2NIMLoginStatus.V2NIM_LOGIN_STATUS_LOGINING) {
      console.info('V2NIMLoginService.onLoginStatus => 正在登录中(也可以表示正在重连中)');
    } else if (loginStatus === V2NIMConst.V2NIMLoginStatus.V2NIM_LOGIN_STATUS_LOGOUT) {
      console.warn(
        'V2NIMLoginService.onLoginStatus => 未登录(同时代表初始状态, 已经登出, 已经被踢下线, 断线等情况)'
      );
    } else if (loginStatus === V2NIMConst.V2NIMLoginStatus.V2NIM_LOGIN_STATUS_UNLOGIN) {
      console.warn('V2NIMLoginService.onLoginStatus => 重连退避中.');
      // todo 其实可以不用过多处理
    }
  };

  const onDataSync = (type: number, state: number, error?: Error) => {
    if (
      type === V2NIMConst.V2NIMDataSyncType.V2NIM_DATA_SYNC_TYPE_MAIN &&
      state === V2NIMConst.V2NIMDataSyncState.V2NIM_DATA_SYNC_STATE_COMPLETED
    ) {
      // 主数据同步完毕.
      if (error) {
        // 同步出错
        console.log('V2NIMLoginService.onDataSync get error', error);
        message.info('收到 V2NIMLoginService 模块的 onDataSync 事件, 同步出错');
      } else {
        // 到此数据准备完毕, 允许调用 V2NIMLocalConversationService.getConversationList 这样的依赖同步数据的接口
        message.success('收到 V2NIMLoginService 模块的 onDataSync 事件, 同步成功');
      }
    }
  };

  // 设置事件监听
  const handleSetListener = async () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 设置前先取消一遍能防止重复监听
    window.nim.V2NIMLoginService.off('onLoginStatus', onLoginStatusFn);
    window.nim.V2NIMLoginService.off('onDataSync', onDataSync);
    // 设置监听
    window.nim.V2NIMLoginService.on('onLoginStatus', onLoginStatusFn);
    window.nim.V2NIMLoginService.on('onDataSync', onDataSync);

    message.success('成功设置监听');
  };

  // 移除所有监听器
  const handleRemoveAllListeners = () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 取消掉所有关于 onLoginStatus 的监听
    window.nim.V2NIMLoginService.removeAllListeners('onLoginStatus');
    window.nim.V2NIMLoginService.removeAllListeners('onDataSync');

    message.success('已取消监听');
  };

  return (
    <div className={styles.formContainer}>
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ marginTop: 24 }}>
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMLoginService`}
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
          </Space>
        </Form.Item>
      </Form>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>本模块只演示 onLoginStatus 登录状态变化, onDataSync 数据同步进展</li>
          <li>其他细节事件已经在初始化表单时设置, 请翻阅 NIMInitForm 代码查看</li>
          <li>对同一个事件 on 监听多次, 是都会生效的, 会触发多次. 使用时注意防止重复监听</li>
          <li>使用"取消所有监听"可以一次性移除所有已设置的监听器</li>
          <li>
            <Text type="warning">注意：跳转去“登录与登出”页执行登录动作查看.</Text>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default OnPage;
