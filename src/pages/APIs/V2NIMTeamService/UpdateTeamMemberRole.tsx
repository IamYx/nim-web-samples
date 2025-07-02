import { Button, Card, Form, Select, Space, Tag, message } from 'antd';
import {
  V2NIMTeam,
  V2NIMTeamMember,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface UpdateTeamMemberRoleFormValues {
  teamId: string;
  teamType: number;
  memberAccountIds: string[];
  memberRole: number;
}

const defaultUpdateTeamMemberRoleFormValues: UpdateTeamMemberRoleFormValues = {
  teamId: '',
  teamType: 1, // V2NIM_TEAM_TYPE_NORMAL - 高级群
  memberAccountIds: [],
  memberRole: 0, // V2NIM_TEAM_MEMBER_ROLE_NORMAL - 普通成员
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMTeamService.updateTeamMemberRole`;

const UpdateTeamMemberRolePage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 获取群组列表的加载状态
  const [fetchingTeams, setFetchingTeams] = useState(false);
  // 群成员列表加载状态
  const [memberListLoading, setMemberListLoading] = useState(false);
  // 已加入的群组列表
  const [teamList, setTeamList] = useState<V2NIMTeam[]>([]);
  // 当前选中群组的成员列表
  const [teamMemberList, setTeamMemberList] = useState<V2NIMTeamMember[]>([]);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取初始值
  const getInitialValues = () => {
    const storedValues = localStorage.getItem(storageKey);
    if (storedValues) {
      try {
        const parsedValues = JSON.parse(storedValues);
        return { ...defaultUpdateTeamMemberRoleFormValues, ...parsedValues };
      } catch (error) {
        console.error('解析存储的表单数据失败:', error);
        return defaultUpdateTeamMemberRoleFormValues;
      }
    }
    return defaultUpdateTeamMemberRoleFormValues;
  };

  const initialValues = getInitialValues();

  // 获取已加入的群组列表
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
      // 只显示有效的群组，并且当前用户是群主的群组（因为只有群主才能设置成员角色）
      const validTeams = (result || []).filter(
        (team: V2NIMTeam) =>
          team.isValidTeam && team.ownerAccountId === window.nim?.V2NIMLoginService.getLoginUser()
      );
      setTeamList(validTeams);

      if (validTeams.length === 0) {
        message.info('暂无可管理的群组（只有群主才能设置成员角色）');
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
      memberAccountIds: [],
    });
    setTeamMemberList([]);
    fetchTeamList();
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
    const selectedTeam = teamList.find(team => team.teamId === teamId);
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
    const roleName = getMemberRoleNameByValue(member.memberRole);
    if (member.teamNick) {
      return `${member.teamNick} (${member.accountId}) [${roleName}]`;
    }
    return `${member.accountId} [${roleName}]`;
  };

  // 获取成员角色名称（根据角色值）
  const getMemberRoleNameByValue = (memberRole: number) => {
    switch (memberRole) {
      case 1:
        return '群主';
      case 2:
        return '管理员';
      case 0:
        return '普通成员';
      default:
        return `未知(${memberRole})`;
    }
  };

  // 表单提交: 触发 API 调用
  const handleUpdateTeamMemberRole = async (values: UpdateTeamMemberRoleFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { teamId, teamType, memberAccountIds, memberRole } = values;

    if (!teamId.trim()) {
      message.error('请输入群组ID');
      return;
    }

    if (memberAccountIds.length === 0) {
      message.error('请至少输入一个成员账号ID');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMTeamService.updateTeamMemberRole execute, params:', {
      teamId,
      teamType,
      memberAccountIds,
      memberRole,
    });

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMTeamService.updateTeamMemberRole(
        teamId,
        teamType,
        memberAccountIds,
        memberRole
      )
    );

    if (error) {
      message.error(`设置成员角色失败: ${error.toString()}`);
      console.error('设置成员角色失败:', error.toString());
    } else {
      message.success('设置成员角色成功');
      console.log('设置成员角色成功');
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
    form.setFieldsValue(defaultUpdateTeamMemberRoleFormValues);
    message.success('表单已重置为默认值');
  };

  // 刷新群组列表
  const handleRefreshTeams = () => {
    fetchTeamList();
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { teamId, teamType, memberAccountIds, memberRole } = values;

    if (!teamId.trim()) {
      message.error('请先输入群组ID');
      return;
    }

    if (memberAccountIds.length === 0) {
      message.error('请先输入成员账号ID');
      return;
    }

    const callStatement = `await window.nim.V2NIMTeamService.updateTeamMemberRole("${teamId}", ${teamType}, ${JSON.stringify(memberAccountIds)}, ${memberRole});`;

    console.log('V2NIMTeamService.updateTeamMemberRole 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 群组类型选项
  const teamTypeOptions = [
    { label: '高级群', value: 1 },
    { label: '超大群', value: 2 },
  ];

  // 成员角色选项
  const memberRoleOptions = [
    { label: '普通成员', value: 0 },
    { label: '管理员', value: 2 },
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

  // 获取成员角色显示文本
  const getMemberRoleText = (memberRole: number) => {
    switch (memberRole) {
      case 0:
        return '普通成员';
      case 1:
        return '群主';
      case 2:
        return '管理员';
      default:
        return `未知(${memberRole})`;
    }
  };

  // 获取成员角色标签
  const getMemberRoleTag = (memberRole: number) => {
    switch (memberRole) {
      case 0:
        return <Tag color="default">普通成员</Tag>;
      case 1:
        return <Tag color="red">群主</Tag>;
      case 2:
        return <Tag color="blue">管理员</Tag>;
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
        onFinish={handleUpdateTeamMemberRole}
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
          rules={[{ required: true, message: '请选择要管理的群组' }]}
        >
          <Select
            placeholder="请选择要管理的群组"
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
        >
          <Select
            placeholder="请选择群组类型"
            options={teamTypeOptions}
            onChange={handleTeamTypeChange}
          />
        </Form.Item>

        <Form.Item
          label="选择成员"
          name="memberAccountIds"
          rules={[{ required: true, message: '请选择要设置角色的群成员' }]}
          tooltip="支持选择多个成员，也可以手动输入账号ID"
        >
          <Select
            mode="tags"
            placeholder="请选择要设置角色的群成员（支持多选和手动输入）"
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
              .filter(member => member.inTeam && member.memberRole !== 1) // 只显示在群中的成员，且排除群主
              .map(member => (
                <Select.Option key={member.accountId} value={member.accountId}>
                  {getMemberDisplayName(member)}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="新角色"
          name="memberRole"
          rules={[{ required: true, message: '请选择新的成员角色' }]}
        >
          <Select placeholder="请选择新的成员角色" options={memberRoleOptions} />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              设置成员角色
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
            <strong>选择群组:</strong> 从已加入的群组列表中选择要管理的群组（只有群主才能管理）
          </li>
          <li>
            <strong>选择成员:</strong> 要设置角色的群成员
            <ul style={{ marginTop: 4 }}>
              <li>支持从群成员列表中选择多个成员</li>
              <li>也可以手动输入账号ID（如果成员不在列表中）</li>
              <li>成员列表会显示群昵称、账号ID和身份</li>
              <li>只显示当前在群中的成员（排除群主）</li>
            </ul>
          </li>
          <li>
            <strong>权限要求:</strong> 只有群主才能设置成员角色
          </li>
          <li>
            <strong>角色限制:</strong> 只能在普通成员与管理员之间进行角色切换
          </li>
          <li>
            <strong>批量操作:</strong> 支持同时为多个成员设置相同的角色
          </li>
          <li>
            <strong>角色一致性:</strong> 如果成员设置的角色与当前角色一致，默认请求成功
          </li>
          <li>选择群组后，系统会自动填充对应的群组类型</li>
          <li>支持按群组名称或ID搜索群组</li>
          <li>选择群组后会自动加载该群组的成员列表</li>
          <li>可以点击"刷新群组列表"按钮获取最新的群组信息</li>
          <li>可以点击"刷新成员列表"按钮获取最新的成员信息</li>
          <li>支持按成员昵称或账号ID搜索成员</li>
          <li>
            <strong>群组类型:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>{getTeamTypeText(1)} (V2NIM_TEAM_TYPE_NORMAL = 1)</li>
              <li>{getTeamTypeText(2)} (V2NIM_TEAM_TYPE_SUPER = 2)</li>
            </ul>
          </li>
          <li>
            <strong>成员角色:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>{getMemberRoleText(0)} (V2NIM_TEAM_MEMBER_ROLE_NORMAL = 0)</li>
              <li>{getMemberRoleText(2)} (V2NIM_TEAM_MEMBER_ROLE_MANAGER = 2)</li>
            </ul>
          </li>
        </ul>
      </Card>

      {/* 操作结果说明 */}
      <Card title="操作结果说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>操作成功后的事件触发：</strong>
            <ul style={{ marginTop: 4 }}>
              <li>
                <strong>所有群成员端:</strong> SDK 会抛出 V2NIMTeamListener.onTeamMemberInfoUpdated
                事件
              </li>
            </ul>
          </li>
          <li>设置成功后，目标成员的角色将立即生效</li>
          <li>管理员将获得相应的群组管理权限</li>
          <li>普通成员将失去管理员权限</li>
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
            <strong>memberAccountIds (string[]):</strong> 待操作的群组成员账号列表，不能为空
          </li>
          <li>
            <strong>memberRole (V2NIMTeamMemberRole):</strong> 新的角色类型
            <ul style={{ marginTop: 4 }}>
              <li>
                <strong>0:</strong> 普通成员 (V2NIM_TEAM_MEMBER_ROLE_NORMAL)
              </li>
              <li>
                <strong>2:</strong> 管理员 (V2NIM_TEAM_MEMBER_ROLE_MANAGER)
              </li>
            </ul>
          </li>
        </ul>
      </Card>

      {/* 角色权限对比 */}
      <Card title="角色权限对比" style={{ marginTop: 16 }} size="small">
        <div style={{ margin: 0 }}>
          <div style={{ marginBottom: 12 }}>
            <strong>普通成员 {getMemberRoleTag(0)}:</strong>
            <ul style={{ marginTop: 4, paddingLeft: 20 }}>
              <li>发送和接收群消息</li>
              <li>查看群信息和成员列表</li>
              <li>退出群组</li>
            </ul>
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>管理员 {getMemberRoleTag(2)}:</strong>
            <ul style={{ marginTop: 4, paddingLeft: 20 }}>
              <li>拥有普通成员的所有权限</li>
              <li>踢出普通成员</li>
              <li>邀请新成员加入</li>
              <li>审批入群申请</li>
              <li>修改群信息（如群名称、群介绍等）</li>
              <li>禁言和解禁成员</li>
            </ul>
          </div>
          <div>
            <strong>群主 {getMemberRoleTag(1)}:</strong>
            <ul style={{ marginTop: 4, paddingLeft: 20 }}>
              <li>拥有管理员的所有权限</li>
              <li>设置和移除管理员</li>
              <li>转让群主身份</li>
              <li>解散群组</li>
              <li>踢出管理员</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* 重要提醒 */}
      <Card
        title="⚠️ 重要提醒"
        style={{
          marginTop: 16,
          border: '2px solid #ff4d4f',
          backgroundColor: '#fff2f0',
        }}
        size="small"
        styles={{
          header: {
            backgroundColor: '#ffccc7',
            color: '#cf1322',
            fontWeight: 'bold',
          },
        }}
      >
        <ul style={{ margin: 0, paddingLeft: 20, color: '#cf1322' }}>
          <li>
            <strong>确保已登录并完成数据同步</strong>
          </li>
          <li>
            <strong>只有群主才能执行此操作</strong>
          </li>
          <li>
            <strong>不能设置群主角色 (memberRole = 1)，群主身份只能通过转让获得</strong>
          </li>
          <li>
            <strong>只能在普通成员(0)和管理员(2)之间切换角色</strong>
          </li>
          <li>批量设置时，所有指定成员将被设置为相同角色</li>
          <li>设置成功会触发 onTeamMemberInfoUpdated 事件，请注意监听相关事件</li>
          <li>
            <strong>建议配合 V2NIMTeamService.on 监听群组事件获取实时通知</strong>
          </li>
          <li>确保要操作的成员确实存在于指定群组中</li>
          <li>
            <strong>管理员数量可能有限制，请注意应用的具体配置</strong>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default UpdateTeamMemberRolePage;
