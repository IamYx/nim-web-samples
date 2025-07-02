import { Button, Card, Form, Input, Radio, Select, Space, Table, Tag, message } from 'antd';
import {
  V2NIMTeam,
  V2NIMTeamMember,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface GetTeamMemberListByIdsFormValues {
  teamId: string;
  teamType: number;
  accountIds: string;
}

const defaultFormValues: GetTeamMemberListByIdsFormValues = {
  teamId: '',
  teamType: 1, // V2NIM_TEAM_TYPE_NORMAL
  accountIds: '',
};

const storageKey = `V2NIMTeamService.getTeamMemberListByIds`;

const GetTeamMemberListByIdsPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 获取群组列表的加载状态
  const [fetchingTeams, setFetchingTeams] = useState(false);
  // 已加入的群组列表
  const [teamList, setTeamList] = useState<V2NIMTeam[]>([]);
  // 群成员列表数据
  const [memberList, setMemberList] = useState<V2NIMTeamMember[]>([]);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): GetTeamMemberListByIdsFormValues => {
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

  // 解析账号ID列表
  const parseAccountIds = (accountIdsStr: string): string[] => {
    if (!accountIdsStr.trim()) {
      return [];
    }

    // 支持多种分隔符：逗号、分号、换行符、空格
    return accountIdsStr
      .split(/[,;，；\n\s]+/)
      .map(id => id.trim())
      .filter(id => id.length > 0);
  };

  // 表单提交: 触发 API 调用
  const handleGetTeamMemberListByIds = async (values: GetTeamMemberListByIdsFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { teamId, teamType, accountIds } = values;

    if (!teamId.trim()) {
      message.error('请输入或选择群组ID');
      return;
    }

    if (!accountIds.trim()) {
      message.error('请输入要查询的账号ID列表');
      return;
    }

    const accountIdList = parseAccountIds(accountIds);

    if (accountIdList.length === 0) {
      message.error('请输入有效的账号ID列表');
      return;
    }

    if (accountIdList.length > 100) {
      message.error('一次最多支持查询100个账号ID');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMTeamService.getTeamMemberListByIds execute, params:', {
      teamId,
      teamType,
      accountIds: accountIdList,
    });

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMTeamService.getTeamMemberListByIds(teamId, teamType, accountIdList)
    );

    if (error) {
      message.error(`根据ID获取群成员列表失败: ${error.toString()}`);
      console.error('根据ID获取群成员列表失败:', error.toString());
      setMemberList([]);
    } else {
      const memberListResult = result || [];
      message.success(
        `根据ID获取群成员列表成功，找到 ${memberListResult.length} 个成员（共查询 ${accountIdList.length} 个ID）`
      );
      console.log('根据ID获取群成员列表成功, 结果:', memberListResult);
      setMemberList(memberListResult);
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
    // 清空成员列表
    setMemberList([]);
    message.success('数据已重置');
  };

  // 刷新群组列表
  const handleRefreshTeams = () => {
    fetchTeamList();
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { teamId, teamType, accountIds } = values;

    if (!teamId.trim()) {
      message.error('请先输入或选择群组ID');
      return;
    }

    if (!accountIds.trim()) {
      message.error('请先输入要查询的账号ID列表');
      return;
    }

    const accountIdList = parseAccountIds(accountIds);

    if (accountIdList.length === 0) {
      message.error('请输入有效的账号ID列表');
      return;
    }

    const callStatement = `await window.nim.V2NIMTeamService.getTeamMemberListByIds("${teamId}", ${teamType}, ${JSON.stringify(accountIdList)});`;

    console.log('V2NIMTeamService.getTeamMemberListByIds 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 格式化时间戳
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
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

  // 获取成员角色颜色
  const getMemberRoleColor = (memberRole: number) => {
    switch (memberRole) {
      case 0:
        return 'default';
      case 1:
        return 'red';
      case 2:
        return 'orange';
      default:
        return 'default';
    }
  };

  // 添加预设账号ID的便捷按钮
  const handleAddPresetAccountIds = (type: 'current' | 'sample') => {
    const currentAccountIds = form.getFieldValue('accountIds') || '';
    let newAccountIds = '';

    if (type === 'current') {
      const currentUserId = window.nim?.V2NIMLoginService.getLoginUser();
      if (currentUserId) {
        newAccountIds = currentAccountIds
          ? `${currentAccountIds}\n${currentUserId}`
          : currentUserId;
      } else {
        message.error('无法获取当前用户ID');
        return;
      }
    } else if (type === 'sample') {
      const sampleIds = 'user001, user002, user003';
      newAccountIds = currentAccountIds ? `${currentAccountIds}\n${sampleIds}` : sampleIds;
    }

    form.setFieldsValue({ accountIds: newAccountIds });
  };

  // 表格列定义
  const columns = [
    {
      title: '账号ID',
      dataIndex: 'accountId',
      key: 'accountId',
      width: '15%',
      render: (accountId: string) => <Tag color="blue">{accountId}</Tag>,
    },
    {
      title: '群昵称',
      dataIndex: 'teamNick',
      key: 'teamNick',
      width: '15%',
      ellipsis: true,
      render: (teamNick?: string) => teamNick || '-',
    },
    {
      title: '成员角色',
      dataIndex: 'memberRole',
      key: 'memberRole',
      width: '10%',
      render: (memberRole: number) => (
        <Tag color={getMemberRoleColor(memberRole)}>{getMemberRoleText(memberRole)}</Tag>
      ),
    },
    {
      title: '在群状态',
      dataIndex: 'inTeam',
      key: 'inTeam',
      width: '8%',
      render: (inTeam: boolean) => (
        <Tag color={inTeam ? 'green' : 'red'}>{inTeam ? '在群中' : '已退群'}</Tag>
      ),
    },
    {
      title: '禁言状态',
      dataIndex: 'chatBanned',
      key: 'chatBanned',
      width: '8%',
      render: (chatBanned: boolean) => (
        <Tag color={chatBanned ? 'red' : 'green'}>{chatBanned ? '禁言' : '正常'}</Tag>
      ),
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: '8%',
      render: (avatar?: string) =>
        avatar ? (
          <img src={avatar} alt="头像" style={{ width: 32, height: 32, borderRadius: '50%' }} />
        ) : (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#999',
            }}
          >
            无
          </div>
        ),
    },
    {
      title: '邀请者',
      dataIndex: 'inviterAccountId',
      key: 'inviterAccountId',
      width: '12%',
      ellipsis: true,
      render: (inviterAccountId?: string) => inviterAccountId || '-',
    },
    {
      title: '加入时间',
      dataIndex: 'joinTime',
      key: 'joinTime',
      width: '12%',
      render: (time?: number) => formatTime(time),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: '12%',
      render: (time?: number) => formatTime(time),
    },
  ];

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleGetTeamMemberListByIds}
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
                {fetchingTeams ? '正在获取...' : `共 ${teamList.length} 个群组`}
              </span>
            </Space>
          </Space>
        </Form.Item>

        <Form.Item
          label="群组ID"
          name="teamId"
          rules={[{ required: true, message: '请输入或选择群组ID' }]}
          tooltip="可以从下拉列表中选择，也可以手动输入群组ID"
        >
          <Select
            placeholder="请输入或选择群组ID"
            showSearch
            allowClear
            onSelect={handleTeamSelect}
            loading={fetchingTeams}
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
          tooltip="必须与要查询的群组类型一致"
        >
          <Radio.Group>
            <Radio value={1}>高级群 (V2NIM_TEAM_TYPE_NORMAL)</Radio>
            <Radio value={2}>超大群 (V2NIM_TEAM_TYPE_SUPER)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="账号ID列表"
          name="accountIds"
          rules={[{ required: true, message: '请输入要查询的账号ID列表' }]}
          tooltip="支持多种分隔符：逗号、分号、换行符、空格。一次最多支持100个ID"
        >
          <Input.TextArea
            placeholder="请输入要查询的账号ID列表，支持多种分隔符&#10;例如：user001, user002; user003&#10;或者每行一个ID"
            rows={4}
            showCount
            maxLength={10000}
          />
        </Form.Item>

        <Form.Item label="便捷操作">
          <Space wrap>
            <Button size="small" onClick={() => handleAddPresetAccountIds('current')}>
              添加当前用户ID
            </Button>
            <Button size="small" onClick={() => handleAddPresetAccountIds('sample')}>
              添加示例ID
            </Button>
            <Button
              size="small"
              onClick={() => {
                const accountIds = form.getFieldValue('accountIds') || '';
                const parsedIds = parseAccountIds(accountIds);
                if (parsedIds.length > 0) {
                  message.info(
                    `解析出 ${parsedIds.length} 个账号ID: ${parsedIds.slice(0, 5).join(', ')}${
                      parsedIds.length > 5 ? '...' : ''
                    }`
                  );
                } else {
                  message.warning('未解析出有效的账号ID');
                }
              }}
            >
              解析预览
            </Button>
          </Space>
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              根据ID获取群成员
            </Button>
            <Button type="default" onClick={handleReset}>
              清空数据
            </Button>
            <Button type="default" onClick={handleOutput}>
              输出调用语句
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 查询结果统计 */}
      {memberList.length > 0 && (
        <Card size="small" style={{ marginTop: 16 }}>
          <Space>
            <Tag color="blue">查询到: {memberList.length} 个成员</Tag>
            <Tag color="green">在群中: {memberList.filter(m => m.inTeam).length} 个</Tag>
            <Tag color="red">已退群: {memberList.filter(m => !m.inTeam).length} 个</Tag>
            <Tag color="orange">被禁言: {memberList.filter(m => m.chatBanned).length} 个</Tag>
          </Space>
        </Card>
      )}

      {/* 群成员列表展示 */}
      {memberList.length > 0 && (
        <Card title={`群成员详情 (${memberList.length} 个成员)`} style={{ marginTop: 16 }}>
          <Table
            columns={columns}
            dataSource={memberList}
            rowKey="accountId"
            pagination={{
              total: memberList.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: total => `共 ${total} 个成员`,
            }}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>此接口用于根据账号ID列表批量获取指定群组的成员信息</li>
          <li>
            <strong>输入格式：</strong>支持多种分隔符（逗号、分号、换行符、空格）
            <ul style={{ marginTop: 4 }}>
              <li>逗号分隔：user001, user002, user003</li>
              <li>分号分隔：user001; user002; user003</li>
              <li>换行分隔：每行一个账号ID</li>
              <li>混合分隔：user001, user002; user003</li>
            </ul>
          </li>
          <li>
            <strong>数量限制：</strong>一次最多支持查询100个账号ID
          </li>
          <li>
            <strong>查询结果：</strong>只返回实际在群中或曾经在群中的成员信息
          </li>
          <li>
            <strong>便捷操作：</strong>
            <ul style={{ marginTop: 4 }}>
              <li>可以使用"添加当前用户ID"快速添加自己的账号</li>
              <li>可以使用"添加示例ID"快速添加测试数据</li>
              <li>可以使用"解析预览"查看将要查询的账号ID列表</li>
            </ul>
          </li>
          <li>适用于精确查询特定成员的群组状态和详细信息</li>
        </ul>
      </Card>

      {/* API 参数说明 */}
      <Card title="API 参数说明" style={{ marginTop: 16 }} size="small">
        <div style={{ marginBottom: 16 }}>
          <h4>基础参数：</h4>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <strong>teamId (string):</strong> 群组ID，必填
            </li>
            <li>
              <strong>teamType (V2NIMTeamType):</strong> 群组类型，必填
              <ul style={{ marginTop: 4 }}>
                <li>1: 高级群 (V2NIM_TEAM_TYPE_NORMAL)</li>
                <li>2: 超大群 (V2NIM_TEAM_TYPE_SUPER)</li>
              </ul>
            </li>
            <li>
              <strong>accountIds (string[]):</strong> 成员的账号ID列表，必填
              <ul style={{ marginTop: 4 }}>
                <li>数组格式，每个元素为字符串类型的账号ID</li>
                <li>一批传入最多支持100个账号ID</li>
                <li>不存在的账号ID会被忽略，不会在结果中返回</li>
              </ul>
            </li>
          </ul>
        </div>

        <div>
          <h4>返回结果：</h4>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <strong>V2NIMTeamMember[]:</strong> 群成员列表数组
            </li>
            <li>只返回实际存在且与群组有关联的成员信息</li>
            <li>不存在的账号ID或从未加入过该群组的账号不会出现在结果中</li>
            <li>已退群的成员信息仍会返回，但 inTeam 字段为 false</li>
          </ul>
        </div>
      </Card>

      {/* 接口对比说明 */}
      <Card title="与 getTeamMemberList 接口对比" style={{ marginTop: 16 }} size="small">
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: '#1890ff' }}>getTeamMemberListByIds (当前接口)</h4>
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              <li>
                <strong>查询方式：</strong>根据指定的账号ID列表查询
              </li>
              <li>
                <strong>查询精度：</strong>精确查询，只返回指定ID的成员
              </li>
              <li>
                <strong>数量限制：</strong>一次最多100个ID
              </li>
              <li>
                <strong>分页支持：</strong>不支持分页，一次返回所有匹配结果
              </li>
              <li>
                <strong>适用场景：</strong>已知具体账号ID，需要获取详细信息
              </li>
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: '#52c41a' }}>getTeamMemberList</h4>
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              <li>
                <strong>查询方式：</strong>按条件分页查询所有成员
              </li>
              <li>
                <strong>查询精度：</strong>支持角色筛选、禁言状态筛选
              </li>
              <li>
                <strong>数量限制：</strong>分页查询，单页建议不超过100
              </li>
              <li>
                <strong>分页支持：</strong>支持分页，可获取完整成员列表
              </li>
              <li>
                <strong>适用场景：</strong>需要遍历或按条件筛选群成员
              </li>
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
          <li>群组ID和群组类型必须准确匹配，否则会查询失败</li>
          <li>
            <strong>一次最多支持查询100个账号ID</strong>，超出会报错
          </li>
          <li>不存在的账号ID或从未加入过该群组的账号不会出现在结果中</li>
          <li>查询结果会受到成员权限限制，某些情况下可能无法获取完整信息</li>
          <li>
            <strong>只能查询自己有权限查看的群组成员信息</strong>
          </li>
          <li>已退群的成员信息仍会返回，注意检查 inTeam 字段</li>
          <li>
            <strong>此接口适合精确查询特定成员，不适合遍历所有成员</strong>
          </li>
          <li>账号ID区分大小写，请确保输入准确</li>
          <li>建议在查询前先验证账号ID的有效性</li>
        </ul>
      </Card>
    </div>
  );
};

export default GetTeamMemberListByIdsPage;
