import { Button, Card, Form, Radio, Select, Space, message } from 'antd';
import {
  V2NIMTeam,
  V2NIMTeamMember,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface KickMemberFormValues {
  teamId: string;
  teamType: number;
  memberAccountIds: string[];
}

const defaultKickMemberFormValues: KickMemberFormValues = {
  teamId: '',
  teamType: 1, // 默认高级群
  memberAccountIds: [],
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMTeamService.kickMember`;

const KickMemberPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 群组列表加载状态
  const [teamListLoading, setTeamListLoading] = useState(false);
  // 群成员列表加载状态
  const [memberListLoading, setMemberListLoading] = useState(false);
  // 已加入的群组列表
  const [joinedTeamList, setJoinedTeamList] = useState<V2NIMTeam[]>([]);
  // 当前选中群组的成员列表
  const [teamMemberList, setTeamMemberList] = useState<V2NIMTeamMember[]>([]);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): KickMemberFormValues => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return { ...defaultKickMemberFormValues, ...parsedStored };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return defaultKickMemberFormValues;
  };

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
  const handleKickMember = async (values: KickMemberFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { teamId, teamType, memberAccountIds } = values;
    if (!teamId) {
      message.error('请选择要踢出成员的群组');
      return;
    }

    if (!memberAccountIds || memberAccountIds.length === 0) {
      message.error('请输入要踢出的成员账号ID');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMTeamService.kickMember execute, params:', {
      teamId,
      teamType,
      memberAccountIds,
    });

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMTeamService.kickMember(teamId, teamType, memberAccountIds)
    );

    if (error) {
      message.error(`踢出群成员失败: ${error.toString()}`);
      console.error('踢出群成员失败:', error.toString());
    } else {
      message.success('踢出群成员成功');
      console.log('踢出群成员成功, 结果:', result);
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
    form.setFieldsValue(defaultKickMemberFormValues);
    message.success('表单已重置为默认值');
  };

  // 刷新群组列表
  const handleRefreshTeamList = () => {
    fetchJoinedTeamList();
  };

  // 获取群成员列表
  const fetchTeamMemberList = async (teamId: string, teamType: number) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setMemberListLoading(true);
    setTeamMemberList([]); // 清空之前的成员列表

    try {
      let allMembers: V2NIMTeamMember[] = [];
      let nextToken = '';
      let finished = false;

      // 循环获取所有成员（分页）
      while (!finished) {
        const queryOption = {
          roleQueryType: 0, // V2NIM_TEAM_MEMBER_ROLE_QUERY_TYPE_ALL
          onlyChatBanned: false,
          direction: 1, // V2NIM_QUERY_DIRECTION_DESC
          limit: 100,
          nextToken: nextToken,
        };

        const [error, result] = await to(() =>
          window.nim?.V2NIMTeamService.getTeamMemberList(teamId, teamType, queryOption)
        );

        if (error) {
          message.error(`获取群成员列表失败: ${error.toString()}`);
          console.error('获取群成员列表失败:', error.toString());
          break;
        }

        if (result && result.memberList) {
          allMembers = [...allMembers, ...result.memberList];
          nextToken = result.nextToken || '';
          finished = result.finished || false;
        } else {
          finished = true;
        }
      }

      console.log('获取群成员列表成功:', allMembers);
      setTeamMemberList(allMembers);
    } catch (error) {
      message.error(`获取群成员列表失败: ${error}`);
      console.error('获取群成员列表失败:', error);
    }

    setMemberListLoading(false);
  };

  // 当选择群组时自动填充群组类型并获取成员列表
  const handleTeamSelect = (teamId: string) => {
    const selectedTeam = joinedTeamList.find(team => team.teamId === teamId);
    if (selectedTeam) {
      form.setFieldsValue({
        teamId,
        teamType: selectedTeam.teamType,
        memberAccountIds: [], // 清空已选择的成员
      });
      // 获取该群组的成员列表
      fetchTeamMemberList(teamId, selectedTeam.teamType);
    }
  };

  // 刷新群成员列表
  const handleRefreshMemberList = () => {
    const teamId = form.getFieldValue('teamId');
    const teamType = form.getFieldValue('teamType');
    if (teamId && teamType) {
      fetchTeamMemberList(teamId, teamType);
    } else {
      message.warning('请先选择群组');
    }
  };

  // 获取成员显示名称
  const getMemberDisplayName = (member: V2NIMTeamMember) => {
    const roleName = getMemberRoleName(member.memberRole);
    if (member.teamNick) {
      return `${member.teamNick} (${member.accountId}) [${roleName}]`;
    }
    return `${member.accountId} [${roleName}]`;
  };

  // 获取成员角色名称
  const getMemberRoleName = (memberRole: number) => {
    switch (memberRole) {
      case 1:
        return '群主';
      case 2:
        return '管理员';
      case 3:
        return '普通成员';
      default:
        return `未知(${memberRole})`;
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
    const { teamId, teamType, memberAccountIds } = values;

    if (!teamId) {
      message.error('请先选择要踢出成员的群组');
      return;
    }

    if (!memberAccountIds || memberAccountIds.length === 0) {
      message.error('请先输入要踢出的成员账号ID');
      return;
    }

    const callStatement = `await window.nim.V2NIMTeamService.kickMember(${JSON.stringify(teamId)}, ${teamType}, ${JSON.stringify(memberAccountIds)});`;

    console.log('V2NIMTeamService.kickMember 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleKickMember}
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
          rules={[{ required: true, message: '请选择要踢出成员的群组' }]}
        >
          <Select
            placeholder="请选择要踢出成员的群组"
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
          tooltip="必须与要操作的群组类型一致"
        >
          <Radio.Group>
            <Radio value={1}>高级群 (V2NIM_TEAM_TYPE_NORMAL)</Radio>
            <Radio value={2}>超大群 (V2NIM_TEAM_TYPE_SUPER)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="选择成员"
          name="memberAccountIds"
          rules={[{ required: true, message: '请选择要踢出的群成员' }]}
          tooltip="支持选择多个成员，也可以手动输入账号ID"
        >
          <Select
            mode="tags"
            placeholder="请选择要踢出的群成员（支持多选和手动输入）"
            loading={memberListLoading}
            showSearch
            optionFilterProp="children"
            dropdownRender={menu => (
              <div>
                {menu}
                <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                  <Button
                    type="link"
                    size="small"
                    onClick={handleRefreshMemberList}
                    loading={memberListLoading}
                    style={{ padding: 0 }}
                  >
                    刷新成员列表
                  </Button>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    提示：可以从列表中选择成员，也可以直接输入账号ID
                  </div>
                </div>
              </div>
            )}
            notFoundContent={
              memberListLoading
                ? '加载中...'
                : teamMemberList.length === 0
                  ? '请先选择群组以加载成员列表'
                  : '未找到匹配的成员'
            }
          >
            {teamMemberList
              .filter(member => member.inTeam) // 只显示在群中的成员
              .map(member => (
                <Select.Option key={member.accountId} value={member.accountId}>
                  {getMemberDisplayName(member)}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              踢出群成员
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
            <strong>选择群组:</strong> 从已加入的群组列表中选择要踢出成员的群组
          </li>
          <li>
            <strong>群组类型:</strong> 必须与要操作的群组的实际类型一致
            <ul style={{ marginTop: 4 }}>
              <li>1 - 高级群 (V2NIM_TEAM_TYPE_NORMAL)</li>
              <li>2 - 超大群 (V2NIM_TEAM_TYPE_SUPER)</li>
            </ul>
          </li>
          <li>
            <strong>选择成员:</strong> 要踢出的群成员
            <ul style={{ marginTop: 4 }}>
              <li>支持从群成员列表中选择多个成员</li>
              <li>也可以手动输入账号ID（如果成员不在列表中）</li>
              <li>成员列表会显示群昵称、账号ID和身份</li>
              <li>只显示当前在群中的成员</li>
            </ul>
          </li>
          <li>选择群组后，系统会自动填充对应的群组类型</li>
          <li>支持按群组名称或ID搜索群组</li>
          <li>选择群组后会自动加载该群组的成员列表</li>
          <li>可以点击"刷新群组列表"按钮获取最新的群组信息</li>
          <li>可以点击"刷新成员列表"按钮获取最新的成员信息</li>
          <li>支持按成员昵称或账号ID搜索成员</li>
        </ul>
      </Card>

      {/* 权限说明 */}
      <Card title="权限说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>只有群主有权限调用此接口</strong>
          </li>
          <li>群主可以踢出群内任何成员（包括管理员）</li>
          <li>被踢出的成员将立即失去群组访问权限</li>
          <li>管理员和普通成员无权限踢出其他成员</li>
        </ul>
      </Card>

      {/* 操作结果说明 */}
      <Card title="操作结果说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>操作成功后的事件触发：</strong>
            <ul style={{ marginTop: 4 }}>
              <li>
                <strong>被踢出的用户端:</strong> SDK 会抛出 V2NIMTeamListener.onTeamLeft 事件
              </li>
              <li>
                <strong>群内其他用户端:</strong> SDK 会抛出 V2NIMTeamListener.onTeamMemberKicked
                事件
              </li>
            </ul>
          </li>
          <li>被踢出的成员将从群组成员列表中移除</li>
          <li>被踢出的成员不再接收该群组的消息和通知</li>
          <li>被踢出的成员可以重新申请加入群组（如果群组设置允许）</li>
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
            <strong>只有群主有权限操作此接口，其他身份会操作失败</strong>
          </li>
          <li>踢出群成员操作是即时生效的，请谨慎操作</li>
          <li>群组类型参数必须与目标群组的实际类型一致，否则会操作失败</li>
          <li>
            <strong>建议先通过 V2NIMTeamService.getTeamMemberList 确认成员存在</strong>
          </li>
          <li>踢出群成员会触发相应的事件回调，请注意监听相关事件</li>
          <li>被踢出的成员可以重新申请加入群组</li>
          <li>踢出操作不会删除被踢成员的聊天记录</li>
          <li>不能踢出群主自己，群主如需离开群组请先转让群主身份</li>
        </ul>
      </Card>
    </div>
  );
};

export default KickMemberPage;
