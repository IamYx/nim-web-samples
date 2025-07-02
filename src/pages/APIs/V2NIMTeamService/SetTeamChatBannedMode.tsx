import { Button, Card, Form, Radio, Select, Space, Tag, message } from 'antd';
import { V2NIMTeam } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface SetTeamChatBannedModeFormValues {
  teamId: string;
  teamType: number;
  chatBannedMode: number;
}

const defaultSetTeamChatBannedModeFormValues: SetTeamChatBannedModeFormValues = {
  teamId: '',
  teamType: 1, // V2NIM_TEAM_TYPE_NORMAL - 高级群
  chatBannedMode: 0, // V2NIM_TEAM_CHAT_BANNED_MODE_NONE - 不禁言
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMTeamService.setTeamChatBannedMode`;

const SetTeamChatBannedModePage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 获取群组列表的加载状态
  const [fetchingTeams, setFetchingTeams] = useState(false);
  // 已加入的群组列表（只显示当前用户是群主或管理员的群组）
  const [teamList, setTeamList] = useState<V2NIMTeam[]>([]);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取初始值
  const getInitialValues = () => {
    const storedValues = localStorage.getItem(storageKey);
    if (storedValues) {
      try {
        const parsedValues = JSON.parse(storedValues);
        return { ...defaultSetTeamChatBannedModeFormValues, ...parsedValues };
      } catch (error) {
        console.error('解析存储的表单数据失败:', error);
        return defaultSetTeamChatBannedModeFormValues;
      }
    }
    return defaultSetTeamChatBannedModeFormValues;
  };

  const initialValues = getInitialValues();

  // 获取已加入的群组列表（只显示当前用户是群主或管理员的群组）
  const fetchTeamList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setFetchingTeams(true);

    // 打印 API 入参
    console.log('API V2NIMTeamService.getJoinedTeamList execute, params:', undefined);

    // 执行 API，获取所有类型的群组
    const [error, result] = await to(() =>
      window.nim?.V2NIMTeamService.getJoinedTeamList([form.getFieldValue('teamType')])
    );

    if (error) {
      message.error(`获取群组列表失败: ${error.toString()}`);
      console.error('获取群组列表失败:', error);
      setTeamList([]);
    } else {
      console.log('获取群组列表成功, 结果:', result);
      const currentUserId = window.nim?.V2NIMLoginService.getLoginUser();

      // 只显示有效的群组，并且当前用户是群主或管理员的群组
      const validTeams = (result || []).filter((team: V2NIMTeam) => {
        if (!team.isValidTeam) return false;

        // 群主可以设置禁言模式
        if (team.ownerAccountId === currentUserId) return true;

        // 检查是否是管理员需要额外的成员信息，这里简化处理
        // 实际应用中可能需要调用 getTeamMemberList 来确认用户角色
        return team.ownerAccountId === currentUserId;
      });

      setTeamList(validTeams);

      if (validTeams.length === 0) {
        message.info('暂无可管理的群组（只有群主和管理员才能设置禁言模式）');
      } else {
        message.success(`获取到 ${validTeams.length} 个可管理的群组`);
      }
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

  const handleTeamTypeChange = () => {
    form.setFieldsValue({
      teamId: '',
    });
    fetchTeamList();
  };

  // 当选择群组时自动填充群组类型
  const handleTeamSelect = (teamId: string) => {
    const selectedTeam = teamList.find(team => team.teamId === teamId);
    if (selectedTeam) {
      form.setFieldsValue({
        teamId,
        teamType: selectedTeam.teamType,
      });
    }
  };

  // 表单提交: 触发 API 调用
  const handleSetTeamChatBannedMode = async (values: SetTeamChatBannedModeFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { teamId, teamType, chatBannedMode } = values;

    if (!teamId.trim()) {
      message.error('请选择群组');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMTeamService.setTeamChatBannedMode execute, params:', {
      teamId,
      teamType,
      chatBannedMode,
    });

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMTeamService.setTeamChatBannedMode(teamId, teamType, chatBannedMode)
    );

    if (error) {
      message.error(`设置群组禁言模式失败: ${error.toString()}`);
      console.error('设置群组禁言模式失败:', error.toString());
    } else {
      message.success('设置群组禁言模式成功');
      console.log('设置群组禁言模式成功');
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
    form.setFieldsValue(defaultSetTeamChatBannedModeFormValues);
    message.success('表单已重置为默认值');
  };

  // 刷新群组列表
  const handleRefreshTeams = () => {
    fetchTeamList();
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { teamId, teamType, chatBannedMode } = values;

    if (!teamId.trim()) {
      message.error('请先选择群组');
      return;
    }

    const callStatement = `await window.nim.V2NIMTeamService.setTeamChatBannedMode("${teamId}", ${teamType}, ${chatBannedMode});`;

    console.log('V2NIMTeamService.setTeamChatBannedMode 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 禁言模式选项
  const chatBannedModeOptions = [
    {
      label: '不禁言',
      value: 0,
      description: '群组成员可以自由发言',
    },
    {
      label: '普通成员禁言',
      value: 1,
      description: '普通成员禁言，不包括管理员和群主',
    },
    {
      label: '全员禁言',
      value: 2,
      description: '群组所有成员都被禁言，该状态只能通过 OpenAPI 发起',
    },
  ];

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

  // 获取禁言模式显示文本
  const getChatBannedModeText = (chatBannedMode: number) => {
    switch (chatBannedMode) {
      case 0:
        return '不禁言';
      case 1:
        return '普通成员禁言';
      case 2:
        return '全员禁言';
      default:
        return `未知(${chatBannedMode})`;
    }
  };

  // 获取禁言模式标签
  const getChatBannedModeTag = (chatBannedMode: number) => {
    switch (chatBannedMode) {
      case 0:
        return <Tag color="green">不禁言</Tag>;
      case 1:
        return <Tag color="orange">普通成员禁言</Tag>;
      case 2:
        return <Tag color="red">全员禁言</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleSetTeamChatBannedMode}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMTeamService`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item label="群组列表">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Button onClick={handleRefreshTeams} loading={fetchingTeams} size="small">
                刷新群组列表
              </Button>
              <span style={{ color: '#666', fontSize: '12px' }}>
                {fetchingTeams ? '正在获取...' : `共 ${teamList.length} 个可管理群组`}
              </span>
            </Space>
          </Space>
        </Form.Item>

        <Form.Item
          label="选择群组"
          name="teamId"
          rules={[{ required: true, message: '请选择要设置禁言模式的群组' }]}
        >
          <Select
            placeholder="请选择要设置禁言模式的群组"
            loading={fetchingTeams}
            onSelect={handleTeamSelect}
            showSearch
            optionFilterProp="children"
            style={{ width: '100%' }}
            notFoundContent={fetchingTeams ? '正在获取群组列表...' : '暂无可管理的群组'}
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
          >
            {teamList.map(team => (
              <Select.Option key={team.teamId} value={team.teamId}>
                {team.name || team.teamId} ({getTeamTypeText(team.teamType)}) - {team.teamId}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="群组类型"
          name="teamType"
          rules={[{ required: true, message: '请选择群组类型' }]}
          tooltip="必须与要操作的群组类型一致"
        >
          <Radio.Group onChange={handleTeamTypeChange}>
            <Radio value={1}>高级群 (V2NIM_TEAM_TYPE_NORMAL)</Radio>
            <Radio value={2}>超大群 (V2NIM_TEAM_TYPE_SUPER)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="禁言模式"
          name="chatBannedMode"
          rules={[{ required: true, message: '请选择禁言模式' }]}
          tooltip="设置群组的禁言模式"
        >
          <Radio.Group>
            {chatBannedModeOptions.map(option => (
              <Radio
                key={option.value}
                value={option.value}
                style={{ display: 'block', marginBottom: 8 }}
              >
                <Space direction="vertical" size={2}>
                  <span>
                    {option.label} ({getChatBannedModeText(option.value)})
                  </span>
                  <span style={{ color: '#666', fontSize: '12px' }}>{option.description}</span>
                </Space>
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              设置禁言模式
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
            <strong>选择群组:</strong>{' '}
            从已加入的群组列表中选择要设置禁言模式的群组（只有群主和管理员才能设置）
          </li>
          <li>
            <strong>权限要求:</strong> 只有群主和管理员才能设置群组禁言模式
          </li>
          <li>
            <strong>禁言模式类型:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>{getChatBannedModeTag(0)} - 群组成员可以自由发言</li>
              <li>{getChatBannedModeTag(1)} - 普通成员禁言，不包括管理员和群主</li>
              <li>{getChatBannedModeTag(2)} - 群组所有成员都被禁言，该状态只能通过 OpenAPI 发起</li>
            </ul>
          </li>
          <li>
            <strong>群组类型:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>{getTeamTypeText(1)} (V2NIM_TEAM_TYPE_NORMAL = 1)</li>
              <li>{getTeamTypeText(2)} (V2NIM_TEAM_TYPE_SUPER = 2)</li>
            </ul>
          </li>
          <li>选择群组后，系统会自动填充对应的群组类型</li>
          <li>支持按群组名称或ID搜索群组</li>
          <li>可以点击"刷新群组列表"按钮获取最新的群组信息</li>
        </ul>
      </Card>

      {/* 操作结果说明 */}
      <Card title="操作结果说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>操作成功后的事件触发：</strong>
            <ul style={{ marginTop: 4 }}>
              <li>
                <strong>所有群成员端:</strong> SDK 会抛出 V2NIMTeamListener.onTeamInfoUpdated 事件
              </li>
              <li>
                <strong>群组中的成员:</strong> 会收到一条通知类消息，通知类型为
                V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_UPDATE_TINFO
              </li>
            </ul>
          </li>
          <li>设置成功后，禁言模式将立即生效</li>
          <li>普通成员禁言时，只有群主和管理员可以发言</li>
          <li>全员禁言时，所有成员都无法发言</li>
        </ul>
      </Card>

      {/* API 参数说明 */}
      <Card title="API 参数说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>teamId (string):</strong> 群组ID，不能为空
          </li>
          <li>
            <strong>teamType (V2NIMTeamType):</strong> 群组类型
            <ul style={{ marginTop: 4 }}>
              <li>
                <strong>1:</strong> 高级群 (V2NIM_TEAM_TYPE_NORMAL)
              </li>
              <li>
                <strong>2:</strong> 超大群 (V2NIM_TEAM_TYPE_SUPER)
              </li>
            </ul>
          </li>
          <li>
            <strong>chatBannedMode (V2NIMTeamChatBannedMode):</strong> 禁言模式
            <ul style={{ marginTop: 4 }}>
              <li>
                <strong>0:</strong> 不禁言 (V2NIM_TEAM_CHAT_BANNED_MODE_NONE)
              </li>
              <li>
                <strong>1:</strong> 普通成员禁言 (V2NIM_TEAM_CHAT_BANNED_MODE_BANNED_NORMAL)
              </li>
              <li>
                <strong>2:</strong> 全员禁言 (V2NIM_TEAM_CHAT_BANNED_MODE_BANNED_ALL)
              </li>
            </ul>
          </li>
        </ul>
      </Card>

      {/* 禁言模式详解 */}
      <Card title="禁言模式详解" style={{ marginTop: 16 }} size="small">
        <div style={{ margin: 0 }}>
          <div style={{ marginBottom: 12 }}>
            <strong>不禁言 {getChatBannedModeTag(0)}:</strong>
            <ul style={{ marginTop: 4, paddingLeft: 20 }}>
              <li>所有群成员都可以正常发言</li>
              <li>没有任何发言限制</li>
              <li>默认的群组状态</li>
            </ul>
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>普通成员禁言 {getChatBannedModeTag(1)}:</strong>
            <ul style={{ marginTop: 4, paddingLeft: 20 }}>
              <li>只有群主和管理员可以发言</li>
              <li>普通成员无法发送消息</li>
              <li>常用于群公告、重要通知等场景</li>
            </ul>
          </div>
          <div>
            <strong>全员禁言 {getChatBannedModeTag(2)}:</strong>
            <ul style={{ marginTop: 4, paddingLeft: 20 }}>
              <li>所有群成员都无法发言（包括群主和管理员）</li>
              <li>该状态只能通过 OpenAPI 发起</li>
              <li>通常用于紧急情况或群组维护</li>
            </ul>
          </div>
        </div>
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
          <li>
            <strong>只有群主和管理员才能执行此操作</strong>
          </li>
          <li>
            <strong>全员禁言模式只能通过 OpenAPI 发起，客户端 API 无法设置</strong>
          </li>
          <li>禁言模式设置后立即生效，请谨慎操作</li>
          <li>设置成功会触发 onTeamInfoUpdated 事件，请注意监听相关事件</li>
          <li>
            <strong>建议配合 V2NIMTeamService.on 监听群组事件获取实时通知</strong>
          </li>
          <li>普通成员禁言时，被禁言的成员会收到相应的提示</li>
          <li>群主和管理员在任何禁言模式下都保持发言权限（除了全员禁言）</li>
          <li>
            <strong>合理使用禁言功能，避免影响群组正常交流</strong>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default SetTeamChatBannedModePage;
