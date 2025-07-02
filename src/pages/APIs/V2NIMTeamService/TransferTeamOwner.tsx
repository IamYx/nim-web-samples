import { Button, Card, Form, Radio, Select, Space, Switch, Tag, message } from 'antd';
import {
  V2NIMTeam,
  V2NIMTeamMember,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface TransferTeamOwnerFormValues {
  teamId: string;
  teamType: number;
  accountId: string;
  leave: boolean;
}

const defaultTransferTeamOwnerFormValues: TransferTeamOwnerFormValues = {
  teamId: '',
  teamType: 1, // V2NIM_TEAM_TYPE_NORMAL - 高级群
  accountId: '',
  leave: false, // 默认不退出群组
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMTeamService.transferTeamOwner`;

const TransferTeamOwnerPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 获取群组列表的加载状态
  const [fetchingTeams, setFetchingTeams] = useState(false);
  // 群成员列表加载状态
  const [memberListLoading, setMemberListLoading] = useState(false);
  // 已加入的群组列表（只显示当前用户是群主的群组）
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
        return { ...defaultTransferTeamOwnerFormValues, ...parsedValues };
      } catch (error) {
        console.error('解析存储的表单数据失败:', error);
        return defaultTransferTeamOwnerFormValues;
      }
    }
    return defaultTransferTeamOwnerFormValues;
  };

  const initialValues = getInitialValues();

  // 获取已加入的群组列表（只显示当前用户是群主的群组）
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
      // 只显示有效的群组，并且当前用户是群主的群组（因为只有群主才能转让群主）
      const validTeams = (result || []).filter(
        (team: V2NIMTeam) =>
          team.isValidTeam && team.ownerAccountId === window.nim?.V2NIMLoginService.getLoginUser()
      );
      setTeamList(validTeams);

      if (validTeams.length === 0) {
        message.info('暂无可管理的群组（只有群主才能转让群主）');
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
      accountId: '',
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
        accountId: '', // 清空已选择的成员
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
  const handleTransferTeamOwner = async (values: TransferTeamOwnerFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { teamId, teamType, accountId, leave } = values;

    if (!teamId.trim()) {
      message.error('请选择群组');
      return;
    }

    if (!accountId.trim()) {
      message.error('请选择新群主');
      return;
    }

    // 检查是否转让给自己
    const currentUserId = window.nim?.V2NIMLoginService.getLoginUser();
    if (accountId === currentUserId) {
      message.error('不能转让群主给自己');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMTeamService.transferTeamOwner execute, params:', {
      teamId,
      teamType,
      accountId,
      leave,
    });

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMTeamService.transferTeamOwner(teamId, teamType, accountId, leave)
    );

    if (error) {
      message.error(`转让群主失败: ${error.toString()}`);
      console.error('转让群主失败:', error.toString());
    } else {
      message.success('转让群主成功');
      console.log('转让群主成功');
      // 如果选择了同时退出群组，则清空相关数据
      if (leave) {
        message.info('您已退出该群组');
        fetchTeamList(); // 重新获取群组列表
      }
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
    form.setFieldsValue(defaultTransferTeamOwnerFormValues);
    setTeamMemberList([]);
    message.success('表单已重置为默认值');
  };

  // 刷新群组列表
  const handleRefreshTeams = () => {
    fetchTeamList();
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { teamId, teamType, accountId, leave } = values;

    if (!teamId.trim()) {
      message.error('请先选择群组');
      return;
    }

    if (!accountId.trim()) {
      message.error('请先选择新群主');
      return;
    }

    const callStatement = `await window.nim.V2NIMTeamService.transferTeamOwner("${teamId}", ${teamType}, "${accountId}", ${leave});`;

    console.log('V2NIMTeamService.transferTeamOwner 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
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

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleTransferTeamOwner}
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
          rules={[{ required: true, message: '请选择要转让群主的群组' }]}
        >
          <Select
            placeholder="请选择要转让群主的群组"
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
          label="选择新群主"
          name="accountId"
          rules={[{ required: true, message: '请选择新的群主' }]}
          tooltip="支持从成员列表中选择，也可以手动输入账号ID"
        >
          <Select
            placeholder="请选择新的群主"
            loading={memberListLoading}
            showSearch
            optionFilterProp="children"
            allowClear
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
              .filter(
                member =>
                  member.inTeam &&
                  member.memberRole !== 1 &&
                  member.accountId !== window.nim?.V2NIMLoginService.getLoginUser()
              ) // 只显示在群中的成员，排除群主和当前用户
              .map(member => (
                <Select.Option key={member.accountId} value={member.accountId}>
                  {getMemberDisplayName(member)}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="转让后退出"
          name="leave"
          valuePropName="checked"
          tooltip="转让群主后，是否同时退出该群组"
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              转让群主
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
            <strong>选择群组:</strong> 从已加入的群组列表中选择要转让群主的群组（只有群主才能转让）
          </li>
          <li>
            <strong>选择新群主:</strong> 要转让群主权限的群成员
            <ul style={{ marginTop: 4 }}>
              <li>支持从群成员列表中选择成员</li>
              <li>也可以手动输入账号ID</li>
              <li>成员列表会显示群昵称、账号ID和身份</li>
              <li>只显示当前在群中的成员（排除群主和当前用户）</li>
              <li>不能转让给自己</li>
            </ul>
          </li>
          <li>
            <strong>权限要求:</strong> 只有群主才能转让群主权限
          </li>
          <li>
            <strong>转让后退出:</strong> 可选择转让群主后是否同时退出该群组
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
          <li>选择群组后会自动加载该群组的成员列表</li>
          <li>可以点击"刷新群组列表"按钮获取最新的群组信息</li>
          <li>可以点击"刷新成员列表"按钮获取最新的成员信息</li>
          <li>支持按成员昵称或账号ID搜索成员</li>
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
                <strong>如果选择了转让后退出 (leave = true):</strong>
                <ul style={{ marginTop: 4 }}>
                  <li>
                    <strong>操作者端:</strong> SDK 会抛出 V2NIMTeamListener.onTeamLeft 事件
                  </li>
                  <li>
                    <strong>其他成员端:</strong> SDK 会抛出 V2NIMTeamListener.onTeamMemberLeft 事件
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li>转让成功后，新群主将立即获得群主权限</li>
          <li>原群主将失去群主权限，变为普通成员（如果没有选择退出）</li>
          <li>如果选择了转让后退出，原群主将离开群组</li>
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
            <strong>accountId (string):</strong> 新群主的账号ID，不能为空且不能是自己
          </li>
          <li>
            <strong>leave (boolean):</strong> 转让群主后是否同时退出该群，默认为 false
          </li>
        </ul>
      </Card>

      {/* 群主权限说明 */}
      <Card title="群主权限说明" style={{ marginTop: 16 }} size="small">
        <div style={{ margin: 0 }}>
          <div style={{ marginBottom: 12 }}>
            <strong>
              群主权限 <Tag color="red">群主</Tag>:
            </strong>
            <ul style={{ marginTop: 4, paddingLeft: 20 }}>
              <li>拥有所有群组管理权限</li>
              <li>设置和移除管理员</li>
              <li>转让群主身份</li>
              <li>解散群组</li>
              <li>踢出任何成员（包括管理员）</li>
              <li>修改群信息（如群名称、群介绍等）</li>
              <li>邀请新成员加入</li>
              <li>审批入群申请</li>
              <li>禁言和解禁成员</li>
            </ul>
          </div>
          <div style={{ color: '#cf1322' }}>
            <strong>⚠️ 注意事项：</strong>
            <ul style={{ marginTop: 4, paddingLeft: 20 }}>
              <li>群主权限转让后无法撤销，请谨慎操作</li>
              <li>建议选择信任的群成员作为新群主</li>
              <li>转让后如果选择不退出群组，您将变为普通成员</li>
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
            <strong>不能转让群主给自己</strong>
          </li>
          <li>
            <strong>群主转让后无法撤销，请谨慎操作</strong>
          </li>
          <li>确保新群主确实存在于指定群组中</li>
          <li>建议选择信任的群成员作为新群主</li>
          <li>转让成功会触发相关事件，请注意监听相关事件</li>
          <li>
            <strong>建议配合 V2NIMTeamService.on 监听群组事件获取实时通知</strong>
          </li>
          <li>如果选择转让后退出，您将离开该群组且无法自动重新加入</li>
          <li>
            <strong>转让群主是不可逆操作，请确认后再执行</strong>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default TransferTeamOwnerPage;
