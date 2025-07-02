import { Button, Card, Form, Input, Radio, Space, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface ApplyJoinTeamFormValues {
  teamId: string;
  teamType: number;
  postscript: string;
}

const defaultApplyJoinTeamFormValues: ApplyJoinTeamFormValues = {
  teamId: '',
  teamType: 1, // 默认高级群
  postscript: '',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMTeamService.applyJoinTeam`;

const ApplyJoinTeamPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = () => {
    const storedValues = localStorage.getItem(storageKey);
    if (storedValues) {
      try {
        return JSON.parse(storedValues);
      } catch (error) {
        console.error('解析 localStorage 中的数据失败:', error);
      }
    }
    return defaultApplyJoinTeamFormValues;
  };

  const initialValues = getInitialValues();

  // 表单提交: 触发 API 调用
  const handleApplyJoinTeam = async (values: ApplyJoinTeamFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { teamId, teamType, postscript } = values;

    if (!teamId) {
      message.error('请输入群组ID');
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
      window.nim?.V2NIMTeamService.applyJoinTeam(teamId, teamType, postscript)
    );

    if (error) {
      message.error(`申请加入群组失败: ${error.toString()}`);
      console.error('申请加入群组失败:', error.toString());
    } else {
      message.success('申请加入群组成功');
      console.log('申请加入群组成功, 结果:', result);
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
    form.setFieldsValue(defaultApplyJoinTeamFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { teamId, teamType, postscript } = values;

    if (!teamId) {
      message.error('请先输入群组ID');
      return;
    }

    const callStatement = `await window.nim.V2NIMTeamService.applyJoinTeam(${JSON.stringify(teamId)}, ${teamType}, ${JSON.stringify(postscript || '')});`;

    console.log('V2NIMTeamService.applyJoinTeam 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleApplyJoinTeam}
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
          tooltip="要申请加入的群组的唯一标识符"
        >
          <Input placeholder="请输入群组ID" />
        </Form.Item>

        <Form.Item
          label="群组类型"
          name="teamType"
          rules={[{ required: true, message: '请选择群组类型' }]}
          tooltip="必须与要加入的群组的实际类型一致"
        >
          <Radio.Group>
            <Radio value={1}>高级群 (V2NIM_TEAM_TYPE_NORMAL)</Radio>
            <Radio value={2}>超大群 (V2NIM_TEAM_TYPE_SUPER)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="申请附言" name="postscript" tooltip="申请加入群组的理由或说明，可选">
          <Input.TextArea
            placeholder="请输入申请加入群组的理由（可选）"
            rows={4}
            maxLength={500}
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

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>群组ID:</strong> 输入要申请加入的群组的唯一标识符
          </li>
          <li>
            <strong>群组类型:</strong> 必须与目标群组的实际类型一致
            <ul style={{ marginTop: 4 }}>
              <li>1 - 高级群 (V2NIM_TEAM_TYPE_NORMAL)</li>
              <li>2 - 超大群 (V2NIM_TEAM_TYPE_SUPER)</li>
            </ul>
          </li>
          <li>
            <strong>申请附言:</strong> 可选，向群主或管理员说明申请加入的理由
          </li>
          <li>操作结果取决于群组的加入模式设置</li>
          <li>如果群组允许自由加入，申请会立即成功</li>
          <li>如果需要群主或管理员同意，申请会发送给相关人员审核</li>
        </ul>
      </Card>

      {/* 操作结果说明 */}
      <Card title="操作结果说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>返回值:</strong> 成功时返回群组信息 (V2NIMTeam)
          </li>
          <li>
            <strong>根据群组的加入模式 (joinMode) 不同，触发的事件也不同:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>
                <strong>自由加入模式:</strong>
                <ul style={{ marginTop: 4 }}>
                  <li>操作者端: SDK 会抛出 V2NIMTeamListener.onTeamJoined 事件</li>
                  <li>其他成员端: SDK 会抛出 V2NIMTeamListener.onTeamMemberJoined 事件</li>
                  <li>申请者立即成为群组成员</li>
                </ul>
              </li>
              <li>
                <strong>需要群主或管理员同意:</strong>
                <ul style={{ marginTop: 4 }}>
                  <li>
                    群主或管理员端: SDK 会抛出 V2NIMTeamListener.onReceiveTeamJoinActionInfo 事件
                  </li>
                  <li>申请者需要等待审核，审核通过后才能加入群组</li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </Card>

      {/* 群组加入模式说明 */}
      <Card title="群组加入模式说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>自由加入 (V2NIM_TEAM_JOIN_MODE_FREE):</strong>
            <ul style={{ marginTop: 4 }}>
              <li>任何人都可以直接加入群组</li>
              <li>申请会立即成功，无需等待审核</li>
              <li>适用于开放性的讨论群组</li>
            </ul>
          </li>
          <li>
            <strong>需要验证 (V2NIM_TEAM_JOIN_MODE_APPLY):</strong>
            <ul style={{ marginTop: 4 }}>
              <li>需要群主或管理员同意才能加入</li>
              <li>申请会发送给群主和管理员</li>
              <li>等待审核期间，申请者不是群组成员</li>
              <li>适用于需要管控成员的群组</li>
            </ul>
          </li>
          <li>
            <strong>拒绝任何人加入 (V2NIM_TEAM_JOIN_MODE_REJECT_ALL):</strong>
            <ul style={{ marginTop: 4 }}>
              <li>不允许任何人申请加入</li>
              <li>只能通过邀请的方式加入群组</li>
              <li>申请会直接失败</li>
            </ul>
          </li>
        </ul>
      </Card>

      {/* API 参数说明 */}
      <Card title="API 参数说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>teamId (string):</strong> 群组ID
            <ul style={{ marginTop: 4 }}>
              <li>必填参数，群组的唯一标识符</li>
              <li>可以通过群组信息或其他渠道获取</li>
            </ul>
          </li>
          <li>
            <strong>teamType (V2NIMTeamType):</strong> 群组类型
            <ul style={{ marginTop: 4 }}>
              <li>必填参数，必须与目标群组的实际类型一致</li>
              <li>1 - V2NIM_TEAM_TYPE_NORMAL (高级群)</li>
              <li>2 - V2NIM_TEAM_TYPE_SUPER (超大群)</li>
            </ul>
          </li>
          <li>
            <strong>postscript (string):</strong> 申请附言
            <ul style={{ marginTop: 4 }}>
              <li>可选参数，向群主或管理员说明申请理由</li>
              <li>在需要审核的群组中特别有用</li>
              <li>最多500个字符</li>
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
            <strong>群组ID必须是有效且存在的群组标识符</strong>
          </li>
          <li>操作结果取决于群组的加入模式设置</li>
          <li>如果群组设置为拒绝任何人加入，申请会直接失败</li>
          <li>
            <strong>建议在申请前了解群组的加入模式和要求</strong>
          </li>
          <li>申请加入群组会触发相应的事件回调，请注意监听相关事件</li>
          <li>重复申请加入已经是成员的群组会失败</li>
          <li>
            <strong>建议配合 V2NIMTeamService.on 监听群组事件获取实时通知</strong>
          </li>
          <li>申请附言在需要审核的群组中非常重要，建议填写清楚的申请理由</li>
        </ul>
      </Card>
    </div>
  );
};

export default ApplyJoinTeamPage;
