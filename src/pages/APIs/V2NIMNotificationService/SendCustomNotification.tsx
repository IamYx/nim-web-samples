import { Button, Card, Form, Input, Radio, Select, Space, Switch, message } from 'antd';
import { V2NIMTeam } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface SendCustomNotificationFormValues {
  conversationType: string;
  targetId: string;
  content: string;
  params: {
    notificationConfig?: {
      badgeEnabled?: boolean;
      needPushNick?: boolean;
      apnsText?: string;
      pushPayload?: string;
    };
    pushConfig?: {
      pushTitle?: string;
      pushContent?: string;
      pushPayload?: string;
      forcePush?: boolean;
      forcePushList?: string;
      forcePushContent?: string;
    };
    antispamConfig?: {
      antispamEnabled?: boolean;
      antispamBusinessId?: string;
    };
    routeConfig?: {
      routeEnabled?: boolean;
      routeEnvironment?: string;
    };
  };
}

const defaultFormValues: SendCustomNotificationFormValues = {
  conversationType: 'p2p',
  targetId: '',
  content: '{"text": "Hello, this is a custom notification"}',
  params: {
    notificationConfig: {
      badgeEnabled: true,
      needPushNick: true,
      apnsText: '',
      pushPayload: '',
    },
    pushConfig: {
      pushTitle: '',
      pushContent: '',
      pushPayload: '',
      forcePush: false,
      forcePushList: '',
      forcePushContent: '',
    },
    antispamConfig: {
      antispamEnabled: false,
      antispamBusinessId: '',
    },
    routeConfig: {
      routeEnabled: false,
      routeEnvironment: '',
    },
  },
};

const storageKey = `V2NIMNotificationService.sendCustomNotification`;

const SendCustomNotificationPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 获取群组列表的加载状态
  const [fetchingTeams, setFetchingTeams] = useState(false);
  // 已加入的群组列表
  const [teamList, setTeamList] = useState<V2NIMTeam[]>([]);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): SendCustomNotificationFormValues => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return { ...defaultFormValues, ...parsedStored };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return defaultFormValues;
  };

  const initialValues = getInitialValues();

  // 获取已加入的群组列表
  const fetchTeamList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setFetchingTeams(true);

    const [error, result] = await to(() => window.nim?.V2NIMTeamService.getJoinedTeamList());

    if (error) {
      message.error(`获取群组列表失败: ${error.toString()}`);
      console.error('获取群组列表失败:', error);
      setTeamList([]);
    } else {
      console.log('获取群组列表成功, 结果:', result);
      const validTeams = (result || []).filter((team: V2NIMTeam) => team.isValidTeam);
      setTeamList(validTeams);
    }
    setFetchingTeams(false);
  };

  // 组件挂载时获取群组列表
  useEffect(() => {
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      fetchTeamList();
    }
  }, []);

  // 构建会话ID
  const buildConversationId = (conversationType: string, targetId: string): string => {
    if (!targetId.trim()) {
      return '';
    }

    switch (conversationType) {
      case 'p2p':
        return window.nim?.V2NIMConversationIdUtil.p2pConversationId(targetId) || '';
      case 'team':
        return window.nim?.V2NIMConversationIdUtil.teamConversationId(targetId) || '';
      case 'superTeam':
        return window.nim?.V2NIMConversationIdUtil.superTeamConversationId(targetId) || '';
      default:
        return '';
    }
  };

  // 获取群组类型显示文本
  const getTeamTypeText = (teamType: number) => {
    switch (teamType) {
      case 1:
        return '高级群';
      case 2:
        return '超大群';
      default:
        return `未知(${teamType})`;
    }
  };

  // 构建发送参数
  const buildSendParams = (formParams: SendCustomNotificationFormValues['params']) => {
    const params: any = {};

    // 通知相关配置
    if (formParams.notificationConfig) {
      const config = formParams.notificationConfig;
      if (
        config.badgeEnabled !== undefined ||
        config.needPushNick !== undefined ||
        config.apnsText ||
        config.pushPayload
      ) {
        params.notificationConfig = {};

        if (config.badgeEnabled !== undefined) {
          params.notificationConfig.badgeEnabled = config.badgeEnabled;
        }
        if (config.needPushNick !== undefined) {
          params.notificationConfig.needPushNick = config.needPushNick;
        }
        if (config.apnsText?.trim()) {
          params.notificationConfig.apnsText = config.apnsText.trim();
        }
        if (config.pushPayload?.trim()) {
          params.notificationConfig.pushPayload = config.pushPayload.trim();
        }
      }
    }

    // 推送配置
    if (formParams.pushConfig) {
      const config = formParams.pushConfig;
      if (
        config.pushTitle ||
        config.pushContent ||
        config.pushPayload ||
        config.forcePush ||
        config.forcePushList ||
        config.forcePushContent
      ) {
        params.pushConfig = {};

        if (config.pushTitle?.trim()) {
          params.pushConfig.pushTitle = config.pushTitle.trim();
        }
        if (config.pushContent?.trim()) {
          params.pushConfig.pushContent = config.pushContent.trim();
        }
        if (config.pushPayload?.trim()) {
          params.pushConfig.pushPayload = config.pushPayload.trim();
        }
        if (config.forcePush !== undefined) {
          params.pushConfig.forcePush = config.forcePush;
        }
        if (config.forcePushList?.trim()) {
          params.pushConfig.forcePushList = config.forcePushList
            .trim()
            .split(',')
            .map(id => id.trim())
            .filter(id => id.length > 0);
        }
        if (config.forcePushContent?.trim()) {
          params.pushConfig.forcePushContent = config.forcePushContent.trim();
        }
      }
    }

    // 反垃圾配置
    if (formParams.antispamConfig) {
      const config = formParams.antispamConfig;
      if (config.antispamEnabled || config.antispamBusinessId) {
        params.antispamConfig = {};

        if (config.antispamEnabled !== undefined) {
          params.antispamConfig.antispamEnabled = config.antispamEnabled;
        }
        if (config.antispamBusinessId?.trim()) {
          params.antispamConfig.antispamBusinessId = config.antispamBusinessId.trim();
        }
      }
    }

    // 路由配置
    if (formParams.routeConfig) {
      const config = formParams.routeConfig;
      if (config.routeEnabled || config.routeEnvironment) {
        params.routeConfig = {};

        if (config.routeEnabled !== undefined) {
          params.routeConfig.routeEnabled = config.routeEnabled;
        }
        if (config.routeEnvironment?.trim()) {
          params.routeConfig.routeEnvironment = config.routeEnvironment.trim();
        }
      }
    }

    return Object.keys(params).length > 0 ? params : undefined;
  };

  // 表单提交: 触发 API 调用
  const handleSendCustomNotification = async (values: SendCustomNotificationFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { conversationType, targetId, content, params } = values;

    if (!targetId.trim()) {
      message.error('请输入目标账号');
      return;
    }

    if (!content.trim()) {
      message.error('请输入通知内容');
      return;
    }

    // 构建会话ID
    const conversationId = buildConversationId(conversationType, targetId);
    if (!conversationId) {
      message.error('构建会话ID失败，请检查目标账号是否正确');
      return;
    }

    setLoading(true);

    // 构建发送参数
    const sendParams = buildSendParams(params);

    // 打印 API 入参
    console.log('API V2NIMNotificationService.sendCustomNotification execute, params:', {
      conversationId,
      content: content.trim(),
      params: sendParams,
    });

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMNotificationService.sendCustomNotification(
        conversationId,
        content.trim(),
        sendParams
      )
    );

    if (error) {
      message.error(`发送自定义通知失败: ${error.toString()}`);
      console.error('发送自定义通知失败:', error.toString());
    } else {
      message.success('发送自定义通知成功');
      console.log('发送自定义通知成功');
    }

    setLoading(false);
    // 存储最终执行的参数
    localStorage.setItem(storageKey, JSON.stringify(values));
  };

  // 重置表单到默认值
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 重置表单为默认值
    form.setFieldsValue(defaultFormValues);
    message.success('表单已重置为默认值');
  };

  // 刷新群组列表
  const handleRefreshTeams = () => {
    fetchTeamList();
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { conversationType, targetId, content, params } = values;

    if (!targetId.trim()) {
      message.error('请先输入目标账号');
      return;
    }

    if (!content.trim()) {
      message.error('请先输入通知内容');
      return;
    }

    const conversationId = buildConversationId(conversationType, targetId);
    const sendParams = buildSendParams(params);

    const callStatement = `await window.nim.V2NIMNotificationService.sendCustomNotification(${JSON.stringify(conversationId)}, ${JSON.stringify(content.trim())}, ${sendParams ? JSON.stringify(sendParams) : 'undefined'});`;

    console.log('V2NIMNotificationService.sendCustomNotification 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 会话类型选项
  const conversationTypeOptions = [
    { label: '点对点 (P2P)', value: 'p2p' },
    { label: '群组 (Team)', value: 'team' },
    { label: '超大群 (SuperTeam)', value: 'superTeam' },
  ];

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleSendCustomNotification}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
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

        <Form.Item
          label="会话类型"
          name="conversationType"
          rules={[{ required: true, message: '请选择会话类型' }]}
          tooltip="选择要发送通知的会话类型"
        >
          <Radio.Group
            options={conversationTypeOptions}
            onChange={() => {
              // 切换会话类型时清空目标ID，避免混乱
              form.setFieldsValue({ targetId: '' });
            }}
          />
        </Form.Item>

        <Form.Item noStyle dependencies={['conversationType']}>
          {({ getFieldValue }) => {
            const conversationType = getFieldValue('conversationType');
            return (
              <Form.Item
                label="目标ID"
                name="targetId"
                rules={[{ required: true, message: '请输入目标ID' }]}
                tooltip="点对点会话填写对方账号ID，群组会话填写群组ID"
              >
                <Input
                  placeholder={conversationType === 'p2p' ? '请输入对方账号ID' : '请输入群组ID'}
                  addonAfter={
                    <Space>
                      {(conversationType === 'team' || conversationType === 'superTeam') && (
                        <Select
                          style={{ width: 200 }}
                          placeholder="选择群组"
                          size="small"
                          allowClear
                          loading={fetchingTeams}
                          onSelect={(value: string) => {
                            form.setFieldsValue({ targetId: value });
                          }}
                          dropdownRender={menu => (
                            <div>
                              {menu}
                              <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={handleRefreshTeams}
                                  loading={fetchingTeams}
                                  style={{ padding: 0 }}
                                >
                                  刷新群组列表
                                </Button>
                              </div>
                            </div>
                          )}
                          notFoundContent={fetchingTeams ? '正在获取群组列表...' : '暂无可用群组'}
                        >
                          {teamList
                            .filter(team =>
                              conversationType === 'team'
                                ? team.teamType === 1
                                : team.teamType === 2
                            )
                            .map(team => (
                              <Select.Option key={team.teamId} value={team.teamId}>
                                {team.name || team.teamId} ({getTeamTypeText(team.teamType)})
                              </Select.Option>
                            ))}
                        </Select>
                      )}
                    </Space>
                  }
                />
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item
          label="通知内容"
          name="content"
          rules={[{ required: true, message: '请输入通知内容' }]}
          tooltip="自定义通知的内容，最大4096个字符"
        >
          <Input.TextArea placeholder="请输入自定义通知内容" rows={3} maxLength={4096} showCount />
        </Form.Item>

        {/* 通知相关配置 */}
        <Card title="通知相关配置" size="small" style={{ marginBottom: 16 }}>
          <Form.Item
            label="角标开关"
            name={['params', 'notificationConfig', 'badgeEnabled']}
            valuePropName="checked"
            tooltip="是否显示角标"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>

          <Form.Item
            label="推送昵称"
            name={['params', 'notificationConfig', 'needPushNick']}
            valuePropName="checked"
            tooltip="是否需要推送昵称"
          >
            <Switch checkedChildren="需要" unCheckedChildren="不需要" />
          </Form.Item>

          <Form.Item
            label="APNS文本"
            name={['params', 'notificationConfig', 'apnsText']}
            tooltip="苹果推送的显示文本"
          >
            <Input placeholder="APNS推送显示文本" />
          </Form.Item>

          <Form.Item
            label="推送载荷"
            name={['params', 'notificationConfig', 'pushPayload']}
            tooltip="推送时携带的额外数据"
          >
            <Input.TextArea placeholder="JSON格式的推送载荷数据" rows={2} />
          </Form.Item>
        </Card>

        {/* 推送配置 */}
        <Card title="推送配置" size="small" style={{ marginBottom: 16 }}>
          <Form.Item
            label="推送标题"
            name={['params', 'pushConfig', 'pushTitle']}
            tooltip="推送通知的标题"
          >
            <Input placeholder="推送通知标题" />
          </Form.Item>

          <Form.Item
            label="推送内容"
            name={['params', 'pushConfig', 'pushContent']}
            tooltip="推送通知的内容"
          >
            <Input.TextArea placeholder="推送通知内容" rows={2} />
          </Form.Item>

          <Form.Item
            label="推送载荷"
            name={['params', 'pushConfig', 'pushPayload']}
            tooltip="推送时携带的额外数据"
          >
            <Input.TextArea placeholder="JSON格式的推送载荷数据" rows={2} />
          </Form.Item>

          <Form.Item
            label="强制推送"
            name={['params', 'pushConfig', 'forcePush']}
            valuePropName="checked"
            tooltip="是否强制推送给所有用户"
          >
            <Switch checkedChildren="强制" unCheckedChildren="正常" />
          </Form.Item>

          <Form.Item
            label="强推用户列表"
            name={['params', 'pushConfig', 'forcePushList']}
            tooltip="需要强制推送的用户ID列表，多个用逗号分隔"
          >
            <Input placeholder="user1,user2,user3" />
          </Form.Item>

          <Form.Item
            label="强推内容"
            name={['params', 'pushConfig', 'forcePushContent']}
            tooltip="强制推送时的内容"
          >
            <Input.TextArea placeholder="强制推送时显示的内容" rows={2} />
          </Form.Item>
        </Card>

        {/* 反垃圾配置 */}
        <Card title="反垃圾配置" size="small" style={{ marginBottom: 16 }}>
          <Form.Item
            label="反垃圾开关"
            name={['params', 'antispamConfig', 'antispamEnabled']}
            valuePropName="checked"
            tooltip="是否启用反垃圾检测"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item
            label="反垃圾业务ID"
            name={['params', 'antispamConfig', 'antispamBusinessId']}
            tooltip="反垃圾业务标识ID"
          >
            <Input placeholder="反垃圾业务ID" />
          </Form.Item>
        </Card>

        {/* 路由配置 */}
        <Card title="路由配置" size="small" style={{ marginBottom: 16 }}>
          <Form.Item
            label="路由开关"
            name={['params', 'routeConfig', 'routeEnabled']}
            valuePropName="checked"
            tooltip="是否启用路由配置"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item
            label="路由环境"
            name={['params', 'routeConfig', 'routeEnvironment']}
            tooltip="路由环境标识"
          >
            <Input placeholder="路由环境标识" />
          </Form.Item>
        </Card>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              发送自定义通知
            </Button>
            <Button type="default" onClick={handleReset}>
              重置
            </Button>
            <Button type="default" onClick={handleOutput}>
              输出调用语句
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>自定义通知：</strong>用于发送自定义的透传通知，接收方会通过
            onReceiveCustomNotification 回调收到
          </li>
          <li>
            <strong>会话类型：</strong>
            <ul style={{ marginTop: 4 }}>
              <li>点对点 (P2P)：发送给指定用户的私聊通知</li>
              <li>群组 (Team)：发送给高级群的群组通知</li>
              <li>超大群 (SuperTeam)：发送给超大群的群组通知</li>
            </ul>
          </li>
          <li>
            <strong>通知内容：</strong>最大支持4096个字符，会作为 SystemMsgTag.Attach 字段传递
          </li>
          <li>
            <strong>配置参数：</strong>所有配置参数都是可选的，可以根据实际需求选择性配置
            <ul style={{ marginTop: 4 }}>
              <li>通知相关配置：控制角标、昵称、APNS等基础通知属性</li>
              <li>推送配置：控制离线推送的标题、内容、载荷等</li>
              <li>反垃圾配置：控制是否启用反垃圾检测</li>
              <li>路由配置：控制消息路由相关设置</li>
            </ul>
          </li>
          <li>
            <strong>会话ID构建：</strong>系统会根据会话类型和目标账号自动构建正确的会话ID
          </li>
        </ul>
      </Card>

      {/* API 参数说明 */}
      <Card title="API 参数说明" style={{ marginTop: 16 }} size="small">
        <div style={{ marginBottom: 16 }}>
          <h4>基础参数：</h4>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <strong>conversationId (string):</strong> 会话ID，必填
              <ul style={{ marginTop: 4 }}>
                <li>点对点会话：通过 V2NIMConversationIdUtil.p2pConversationId(accountId) 构建</li>
                <li>群组会话：通过 V2NIMConversationIdUtil.teamConversationId(teamId) 构建</li>
                <li>
                  超大群会话：通过 V2NIMConversationIdUtil.superTeamConversationId(superTeamId) 构建
                </li>
              </ul>
            </li>
            <li>
              <strong>content (string):</strong> 通知内容，必填，最大4096个字符
            </li>
            <li>
              <strong>params (V2NIMSendCustomNotificationParams):</strong> 发送配置参数，可选
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4>V2NIMSendCustomNotificationParams 配置：</h4>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <strong>notificationConfig (V2NIMNotificationConfig):</strong> 通知相关配置
              <ul style={{ marginTop: 4 }}>
                <li>badgeEnabled: 是否显示角标</li>
                <li>needPushNick: 是否需要推送昵称</li>
                <li>apnsText: APNS推送显示文本</li>
                <li>pushPayload: 推送载荷数据</li>
              </ul>
            </li>
            <li>
              <strong>pushConfig (V2NIMNotificationPushConfig):</strong> 推送配置
              <ul style={{ marginTop: 4 }}>
                <li>pushTitle: 推送标题</li>
                <li>pushContent: 推送内容</li>
                <li>pushPayload: 推送载荷</li>
                <li>forcePush: 是否强制推送</li>
                <li>forcePushList: 强制推送用户列表</li>
                <li>forcePushContent: 强制推送内容</li>
              </ul>
            </li>
            <li>
              <strong>antispamConfig (V2NIMNotificationAntispamConfig):</strong> 反垃圾配置
              <ul style={{ marginTop: 4 }}>
                <li>antispamEnabled: 是否启用反垃圾</li>
                <li>antispamBusinessId: 反垃圾业务ID</li>
              </ul>
            </li>
            <li>
              <strong>routeConfig (V2NIMNotificationRouteConfig):</strong> 路由配置
              <ul style={{ marginTop: 4 }}>
                <li>routeEnabled: 是否启用路由</li>
                <li>routeEnvironment: 路由环境</li>
              </ul>
            </li>
          </ul>
        </div>
      </Card>

      {/* 返回结果说明 */}
      <Card title="返回结果说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>成功：</strong>Promise&lt;void&gt;，无返回值表示发送成功
          </li>
          <li>
            <strong>失败：</strong>抛出 V2NIMError 异常，包含错误码和错误描述
          </li>
          <li>
            <strong>接收方回调：</strong>接收方会通过
            V2NIMNotificationListener.onReceiveCustomNotification 回调收到通知
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
            <strong>确保已登录并完成数据同步</strong>
          </li>
          <li>自定义通知不会存储在消息历史中，只用于实时通知</li>
          <li>接收方需要监听 onReceiveCustomNotification 回调才能收到通知</li>
          <li>通知内容最大支持4096个字符，超出会发送失败</li>
          <li>
            <strong>群组通知需要发送者是群成员</strong>
          </li>
          <li>推送配置只在接收方离线时生效</li>
          <li>反垃圾配置需要在云信控制台开启反垃圾服务</li>
          <li>
            <strong>自定义通知主要用于实时业务通知，不建议用于聊天消息</strong>
          </li>
          <li>发送频率有限制，避免过于频繁发送</li>
          <li>目标用户不存在或不可达时会发送失败</li>
        </ul>
      </Card>
    </div>
  );
};

export default SendCustomNotificationPage;
