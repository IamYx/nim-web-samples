import { Button, Card, Form, Input, Radio, Space, message } from 'antd';
import { V2NIMTeam } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface JoinTeamFormValues {
  teamId: string;
  teamType: number;
  postscript: string;
}

const defaultJoinTeamFormValues: JoinTeamFormValues = {
  teamId: '',
  teamType: 1, // 默认高级群
  postscript: '申请加入群组',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMTeamService.applyJoinTeam`;

const JoinTeamPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 申请结果
  const [teamInfo, setTeamInfo] = useState<V2NIMTeam | null>(null);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): JoinTeamFormValues => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return { ...defaultJoinTeamFormValues, ...parsedStored };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return defaultJoinTeamFormValues;
  };

  const initialValues = getInitialValues();

  // 表单提交: 触发 API 调用
  const handleJoinTeam = async (values: JoinTeamFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { teamId, teamType, postscript } = values;
    if (!teamId.trim()) {
      message.error('请输入要加入的群组ID');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMTeamService.applyJoinTeam execute, params:', {
      teamId,
      teamType,
      postscript,
    });

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMTeamService.applyJoinTeam(teamId, teamType, postscript || undefined)
    );

    if (error) {
      message.error(`申请加入群组失败: ${error.toString()}`);
      console.error('申请加入群组失败:', error.toString());
      setTeamInfo(null);
    } else {
      message.success('申请加入群组成功');
      console.log('申请加入群组成功, 结果:', result);
      setTeamInfo(result || null);
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
    form.setFieldsValue(defaultJoinTeamFormValues);
    // 清空群组信息
    setTeamInfo(null);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { teamId, teamType, postscript } = values;

    if (!teamId.trim()) {
      message.error('请先输入要加入的群组ID');
      return;
    }

    const callStatement = postscript
      ? `await window.nim.V2NIMTeamService.applyJoinTeam(${JSON.stringify(teamId)}, ${teamType}, ${JSON.stringify(postscript)});`
      : `await window.nim.V2NIMTeamService.applyJoinTeam(${JSON.stringify(teamId)}, ${teamType});`;

    console.log('V2NIMTeamService.applyJoinTeam 调用语句:');
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

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleJoinTeam}
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
          label="群组ID"
          name="teamId"
          rules={[{ required: true, message: '请输入要加入的群组ID' }]}
        >
          <Input placeholder="请输入要加入的群组ID" />
        </Form.Item>

        <Form.Item
          label="群组类型"
          name="teamType"
          rules={[{ required: true, message: '请选择群组类型' }]}
          tooltip="指定要加入的群组类型"
        >
          <Radio.Group>
            <Radio value={1}>高级群 (V2NIM_TEAM_TYPE_NORMAL)</Radio>
            <Radio value={2}>超大群 (V2NIM_TEAM_TYPE_SUPER)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="申请消息"
          name="postscript"
          tooltip="发送给群主或管理员的申请消息，可选参数"
        >
          <Input.TextArea
            placeholder="请输入申请加入群组的消息"
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              申请加入群组
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

      {/* 申请结果展示 */}
      {teamInfo && (
        <Card title="申请加入群组成功" style={{ marginTop: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <strong>群组ID:</strong> {teamInfo.teamId}
            </div>
            <div>
              <strong>群组名称:</strong> {teamInfo.name}
            </div>
            <div>
              <strong>群组类型:</strong> {getTeamTypeText(teamInfo.teamType)}
            </div>
            <div>
              <strong>群主:</strong> {teamInfo.ownerAccountId}
            </div>
            <div>
              <strong>成员数量:</strong> {teamInfo.memberCount}/{teamInfo.memberLimit}
            </div>
            <div>
              <strong>创建时间:</strong> {formatTime(teamInfo.createTime)}
            </div>
            <div>
              <strong>群组介绍:</strong> {teamInfo.intro || '-'}
            </div>
            <div>
              <strong>群组公告:</strong> {teamInfo.announcement || '-'}
            </div>
          </div>
          {teamInfo.avatar && (
            <div style={{ marginTop: 16 }}>
              <strong>群组头像:</strong>
              <div style={{ marginTop: 8 }}>
                <img
                  src={teamInfo.avatar}
                  alt="群头像"
                  style={{ width: 64, height: 64, borderRadius: '8px' }}
                />
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>群组ID:</strong> 要加入的群组的唯一标识符
          </li>
          <li>
            <strong>群组类型:</strong> 必须与目标群组的实际类型一致
            <ul style={{ marginTop: 4 }}>
              <li>1 - 高级群 (V2NIM_TEAM_TYPE_NORMAL)</li>
              <li>2 - 超大群 (V2NIM_TEAM_TYPE_SUPER)</li>
            </ul>
          </li>
          <li>
            <strong>申请消息:</strong> 发送给群主或管理员的申请消息，可选参数，最多200字符
          </li>
          <li>申请成功后，根据群组的入群模式不同会有不同的结果：</li>
          <li>
            <ul style={{ marginTop: 4 }}>
              <li>
                <strong>自由加入模式:</strong> 直接加入成功，返回群组信息
              </li>
              <li>
                <strong>需要申请模式:</strong> 申请发送成功，等待群主或管理员审核
              </li>
              <li>
                <strong>仅邀请模式:</strong> 无法申请加入，只能通过邀请
              </li>
            </ul>
          </li>
        </ul>
      </Card>

      {/* 操作结果说明 */}
      <Card title="操作结果说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>自由加入模式 (joinMode = 0):</strong>
            <ul style={{ marginTop: 4 }}>
              <li>操作者端：SDK 会抛出 V2NIMTeamListener.onTeamJoined 事件</li>
              <li>其他成员端：SDK 会抛出 V2NIMTeamListener.onTeamMemberJoined 事件</li>
            </ul>
          </li>
          <li>
            <strong>需要申请模式 (joinMode = 1):</strong>
            <ul style={{ marginTop: 4 }}>
              <li>群主或管理员端：SDK 会抛出 V2NIMTeamListener.onReceiveTeamJoinActionInfo 事件</li>
              <li>申请者需要等待群主或管理员的审核结果</li>
            </ul>
          </li>
          <li>
            <strong>仅邀请模式 (joinMode = 2):</strong>
            <ul style={{ marginTop: 4 }}>
              <li>无法通过申请加入，操作会失败</li>
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
            <strong>申请加入群组前请确保群组ID存在且有效</strong>
          </li>
          <li>群组类型参数必须与目标群组的实际类型一致，否则会申请失败</li>
          <li>不同的群组入群模式会影响申请的结果和流程</li>
          <li>
            <strong>建议先通过 V2NIMTeamService.getTeamInfoByIds 获取群组信息验证群组存在</strong>
          </li>
          <li>申请操作会触发相应的事件回调，请注意监听相关事件</li>
          <li>如果群组设置为"仅邀请"模式，申请加入会失败</li>
        </ul>
      </Card>
    </div>
  );
};

export default JoinTeamPage;
