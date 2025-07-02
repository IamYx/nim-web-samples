import { Button, Card, Form, Input, Radio, Space, Table, Tag, message } from 'antd';
import { V2NIMTeam } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface GetTeamInfoByIdsFormValues {
  teamIds: string;
  teamType: number;
}

const defaultFormValues: GetTeamInfoByIdsFormValues = {
  teamIds: '',
  teamType: 1, // 默认高级群
};

const storageKey = `V2NIMTeamService.getTeamInfoByIds`;

const GetTeamInfoByIdsPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 群组列表数据
  const [teamList, setTeamList] = useState<V2NIMTeam[]>([]);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): GetTeamInfoByIdsFormValues => {
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

  // 表单提交: 触发 API 调用
  const handleGetTeamInfoByIds = async (values: GetTeamInfoByIdsFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    // 验证 teamIds 输入
    if (!values.teamIds.trim()) {
      message.error('请输入群组ID');
      return;
    }

    setLoading(true);

    const { teamIds, teamType } = values;
    // 将输入的字符串转换为字符串数组
    const teamIdArray = teamIds
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    if (teamIdArray.length === 0) {
      message.error('请输入有效的群组ID');
      setLoading(false);
      return;
    }

    if (teamIdArray.length > 100) {
      message.error('每次最多查询100个群组ID');
      setLoading(false);
      return;
    }

    // 打印 API 入参
    console.log('API V2NIMTeamService.getTeamInfoByIds execute, params:', {
      teamIds: teamIdArray,
      teamType,
    });

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMTeamService.getTeamInfoByIds(teamIdArray, teamType)
    );

    if (error) {
      message.error(`根据ID获取群组信息失败: ${error.toString()}`);
      console.error('根据ID获取群组信息失败:', error.toString());
      setTeamList([]);
    } else {
      message.success(`根据ID获取群组信息成功，共找到 ${result?.length || 0} 个群组`);
      console.log('根据ID获取群组信息成功, 结果:', result);
      setTeamList(result || []);
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
    // 清空群组列表
    setTeamList([]);
    message.success('数据已重置');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { teamIds, teamType } = values;
    const teamIdArray = teamIds
      .split(',')
      .map((id: string) => id.trim())
      .filter((id: string) => id.length > 0);

    const callStatement = `await window.nim.V2NIMTeamService.getTeamInfoByIds(${JSON.stringify(teamIdArray)}, ${teamType});`;

    console.log('V2NIMTeamService.getTeamInfoByIds 调用语句:');
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

  // 获取模式显示文本
  const getModeText = (
    mode: number,
    type: 'join' | 'agree' | 'invite' | 'updateInfo' | 'updateExtension' | 'chatBanned'
  ) => {
    switch (type) {
      case 'join':
        return mode === 0 ? '自由加入' : mode === 1 ? '需申请' : '仅邀请';
      case 'agree':
        return mode === 0 ? '需要同意' : '不需要同意';
      case 'invite':
        return mode === 0 ? '所有人' : '仅管理员';
      case 'updateInfo':
        return mode === 0 ? '所有人' : '仅管理员';
      case 'updateExtension':
        return mode === 0 ? '所有人' : '仅管理员';
      case 'chatBanned':
        return mode === 0 ? '不禁言' : '全员禁言';
      default:
        return String(mode);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '群组ID',
      dataIndex: 'teamId',
      key: 'teamId',
      width: '12%',
      render: (teamId: string) => <Tag color="blue">{teamId}</Tag>,
    },
    {
      title: '群组名称',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
      ellipsis: true,
    },
    {
      title: '群组类型',
      dataIndex: 'teamType',
      key: 'teamType',
      width: '8%',
      render: (teamType: number) => (
        <Tag color={teamType === 1 ? 'green' : 'orange'}>{getTeamTypeText(teamType)}</Tag>
      ),
    },
    {
      title: '群主',
      dataIndex: 'ownerAccountId',
      key: 'ownerAccountId',
      width: '10%',
      ellipsis: true,
    },
    {
      title: '人数',
      key: 'memberInfo',
      width: '8%',
      render: (_: any, record: V2NIMTeam) => `${record.memberCount}/${record.memberLimit}`,
    },
    {
      title: '群组头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: '8%',
      render: (avatar?: string) =>
        avatar ? (
          <img src={avatar} alt="群头像" style={{ width: 32, height: 32, borderRadius: '50%' }} />
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
      title: '介绍',
      dataIndex: 'intro',
      key: 'intro',
      width: '12%',
      ellipsis: true,
      render: (intro?: string) => intro || '-',
    },
    {
      title: '公告',
      dataIndex: 'announcement',
      key: 'announcement',
      width: '12%',
      ellipsis: true,
      render: (announcement?: string) => announcement || '-',
    },
    {
      title: '入群模式',
      dataIndex: 'joinMode',
      key: 'joinMode',
      width: '8%',
      render: (joinMode: number) => (
        <Tag color="cyan" style={{ fontSize: '10px' }}>
          {getModeText(joinMode, 'join')}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: '12%',
      render: (time?: number) => formatTime(time),
    },
    {
      title: '有效性',
      dataIndex: 'isValidTeam',
      key: 'isValidTeam',
      width: '8%',
      render: (isValid: boolean) => (
        <Tag color={isValid ? 'green' : 'red'}>{isValid ? '有效' : '无效'}</Tag>
      ),
    },
  ];

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleGetTeamInfoByIds}
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
          label="群组ID列表"
          name="teamIds"
          rules={[{ required: true, message: '请输入群组ID' }]}
          tooltip="多个群组ID用英文逗号分隔，每次最多100个群组ID"
        >
          <Input.TextArea
            placeholder="请输入群组ID，多个ID用英文逗号分隔，例如：123456,789012,456789"
            rows={3}
            showCount
            maxLength={2000}
          />
        </Form.Item>

        <Form.Item
          label="群组类型"
          name="teamType"
          rules={[{ required: true, message: '请选择群组类型' }]}
          tooltip="指定要查询的群组类型"
        >
          <Radio.Group>
            <Radio value={1}>高级群 (V2NIM_TEAM_TYPE_NORMAL)</Radio>
            <Radio value={2}>超大群 (V2NIM_TEAM_TYPE_SUPER)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              根据ID获取群组信息
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

      {/* 群组列表展示 */}
      {teamList.length > 0 && (
        <Card title={`群组信息列表 (共 ${teamList.length} 个群组)`} style={{ marginTop: 24 }}>
          <Table
            columns={columns}
            dataSource={teamList}
            rowKey="teamId"
            pagination={{
              total: teamList.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: total => `共 ${total} 个群组`,
            }}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>此接口用于根据群组ID列表获取群组信息</li>
          <li>每次最多可查询100个群组ID</li>
          <li>先查本地数据，本地缺失再查询云端</li>
          <li>返回的数据是数组形式的 V2NIMTeam 对象列表</li>
          <li>需要指定群组类型参数，只返回对应类型的群组信息</li>
          <li>如果群组不存在或无权限访问，该群组不会出现在结果中</li>
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
            <strong>此接口采用混合查询策略：先查本地数据，本地缺失再查询云端</strong>
          </li>
          <li>每次最多支持查询100个群组ID，超出限制会返回错误</li>
          <li>只返回指定类型且有权限访问的群组信息</li>
          <li>不存在的群组ID或无权限访问的群组不会出现在结果中</li>
          <li>建议在调用前确保已完成数据同步，以获得更准确的本地数据</li>
        </ul>
      </Card>

      {/* 数据结构说明 */}
      <Card title="V2NIMTeam 数据结构说明" style={{ marginTop: 16 }} size="small">
        <div style={{ marginBottom: 16 }}>
          <h4>基础字段：</h4>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <strong>teamId:</strong> 群组ID，唯一标识
            </li>
            <li>
              <strong>teamType:</strong> 群组类型（1-高级群, 2-超大群）
            </li>
            <li>
              <strong>name:</strong> 群组名称
            </li>
            <li>
              <strong>ownerAccountId:</strong> 群主账号ID
            </li>
            <li>
              <strong>memberLimit:</strong> 群组人数上限
            </li>
            <li>
              <strong>memberCount:</strong> 群组当前人数
            </li>
            <li>
              <strong>createTime/updateTime:</strong> 创建和更新时间
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4>描述信息：</h4>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <strong>intro:</strong> 群组介绍，最多255个字符
            </li>
            <li>
              <strong>announcement:</strong> 群组公告，最多5000个字符
            </li>
            <li>
              <strong>avatar:</strong> 群组头像URL
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4>权限设置：</h4>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <strong>joinMode:</strong> 申请入群模式（0-自由加入, 1-需申请, 2-仅邀请）
            </li>
            <li>
              <strong>agreeMode:</strong> 被邀请人同意模式（0-需要同意, 1-不需要同意）
            </li>
            <li>
              <strong>inviteMode:</strong> 邀请入群模式（0-所有人, 1-仅管理员）
            </li>
            <li>
              <strong>updateInfoMode:</strong> 群信息修改模式（0-所有人, 1-仅管理员）
            </li>
            <li>
              <strong>chatBannedMode:</strong> 群禁言模式（0-不禁言, 1-全员禁言）
            </li>
          </ul>
        </div>

        <div>
          <h4>扩展字段：</h4>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <strong>serverExtension:</strong> 服务端扩展字段
            </li>
            <li>
              <strong>customerExtension:</strong> 客户端扩展字段
            </li>
            <li>
              <strong>isValidTeam:</strong> 是否为有效群组（计算字段）
            </li>
            <li>
              <strong>messageNotifyMode:</strong> 群消息提醒模式（计算字段）
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default GetTeamInfoByIdsPage;
