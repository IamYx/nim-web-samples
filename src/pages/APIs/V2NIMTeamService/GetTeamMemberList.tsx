import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from 'antd';
import {
  V2NIMTeam,
  V2NIMTeamMember,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface GetTeamMemberListFormValues {
  teamId: string;
  teamType: number;
  roleQueryType: number;
  onlyChatBanned: boolean;
  direction: number;
  limit: number;
  nextToken: string;
}

const defaultFormValues: GetTeamMemberListFormValues = {
  teamId: '',
  teamType: 1, // V2NIM_TEAM_TYPE_NORMAL
  roleQueryType: 0, // V2NIM_TEAM_MEMBER_ROLE_QUERY_TYPE_ALL
  onlyChatBanned: false,
  direction: 1, // V2NIM_QUERY_DIRECTION_DESC
  limit: 20,
  nextToken: '',
};

const storageKey = `V2NIMTeamService.getTeamMemberList`;

const GetTeamMemberListPage = () => {
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
  // 分页信息
  const [pageInfo, setPageInfo] = useState<{
    nextToken: string;
    finished: boolean;
  }>({
    nextToken: '',
    finished: true,
  });
  // 总计数据
  const [totalCount, setTotalCount] = useState(0);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): GetTeamMemberListFormValues => {
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

  // 表单提交: 触发 API 调用
  const handleGetTeamMemberList = async (values: GetTeamMemberListFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { teamId, teamType, roleQueryType, onlyChatBanned, direction, limit, nextToken } = values;

    if (!teamId.trim()) {
      message.error('请输入或选择群组ID');
      return;
    }

    setLoading(true);

    // 构建查询选项
    const queryOption = {
      roleQueryType,
      onlyChatBanned,
      direction,
      limit,
      nextToken: nextToken.trim(),
    };

    // 打印 API 入参
    console.log('API V2NIMTeamService.getTeamMemberList execute, params:', {
      teamId,
      teamType,
      queryOption,
    });

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMTeamService.getTeamMemberList(teamId, teamType, queryOption)
    );

    if (error) {
      message.error(`获取群成员列表失败: ${error.toString()}`);
      console.error('获取群成员列表失败:', error.toString());
      setMemberList([]);
      setPageInfo({ nextToken: '', finished: true });
      setTotalCount(0);
    } else {
      const memberListResult = result;
      message.success(
        `获取群成员列表成功，当前页 ${memberListResult?.memberList?.length || 0} 个成员`
      );
      console.log('获取群成员列表成功, 结果:', memberListResult);
      setMemberList(memberListResult?.memberList || []);
      setPageInfo({
        nextToken: memberListResult?.nextToken || '',
        finished: memberListResult?.finished || true,
      });
      setTotalCount((memberListResult?.memberList?.length || 0) + (totalCount || 0));
    }

    setLoading(false);
    // 存储最终执行的参数
    localStorage.setItem(storageKey, JSON.stringify(values));
  };

  // 加载下一页
  const handleLoadNext = () => {
    if (pageInfo.finished) {
      message.info('已经是最后一页了');
      return;
    }

    const currentValues = form.getFieldsValue();
    form.setFieldsValue({
      ...currentValues,
      nextToken: pageInfo.nextToken,
    });
    handleGetTeamMemberList({
      ...currentValues,
      nextToken: pageInfo.nextToken,
    });
  };

  // 重置表单到默认值
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 重置表单为默认值
    form.setFieldsValue(defaultFormValues);
    // 清空成员列表
    setMemberList([]);
    setPageInfo({ nextToken: '', finished: true });
    setTotalCount(0);
    message.success('数据已重置');
  };

  // 刷新群组列表
  const handleRefreshTeams = () => {
    fetchTeamList();
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { teamId, teamType, roleQueryType, onlyChatBanned, direction, limit, nextToken } = values;

    if (!teamId.trim()) {
      message.error('请先输入或选择群组ID');
      return;
    }

    const queryOption = {
      roleQueryType,
      onlyChatBanned,
      direction,
      limit,
      nextToken: nextToken.trim(),
    };

    const callStatement = `await window.nim.V2NIMTeamService.getTeamMemberList("${teamId}", ${teamType}, ${JSON.stringify(queryOption)});`;

    console.log('V2NIMTeamService.getTeamMemberList 调用语句:');
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

  // 角色查询类型选项
  const roleQueryTypeOptions = [
    { label: '所有成员', value: 0 },
    { label: '普通成员', value: 1 },
    { label: '管理员(包括群主)', value: 2 },
  ];

  // 查询方向选项
  const directionOptions = [
    { label: '升序', value: 0 },
    { label: '降序', value: 1 },
  ];

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
        onFinish={handleGetTeamMemberList}
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
          label="角色查询类型"
          name="roleQueryType"
          rules={[{ required: true, message: '请选择角色查询类型' }]}
          tooltip="选择要查询的成员角色类型"
        >
          <Radio.Group options={roleQueryTypeOptions} />
        </Form.Item>

        <Form.Item
          label="仅禁言成员"
          name="onlyChatBanned"
          valuePropName="checked"
          tooltip="是否只返回聊天禁言成员列表"
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>

        <Form.Item
          label="查询方向"
          name="direction"
          rules={[{ required: true, message: '请选择查询方向' }]}
          tooltip="查询结果的排序方向"
        >
          <Radio.Group options={directionOptions} />
        </Form.Item>

        <Form.Item
          label="分页数量"
          name="limit"
          rules={[
            { required: true, message: '请输入分页数量' },
            { type: 'number', min: 1, max: 100, message: '分页数量必须在1-100之间' },
          ]}
          tooltip="单页返回的成员数量，建议不超过100"
        >
          <InputNumber min={1} max={100} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="分页Token"
          name="nextToken"
          tooltip="分页偏移量，首次查询传空字符串，后续使用上一次返回的nextToken"
        >
          <Input placeholder="首次查询请留空，后续查询使用上一次返回的nextToken" />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              获取群成员列表
            </Button>
            <Button type="default" onClick={handleLoadNext} disabled={pageInfo.finished || loading}>
              加载下一页
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

      {/* 分页信息 */}
      {memberList.length > 0 && (
        <Card size="small" style={{ marginTop: 16 }}>
          <Space>
            <Tag color="blue">当前页: {memberList.length} 个成员</Tag>
            <Tag color={pageInfo.finished ? 'green' : 'orange'}>
              {pageInfo.finished ? '已加载完毕' : '还有更多数据'}
            </Tag>
            {!pageInfo.finished && <Tag color="purple">NextToken: {pageInfo.nextToken}</Tag>}
          </Space>
        </Card>
      )}

      {/* 群成员列表展示 */}
      {memberList.length > 0 && (
        <Card title={`群成员列表 (当前页 ${memberList.length} 个成员)`} style={{ marginTop: 16 }}>
          <Table
            columns={columns}
            dataSource={memberList}
            rowKey="accountId"
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>此接口用于分页获取指定群组的成员列表</li>
          <li>支持按成员角色类型筛选（所有成员、普通成员、管理员）</li>
          <li>支持只获取被禁言的成员列表</li>
          <li>支持设置查询方向（升序/降序）和分页大小</li>
          <li>首次查询时 nextToken 传空字符串，后续分页使用返回的 nextToken</li>
          <li>分页大小建议不超过100，避免单次请求数据过多</li>
          <li>返回结果包含成员的详细信息，如角色、禁言状态、加入时间等</li>
          <li>可以使用"加载下一页"按钮继续获取后续数据</li>
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
          </ul>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4>查询选项 (V2NIMTeamMemberQueryOption)：</h4>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <strong>roleQueryType (V2NIMTeamMemberRoleQueryType):</strong> 成员角色查询类型
              <ul style={{ marginTop: 4 }}>
                <li>0: 所有成员 (V2NIM_TEAM_MEMBER_ROLE_QUERY_TYPE_ALL)</li>
                <li>1: 普通成员 (V2NIM_TEAM_MEMBER_ROLE_QUERY_TYPE_NORMAL)</li>
                <li>2: 管理员(包括群主) (V2NIM_TEAM_MEMBER_ROLE_QUERY_TYPE_MANAGER)</li>
              </ul>
            </li>
            <li>
              <strong>onlyChatBanned (boolean):</strong> 是否只返回聊天禁言成员列表，默认 false
            </li>
            <li>
              <strong>direction (V2NIMQueryDirection):</strong> 查询方向
              <ul style={{ marginTop: 4 }}>
                <li>0: 升序 (V2NIM_QUERY_DIRECTION_ASC)</li>
                <li>1: 降序 (V2NIM_QUERY_DIRECTION_DESC)</li>
              </ul>
            </li>
            <li>
              <strong>limit (number):</strong> 分页拉取数量，建议不超过100
            </li>
            <li>
              <strong>nextToken (string):</strong> 分页偏移量，首次传空字符串
            </li>
          </ul>
        </div>

        <div>
          <h4>返回结果 (V2NIMTeamMemberListResult)：</h4>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <strong>memberList (V2NIMTeamMember[]):</strong> 成员列表
            </li>
            <li>
              <strong>nextToken (string):</strong> 下一页的分页标记
            </li>
            <li>
              <strong>finished (boolean):</strong> 是否已获取完所有数据
            </li>
          </ul>
        </div>
      </Card>

      {/* V2NIMTeamMember 数据结构说明 */}
      <Card title="V2NIMTeamMember 数据结构说明" style={{ marginTop: 16 }} size="small">
        <div style={{ marginBottom: 16 }}>
          <h4>基础字段：</h4>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <strong>accountId:</strong> 成员账号ID
            </li>
            <li>
              <strong>teamId:</strong> 群组ID
            </li>
            <li>
              <strong>teamNick:</strong> 群昵称
            </li>
            <li>
              <strong>memberRole:</strong> 成员角色（0-普通成员, 1-群主, 2-管理员）
            </li>
            <li>
              <strong>inTeam:</strong> 是否在群中
            </li>
            <li>
              <strong>chatBanned:</strong> 是否被禁言
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4>时间字段：</h4>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <strong>joinTime:</strong> 加入群组时间
            </li>
            <li>
              <strong>updateTime:</strong> 信息更新时间
            </li>
          </ul>
        </div>

        <div>
          <h4>其他字段：</h4>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <strong>inviterAccountId:</strong> 邀请者账号ID
            </li>
            <li>
              <strong>avatar:</strong> 成员头像URL
            </li>
            <li>
              <strong>serverExtension:</strong> 服务端扩展字段
            </li>
            <li>
              <strong>customerExtension:</strong> 客户端扩展字段
            </li>
          </ul>
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
          <li>分页大小建议不超过100，避免单次请求数据过多影响性能</li>
          <li>首次查询时 nextToken 必须传空字符串，后续分页使用返回的 nextToken</li>
          <li>查询结果会受到成员权限限制，某些情况下可能无法获取完整信息</li>
          <li>
            <strong>只能查询自己有权限查看的群组成员信息</strong>
          </li>
          <li>成员列表会根据实际的成员变动进行实时更新</li>
          <li>大群的成员数量可能很多，建议合理设置分页大小</li>
        </ul>
      </Card>
    </div>
  );
};

export default GetTeamMemberListPage;
