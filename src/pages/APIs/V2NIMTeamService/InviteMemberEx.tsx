import { Button, Card, Form, Input, Radio, Select, Space, message } from 'antd';
import { V2NIMTeam } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface InviteMemberExInternalFormValues {
  teamId: string;
  teamType: number;
  inviteeAccountIds: string; // 表单内部使用字符串
  postscript: string;
  serverExtension: string;
}

const defaultInviteMemberExFormValues: InviteMemberExInternalFormValues = {
  teamId: '',
  teamType: 1, // 默认高级群
  inviteeAccountIds: '',
  postscript: '',
  serverExtension: '',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMTeamService.inviteMemberEx`;

const InviteMemberExPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 群组列表加载状态
  const [teamListLoading, setTeamListLoading] = useState(false);
  // 已加入的群组列表
  const [joinedTeamList, setJoinedTeamList] = useState<V2NIMTeam[]>([]);
  // 当前输入的账号ID列表（用于实时显示）
  const [currentAccountIds, setCurrentAccountIds] = useState<string[]>([]);

  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 解析账号ID字符串为数组
  const parseInviteeAccountIds = (input: string): string[] => {
    if (!input || typeof input !== 'string') {
      return [];
    }

    // 支持换行符和逗号分隔，同时去除空格和空行
    return input
      .split(/[,\n]/)
      .map(id => id.trim())
      .filter(id => id.length > 0);
  };

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = () => defaultInviteMemberExFormValues;

  const initialValues = getInitialValues();

  // 获取已加入的群组列表
  const fetchJoinedTeamList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setTeamListLoading(true);

    // 获取所有类型的群组
    const [error, result] = await to(() => window.nim?.V2NIMTeamService.getJoinedTeamList());

    if (error) {
      message.error(`获取群组列表失败: ${error.toString()}`);
      console.error('获取群组列表失败:', error.toString());
      setJoinedTeamList([]);
    } else {
      console.log('获取群组列表成功:', result);
      setJoinedTeamList(result || []);
    }
    setTeamListLoading(false);
  };

  // 组件加载时获取群组列表
  useEffect(() => {
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      fetchJoinedTeamList();
    }
  }, []);

  // 表单提交: 触发 API 调用
  const handleInviteMemberEx = async (values: InviteMemberExInternalFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const {
      teamId,
      teamType,
      inviteeAccountIds: inviteeAccountIdsInput,
      postscript,
      serverExtension,
    } = values;
    if (!teamId) {
      message.error('请选择要邀请成员的群组');
      return;
    }

    // 解析账号ID数组
    const inviteeAccountIds = parseInviteeAccountIds(inviteeAccountIdsInput);
    if (!inviteeAccountIds || inviteeAccountIds.length === 0) {
      message.error('请输入要邀请的账号ID');
      return;
    }

    setLoading(true);

    // 构造邀请参数
    const inviteeParams = {
      inviteeAccountIds,
      postscript: postscript || undefined,
      serverExtension: serverExtension || undefined,
    };

    // 打印 API 入参
    console.log('API V2NIMTeamService.inviteMemberEx execute, params:', {
      teamId,
      teamType,
      inviteeParams,
    });

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMTeamService.inviteMemberEx(teamId, teamType, inviteeParams)
    );

    if (error) {
      message.error(`邀请成员失败: ${error.toString()}`);
      console.error('邀请成员失败:', error.toString());
    } else {
      if (result && result.length > 0) {
        message.warning(`邀请部分成功，失败的账号: ${result.join(', ')}`);
        console.log('邀请部分成功，失败的账号:', result);
      } else {
        message.success('邀请成员成功');
        console.log('邀请成员成功, 结果:', result);
      }
    }

    setLoading(false);
    // 存储最终执行的参数
    // localStorage.setItem(storageKey, JSON.stringify(values));
  };

  // 重置表单到默认值
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 重置表单为默认值
    form.setFieldsValue(defaultInviteMemberExFormValues);
    message.success('表单已重置为默认值');
  };

  // 刷新群组列表
  const handleRefreshTeamList = () => {
    fetchJoinedTeamList();
  };

  // 当选择群组时自动填充群组类型
  const handleTeamSelect = (teamId: string) => {
    const selectedTeam = joinedTeamList.find(team => team.teamId === teamId);
    if (selectedTeam) {
      form.setFieldsValue({
        teamId,
        teamType: selectedTeam.teamType,
      });
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

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const {
      teamId,
      teamType,
      inviteeAccountIds: inviteeAccountIdsInput,
      postscript,
      serverExtension,
    } = values;

    if (!teamId) {
      message.error('请先选择要邀请成员的群组');
      return;
    }

    // 解析账号ID数组
    const inviteeAccountIds = parseInviteeAccountIds(inviteeAccountIdsInput);
    if (!inviteeAccountIds || inviteeAccountIds.length === 0) {
      message.error('请先输入要邀请的账号ID');
      return;
    }

    const inviteeParams = {
      inviteeAccountIds,
      postscript: postscript || undefined,
      serverExtension: serverExtension || undefined,
    };

    const callStatement = `await window.nim.V2NIMTeamService.inviteMemberEx(${JSON.stringify(teamId)}, ${teamType}, ${JSON.stringify(inviteeParams)});`;

    console.log('V2NIMTeamService.inviteMemberEx 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleInviteMemberEx}
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

        <Form.Item
          label="选择群组"
          name="teamId"
          rules={[{ required: true, message: '请选择要邀请成员的群组' }]}
        >
          <Select
            placeholder="请选择要邀请成员的群组"
            loading={teamListLoading}
            onSelect={handleTeamSelect}
            showSearch
            optionFilterProp="children"
            dropdownRender={menu => (
              <div>
                {menu}
                <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                  <Button
                    type="link"
                    size="small"
                    onClick={handleRefreshTeamList}
                    loading={teamListLoading}
                    style={{ padding: 0 }}
                  >
                    刷新群组列表
                  </Button>
                </div>
              </div>
            )}
          >
            {joinedTeamList.map(team => (
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
          tooltip="必须与要邀请成员的群组类型一致"
        >
          <Radio.Group>
            <Radio value={1}>高级群 (V2NIM_TEAM_TYPE_NORMAL)</Radio>
            <Radio value={2}>超大群 (V2NIM_TEAM_TYPE_SUPER)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="邀请账号"
          name="inviteeAccountIds"
          rules={[{ required: true, message: '请输入要邀请的账号ID' }]}
          tooltip="输入要邀请的账号ID，多个账号用换行符或逗号分隔"
        >
          <div>
            <Input.TextArea
              placeholder="请输入要邀请的账号ID，一行一个或用逗号分隔&#10;例如：&#10;user001&#10;user002&#10;或者：user001,user002"
              rows={4}
              onChange={e => {
                const accountIds = parseInviteeAccountIds(e.target.value);
                setCurrentAccountIds(accountIds);
              }}
            />
            {currentAccountIds.length > 0 && (
              <div
                style={{ marginTop: 8, padding: 8, backgroundColor: '#f6f6f6', borderRadius: 4 }}
              >
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>
                  已输入 {currentAccountIds.length} 个账号ID:
                </div>
                <div style={{ fontSize: '12px', color: '#333' }}>
                  {currentAccountIds.join(', ')}
                </div>
              </div>
            )}
          </div>
        </Form.Item>

        <Form.Item label="邀请附言" name="postscript" tooltip="邀请入群的附言，可选">
          <Input.TextArea placeholder="请输入邀请附言（可选）" rows={2} maxLength={500} showCount />
        </Form.Item>

        <Form.Item
          label="扩展字段"
          name="serverExtension"
          tooltip="邀请入群的扩展字段，最多512个字符，仅支持高级群"
        >
          <Input.TextArea
            placeholder="请输入扩展字段（可选，仅支持高级群）"
            rows={2}
            maxLength={512}
            showCount
          />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              邀请成员
            </Button>
            <Button type="default" onClick={handleReset}>
              重置
            </Button>
            <Button type="default" onClick={handleRefreshTeamList} loading={teamListLoading}>
              刷新群组列表
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
            <strong>选择群组:</strong> 从已加入的群组列表中选择要邀请成员的群组
          </li>
          <li>
            <strong>群组类型:</strong> 必须与要邀请成员的群组的实际类型一致
            <ul style={{ marginTop: 4 }}>
              <li>1 - 高级群 (V2NIM_TEAM_TYPE_NORMAL)</li>
              <li>2 - 超大群 (V2NIM_TEAM_TYPE_SUPER)</li>
            </ul>
          </li>
          <li>
            <strong>邀请账号:</strong> 输入要邀请的用户账号ID
            <ul style={{ marginTop: 4 }}>
              <li>支持多个账号，用换行符或逗号分隔</li>
              <li>系统会自动去除空格和空行</li>
              <li>显示已输入的账号数量和列表</li>
            </ul>
          </li>
          <li>
            <strong>邀请附言:</strong> 可选，邀请时发送给被邀请者的消息
          </li>
          <li>
            <strong>扩展字段:</strong> 可选，最多512个字符，仅支持高级群
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
            <strong>返回值:</strong> 邀请失败的账号列表
            <ul style={{ marginTop: 4 }}>
              <li>如果全部成功，返回空数组</li>
              <li>如果部分失败，返回失败的账号ID列表</li>
            </ul>
          </li>
          <li>
            <strong>操作成功后的事件触发（根据群组设置）:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>
                <strong>需要被邀请者同意:</strong> 被邀请者端会收到
                V2NIMTeamListener.onReceiveTeamJoinActionInfo 事件
              </li>
              <li>
                <strong>不需要被邀请者同意:</strong>
                <ul style={{ marginTop: 4 }}>
                  <li>被邀请者端会收到 V2NIMTeamListener.onTeamJoined 事件</li>
                  <li>其他群成员端会收到 V2NIMTeamListener.onTeamMemberJoined 事件</li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </Card>

      {/* 权限说明 */}
      <Card title="权限说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>群主和管理员:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>拥有邀请成员的权限</li>
              <li>可以邀请任何用户加入群组</li>
            </ul>
          </li>
          <li>
            <strong>普通成员:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>权限取决于群组设置</li>
              <li>如果群组允许普通成员邀请，则可以邀请</li>
              <li>如果群组不允许，则会收到权限不足的错误</li>
            </ul>
          </li>
          <li>
            <strong>扩展字段限制:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>仅支持高级群，超大群不支持扩展字段</li>
              <li>最多512个字符</li>
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
            <strong>群组类型参数必须与目标群组的实际类型一致，否则会操作失败</strong>
          </li>
          <li>
            <strong>被邀请的账号必须是有效的用户账号</strong>
          </li>
          <li>扩展字段仅支持高级群，超大群会忽略该字段</li>
          <li>邀请成员的权限取决于群组设置和用户角色</li>
          <li>
            <strong>建议先通过 V2NIMTeamService.getJoinedTeamList 确认群组存在</strong>
          </li>
          <li>邀请成员会触发相应的事件回调，请注意监听相关事件</li>
          <li>如果部分账号邀请失败，会在返回结果中列出失败的账号</li>
          <li>被邀请者是否需要同意取决于群组的邀请确认设置</li>
        </ul>
      </Card>
    </div>
  );
};

export default InviteMemberExPage;
