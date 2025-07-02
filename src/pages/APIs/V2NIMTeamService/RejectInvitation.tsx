import { Button, Card, Empty, Form, Input, Select, Space, Spin, Tag, message } from 'antd';
import { V2NIMTeamJoinActionInfo } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface RejectInvitationFormValues {
  invitationInfo: string;
  postscript: string;
}

const defaultRejectInvitationFormValues: RejectInvitationFormValues = {
  invitationInfo: '',
  postscript: '',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMTeamService.rejectInvitation`;

const RejectInvitationPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 获取邀请列表的加载状态
  const [fetchingInvitations, setFetchingInvitations] = useState(false);
  // 群邀请列表
  const [invitations, setInvitations] = useState<V2NIMTeamJoinActionInfo[]>([]);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

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
    return defaultRejectInvitationFormValues;
  };

  const initialValues = getInitialValues();

  // 获取群邀请列表
  const fetchInvitationList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setFetchingInvitations(true);

    const option = {
      offset: 0,
      limit: 50,
      types: [2], // V2NIM_TEAM_JOIN_ACTION_TYPE_INVITATION - 邀请入群
      status: [0], // V2NIM_TEAM_JOIN_ACTION_STATUS_INIT - 未处理
    };

    // 打印 API 入参
    console.log('API V2NIMTeamService.getTeamJoinActionInfoList execute, params:', option);

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMTeamService.getTeamJoinActionInfoList(option)
    );

    if (error) {
      message.error(`获取群邀请列表失败: ${error.toString()}`);
      console.error('获取群邀请列表失败:', error);
      setInvitations([]);
    } else {
      console.log('获取群邀请列表成功, 结果:', result);
      // 过滤出待处理的邀请（actionType = 2, actionStatus = 0）
      const pendingInvitations = (result?.infos || []).filter(
        (invitation: V2NIMTeamJoinActionInfo) =>
          invitation.actionType === 2 && invitation.actionStatus === 0
      );
      setInvitations(pendingInvitations);

      if (pendingInvitations.length === 0) {
        message.info('暂无待处理的群邀请');
      } else {
        message.success(`获取到 ${pendingInvitations.length} 条待处理的群邀请`);
      }
    }
    setFetchingInvitations(false);
  };

  // 组件挂载时获取邀请列表
  useEffect(() => {
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      fetchInvitationList();
    }
  }, []);

  // 表单提交: 触发 API 调用
  const handleRejectInvitation = async (values: RejectInvitationFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { invitationInfo, postscript } = values;
    if (!invitationInfo) {
      message.error('请选择要拒绝的群邀请');
      return;
    }

    // 根据 applicationId 查找完整的申请对象
    const invitation = invitations.find(
      app => `${app.teamId}-${app.operatorAccountId}-${app.timestamp}` === invitationInfo
    );
    if (!invitation) {
      message.error('未找到对应的申请');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMTeamService.rejectInvitation execute, params:', {
      invitation,
      postscript,
    });

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMTeamService.rejectInvitation(invitation, postscript)
    );

    if (error) {
      message.error(`拒绝群邀请失败: ${error.toString()}`);
      console.error('拒绝群邀请失败:', error.toString());
    } else {
      message.success('拒绝群邀请成功');
      console.log('拒绝群邀请成功, 结果:', result);
      // 重新获取邀请列表
      await fetchInvitationList();
      // 清空表单选择
      form.setFieldsValue({ invitationInfo: '', postscript: '' });
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
    form.setFieldsValue(defaultRejectInvitationFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { invitationInfo, postscript } = values;

    if (!invitationInfo) {
      message.error('请先选择要拒绝的群邀请');
      return;
    }

    // 根据 applicationId 查找完整的申请对象
    const invitation = invitations.find(
      app => `${app.teamId}-${app.operatorAccountId}-${app.timestamp}` === invitationInfo
    );

    if (!invitation) {
      message.error('未找到对应的申请');
      return;
    }

    const callStatement = `await window.nim.V2NIMTeamService.rejectInvitation(${JSON.stringify(invitation, null, 2)}, "${postscript || ''}");`;

    console.log('V2NIMTeamService.rejectInvitation 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 刷新邀请列表
  const handleRefreshInvitations = () => {
    fetchInvitationList();
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
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

  // 获取操作类型标签
  const getActionTypeTag = (actionType: number) => {
    switch (actionType) {
      case 0:
        return <Tag color="blue">申请入群</Tag>;
      case 1:
        return <Tag color="red">拒绝申请</Tag>;
      case 2:
        return <Tag color="green">邀请入群</Tag>;
      case 3:
        return <Tag color="orange">拒绝邀请</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  // 获取状态标签
  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color="orange">待处理</Tag>;
      case 1:
        return <Tag color="green">已同意</Tag>;
      case 2:
        return <Tag color="red">已拒绝</Tag>;
      case 3:
        return <Tag color="gray">已过期</Tag>;
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
        onFinish={handleRejectInvitation}
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

        <Form.Item label="群邀请列表">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Button onClick={handleRefreshInvitations} loading={fetchingInvitations} size="small">
                刷新邀请列表
              </Button>
              <span style={{ color: '#666', fontSize: '12px' }}>
                {fetchingInvitations ? '正在获取...' : `共 ${invitations.length} 条待处理邀请`}
              </span>
            </Space>
          </Space>
        </Form.Item>

        <Form.Item
          label="选择邀请"
          name="invitationInfo"
          rules={[{ required: true, message: '请选择要拒绝的群邀请' }]}
        >
          <Select
            placeholder="请选择要拒绝的群邀请"
            loading={fetchingInvitations}
            notFoundContent={
              fetchingInvitations ? (
                <Spin size="small" />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无待处理的群邀请" />
              )
            }
            optionLabelProp="label"
            style={{ width: '100%' }}
          >
            {invitations.map(invitation => (
              <Select.Option
                key={`${invitation.teamId}-${invitation.operatorAccountId}-${invitation.timestamp}`}
                value={`${invitation.teamId}-${invitation.operatorAccountId}-${invitation.timestamp}`}
                label={`群组: ${invitation.teamId} - 邀请人: ${invitation.operatorAccountId}`}
              >
                <div style={{ padding: '8px 0' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ fontWeight: 'bold' }}>
                      群组: {invitation.teamId} ({getTeamTypeText(invitation.teamType)})
                    </span>
                    <Space>
                      {getActionTypeTag(invitation.actionType)}
                      {getStatusTag(invitation.actionStatus)}
                    </Space>
                  </div>
                  <div style={{ color: '#666', fontSize: '12px', marginBottom: '2px' }}>
                    邀请人: {invitation.operatorAccountId}
                  </div>
                  <div style={{ color: '#666', fontSize: '12px', marginBottom: '2px' }}>
                    邀请消息: {invitation.postscript || '无'}
                  </div>
                  <div style={{ color: '#999', fontSize: '12px', marginBottom: '2px' }}>
                    邀请时间: {formatTimestamp(invitation.timestamp)}
                  </div>
                  {invitation.serverExtension && (
                    <div style={{ color: '#999', fontSize: '12px' }}>
                      扩展字段: {invitation.serverExtension}
                    </div>
                  )}
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="拒绝理由" name="postscript" extra="可选，拒绝邀请的理由附言">
          <Input.TextArea
            placeholder="请输入拒绝邀请的理由（可选）"
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ flex: 1 }}
              disabled={invitations.length === 0}
              danger
            >
              拒绝群邀请
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
            <strong>自动获取邀请列表:</strong> 页面加载时会自动调用 getTeamJoinActionInfoList
            获取待处理的群邀请
          </li>
          <li>
            <strong>邀请筛选条件:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>操作类型为"邀请入群"(actionType=2)</li>
              <li>状态为"待处理"(actionStatus=0)</li>
            </ul>
          </li>
          <li>
            <strong>邀请信息展示:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>群组ID和类型</li>
              <li>邀请人账号ID</li>
              <li>邀请消息内容</li>
              <li>邀请时间</li>
              <li>操作类型和状态</li>
              <li>扩展字段（如果有）</li>
            </ul>
          </li>
          <li>
            <strong>拒绝理由:</strong> 可以填写拒绝邀请的理由，这个信息会传递给邀请人
          </li>
          <li>
            <strong>实时刷新:</strong> 可以点击"刷新邀请列表"按钮获取最新的邀请信息
          </li>
          <li>
            <strong>事件监听:</strong> 也可以通过监听相关团队事件获取实时邀请通知
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
                <strong>邀请人端:</strong> SDK 会抛出 V2NIMTeamListener.onTeamJoinActionInfoSynced
                事件， 通知邀请被拒绝
              </li>
              <li>邀请人可以看到拒绝理由（如果提供了 postscript）</li>
            </ul>
          </li>
          <li>拒绝邀请后，用户不会成为群组成员</li>
          <li>邀请状态将更新为"已拒绝"</li>
          <li>如果需要重新加入群组，需要重新申请或重新被邀请</li>
        </ul>
      </Card>

      {/* API 参数说明 */}
      <Card title="API 参数说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>invitationInfo (V2NIMTeamJoinActionInfo):</strong> 收到的邀请入群信息对象
            <ul style={{ marginTop: 4 }}>
              <li>
                <strong>actionType:</strong> 群操作类型（必须为 2 - 邀请入群）
              </li>
              <li>
                <strong>teamId:</strong> 群组ID
              </li>
              <li>
                <strong>teamType:</strong> 群组类型（1-高级群，2-超大群）
              </li>
              <li>
                <strong>operatorAccountId:</strong> 操作者（邀请人）账号ID
              </li>
              <li>
                <strong>postscript:</strong> 原邀请附言
              </li>
              <li>
                <strong>timestamp:</strong> 操作时间戳
              </li>
              <li>
                <strong>actionStatus:</strong> 操作状态（必须为 0 - 待处理）
              </li>
              <li>
                <strong>serverExtension:</strong> 扩展字段（可选）
              </li>
            </ul>
          </li>
          <li>
            <strong>postscript (string):</strong> 拒绝入群的附言（可选）
            <ul style={{ marginTop: 4 }}>
              <li>用于向邀请人说明拒绝的理由</li>
              <li>可以为空字符串或 null</li>
              <li>建议填写具体的拒绝理由以便沟通</li>
            </ul>
          </li>
        </ul>
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
          <li>拒绝群邀请是不可逆操作，拒绝后无法撤销</li>
          <li>拒绝邀请会触发相应的事件回调，请注意监听相关事件</li>
          <li>
            <strong>建议配合 V2NIMTeamService.on 监听群组事件获取实时通知</strong>
          </li>
          <li>如果邀请列表为空，可能是没有待处理的邀请或者数据同步未完成</li>
          <li>已过期的邀请无法操作，会自动标记为过期状态</li>
          <li>
            <strong>只能拒绝发给当前登录用户的邀请</strong>
          </li>
          <li>
            <strong>拒绝理由会传递给邀请人，请注意用词得当</strong>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default RejectInvitationPage;
