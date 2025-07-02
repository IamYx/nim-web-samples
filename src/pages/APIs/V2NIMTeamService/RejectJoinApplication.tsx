import { Button, Card, Empty, Form, Input, Select, Space, Spin, Tag, message } from 'antd';
import { V2NIMTeamJoinActionInfo } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface RejectJoinApplicationFormValues {
  applicationInfo: string;
  postscript: string;
}

const defaultRejectJoinApplicationFormValues: RejectJoinApplicationFormValues = {
  applicationInfo: '',
  postscript: '',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMTeamService.rejectJoinApplication`;

const RejectJoinApplicationPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 获取申请列表的加载状态
  const [fetchingApplications, setFetchingApplications] = useState(false);
  // 群申请列表
  const [applications, setApplications] = useState<V2NIMTeamJoinActionInfo[]>([]);
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
    return defaultRejectJoinApplicationFormValues;
  };

  const initialValues = getInitialValues();

  // 获取群申请列表
  const fetchApplicationList = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    setFetchingApplications(true);

    const option = {
      offset: 0,
      limit: 50,
      types: [0], // V2NIM_TEAM_JOIN_ACTION_TYPE_APPLICATION - 申请入群
      status: [0], // V2NIM_TEAM_JOIN_ACTION_STATUS_INIT - 未处理
    };

    // 打印 API 入参
    console.log('API V2NIMTeamService.getTeamJoinActionInfoList execute, params:', option);

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMTeamService.getTeamJoinActionInfoList(option)
    );

    if (error) {
      message.error(`获取群申请列表失败: ${error.toString()}`);
      console.error('获取群申请列表失败:', error);
      setApplications([]);
    } else {
      console.log('获取群申请列表成功, 结果:', result);
      // 过滤出待处理的申请（actionType = 0, actionStatus = 0）
      const pendingApplications = (result?.infos || []).filter(
        (application: V2NIMTeamJoinActionInfo) =>
          application.actionType === 0 && application.actionStatus === 0
      );
      setApplications(pendingApplications);

      if (pendingApplications.length === 0) {
        message.info('暂无待处理的群申请');
      } else {
        message.success(`获取到 ${pendingApplications.length} 条待处理的群申请`);
      }
    }
    setFetchingApplications(false);
  };

  // 组件挂载时获取申请列表
  useEffect(() => {
    if (!hasInitialized.current && window.nim && window.nim.V2NIMLoginService.getLoginUser()) {
      hasInitialized.current = true;
      fetchApplicationList();
    }
  }, []);

  // 表单提交: 触发 API 调用
  const handleRejectJoinApplication = async (values: RejectJoinApplicationFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { applicationInfo, postscript } = values;
    if (!applicationInfo) {
      message.error('请选择要拒绝的群申请');
      return;
    }

    // 根据 applicationId 查找完整的申请对象
    const application = applications.find(
      app => `${app.teamId}-${app.operatorAccountId}-${app.timestamp}` === applicationInfo
    );
    if (!application) {
      message.error('未找到对应的申请');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMTeamService.rejectJoinApplication execute, params:', {
      applicationInfo: application,
      postscript,
    });

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMTeamService.rejectJoinApplication(application, postscript)
    );

    if (error) {
      message.error(`拒绝群申请失败: ${error.toString()}`);
      console.error('拒绝群申请失败:', error.toString());
    } else {
      message.success('拒绝群申请成功');
      console.log('拒绝群申请成功, 结果:', result);
      // 重新获取申请列表
      await fetchApplicationList();
      // 清空表单选择
      form.setFieldsValue({ applicationInfo: '', postscript: '' });
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
    form.setFieldsValue(defaultRejectJoinApplicationFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { applicationInfo, postscript } = values;

    if (!applicationInfo) {
      message.error('请先选择要拒绝的群申请');
      return;
    }

    // 根据 applicationId 查找完整的申请对象
    const application = applications.find(
      app => `${app.teamId}-${app.operatorAccountId}-${app.timestamp}` === applicationInfo
    );

    if (!application) {
      message.error('未找到对应的申请');
      return;
    }

    const callStatement = `await window.nim.V2NIMTeamService.rejectJoinApplication(${JSON.stringify(application, null, 2)}, ${JSON.stringify(postscript || '')});`;

    console.log('V2NIMTeamService.rejectJoinApplication 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 刷新申请列表
  const handleRefreshApplications = () => {
    fetchApplicationList();
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
        onFinish={handleRejectJoinApplication}
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

        <Form.Item label="群申请列表">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Button
                onClick={handleRefreshApplications}
                loading={fetchingApplications}
                size="small"
              >
                刷新申请列表
              </Button>
              <span style={{ color: '#666', fontSize: '12px' }}>
                {fetchingApplications ? '正在获取...' : `共 ${applications.length} 条待处理申请`}
              </span>
            </Space>
          </Space>
        </Form.Item>

        <Form.Item
          label="选择申请"
          name="applicationInfo"
          rules={[{ required: true, message: '请选择要拒绝的群申请' }]}
        >
          <Select
            placeholder="请选择要拒绝的群申请"
            loading={fetchingApplications}
            notFoundContent={
              fetchingApplications ? (
                <Spin size="small" />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无待处理的群申请" />
              )
            }
            optionLabelProp="label"
            style={{ width: '100%' }}
          >
            {applications.map(application => (
              <Select.Option
                key={`${application.teamId}-${application.operatorAccountId}-${application.timestamp}`}
                value={`${application.teamId}-${application.operatorAccountId}-${application.timestamp}`}
                label={`群组: ${application.teamId} - 申请人: ${application.operatorAccountId}`}
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
                      群组: {application.teamId} ({getTeamTypeText(application.teamType)})
                    </span>
                    <Space>
                      {getActionTypeTag(application.actionType)}
                      {getStatusTag(application.actionStatus)}
                    </Space>
                  </div>
                  <div style={{ color: '#666', fontSize: '12px', marginBottom: '2px' }}>
                    申请人: {application.operatorAccountId}
                  </div>
                  <div style={{ color: '#666', fontSize: '12px', marginBottom: '2px' }}>
                    申请消息: {application.postscript || '无'}
                  </div>
                  <div style={{ color: '#999', fontSize: '12px', marginBottom: '2px' }}>
                    申请时间: {formatTimestamp(application.timestamp)}
                  </div>
                  {application.serverExtension && (
                    <div style={{ color: '#999', fontSize: '12px' }}>
                      扩展字段: {application.serverExtension}
                    </div>
                  )}
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="拒绝附言" name="postscript" tooltip="拒绝申请的理由或说明，可选">
          <Input.TextArea
            placeholder="请输入拒绝申请的理由（可选）"
            rows={4}
            maxLength={500}
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
              disabled={applications.length === 0}
              danger
            >
              拒绝群申请
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
            <strong>自动获取申请列表:</strong> 页面加载时会自动调用 getTeamJoinActionInfoList
            获取待处理的群申请
          </li>
          <li>
            <strong>申请筛选条件:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>操作类型为"申请入群"(actionType=0)</li>
              <li>状态为"待处理"(actionStatus=0)</li>
            </ul>
          </li>
          <li>
            <strong>申请信息展示:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>群组ID和类型</li>
              <li>申请人账号ID</li>
              <li>申请消息内容</li>
              <li>申请时间</li>
              <li>操作类型和状态</li>
              <li>扩展字段（如果有）</li>
            </ul>
          </li>
          <li>
            <strong>拒绝附言:</strong> 可选，向申请人说明拒绝的理由
          </li>
          <li>
            <strong>权限要求:</strong> 只有群主和管理员才能拒绝群申请
          </li>
          <li>
            <strong>实时刷新:</strong> 可以点击"刷新申请列表"按钮获取最新的申请信息
          </li>
          <li>
            <strong>事件监听:</strong> 也可以通过监听相关团队事件获取实时申请通知
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
                <strong>被操作者（申请人）端:</strong> SDK 会抛出
                V2NIMTeamListener.onReceiveTeamJoinActionInfo 事件
              </li>
              <li>申请人会收到申请被拒绝的通知</li>
            </ul>
          </li>
          <li>拒绝申请后，申请人不会成为群组成员</li>
          <li>申请状态将更新为"已拒绝"</li>
          <li>如果提供了拒绝附言，申请人可以看到拒绝理由</li>
        </ul>
      </Card>

      {/* API 参数说明 */}
      <Card title="API 参数说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>applicationInfo (V2NIMTeamJoinActionInfo):</strong> 该申请的相关信息对象
            <ul style={{ marginTop: 4 }}>
              <li>
                <strong>actionType:</strong> 群操作类型（<strong>必须为 0 - 申请入群</strong>）
              </li>
              <li>
                <strong>teamId:</strong> 群组ID
              </li>
              <li>
                <strong>teamType:</strong> 群组类型（1-高级群，2-超大群）
              </li>
              <li>
                <strong>operatorAccountId:</strong> 操作者（申请人）账号ID
              </li>
              <li>
                <strong>postscript:</strong> 申请附言
              </li>
              <li>
                <strong>timestamp:</strong> 操作时间戳
              </li>
              <li>
                <strong>actionStatus:</strong> 操作状态
              </li>
              <li>
                <strong>serverExtension:</strong> 扩展字段（可选）
              </li>
            </ul>
          </li>
          <li>
            <strong>postscript (string, 可选):</strong> 拒绝申请的附言
            <ul style={{ marginTop: 4 }}>
              <li>向申请人说明拒绝的理由</li>
              <li>最多500个字符</li>
              <li>申请人可以通过事件回调获取到这个附言</li>
            </ul>
          </li>
        </ul>
      </Card>

      {/* 拒绝理由的重要性 */}
      <Card title="拒绝理由的重要性" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>提供拒绝理由的好处:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>让申请人了解被拒绝的原因</li>
              <li>提高群组管理的透明度</li>
              <li>减少重复申请的可能性</li>
              <li>改善用户体验</li>
            </ul>
          </li>
          <li>
            <strong>常见拒绝理由示例:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>"群组已满，暂不接受新成员"</li>
              <li>"需要群内成员推荐才能加入"</li>
              <li>"申请信息不完整"</li>
              <li>"群组为内部群，仅限特定人员加入"</li>
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
          <li>
            <strong>只有群主和管理员才能拒绝群申请</strong>
          </li>
          <li>
            <strong>applicationInfo 的 actionType 必须为 0（申请入群）</strong>
          </li>
          <li>拒绝申请后，申请人将收到被拒绝的通知</li>
          <li>拒绝申请会触发相应的事件回调，请注意监听相关事件</li>
          <li>
            <strong>建议配合 V2NIMTeamService.on 监听群组事件获取实时通知</strong>
          </li>
          <li>
            <strong>建议提供明确的拒绝理由，改善用户体验</strong>
          </li>
          <li>已过期的申请无法拒绝</li>
          <li>
            <strong>只能处理当前登录用户有管理权限的群组申请</strong>
          </li>
          <li>拒绝申请不可撤销，申请人需要重新申请</li>
        </ul>
      </Card>
    </div>
  );
};

export default RejectJoinApplicationPage;
