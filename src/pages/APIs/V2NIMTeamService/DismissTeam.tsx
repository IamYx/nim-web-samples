import { Button, Card, Form, Radio, Select, Space, message } from 'antd';
import { V2NIMTeam } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';
import { useEffect, useRef, useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface DismissTeamFormValues {
  teamId: string;
  teamType: number;
}

const defaultDismissTeamFormValues: DismissTeamFormValues = {
  teamId: '',
  teamType: 1, // 默认高级群
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMTeamService.dismissTeam`;

const DismissTeamPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 群组列表加载状态
  const [teamListLoading, setTeamListLoading] = useState(false);
  // 已加入的群组列表
  const [joinedTeamList, setJoinedTeamList] = useState<V2NIMTeam[]>([]);
  // 防止重复请求的标志
  const hasInitialized = useRef(false);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = () => defaultDismissTeamFormValues;

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
  const handleDismissTeam = async (values: DismissTeamFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { teamId, teamType } = values;
    if (!teamId) {
      message.error('请选择要解散的群组');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMTeamService.dismissTeam execute, params:', {
      teamId,
      teamType,
    });

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMTeamService.dismissTeam(teamId, teamType)
    );

    if (error) {
      message.error(`解散群组失败: ${error.toString()}`);
      console.error('解散群组失败:', error.toString());
    } else {
      message.success('解散群组成功');
      console.log('解散群组成功, 结果:', result);
    }

    setLoading(false);
    // 存储最终执行的参数
    // localStorage.setItem(storageKey, JSON.stringify(values));
  };

  // 重置表单到默认值
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 重置表单为默认值
    form.setFieldsValue(defaultDismissTeamFormValues);
    message.success('表单已重置为默认值');
  };

  // 刷新群组列表
  const handleRefreshTeamList = () => {
    fetchJoinedTeamList();
  };

  // 当选择群组时自动填充群组类型
  const handleTeamSelect = (teamId: string) => {
    const selectedTeam = joinedTeamList.find(team => team.teamId === teamId);
    if (selectedTeam) {
      form.setFieldsValue({
        teamId,
        teamType: selectedTeam.teamType,
      });
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
    const { teamId, teamType } = values;

    if (!teamId) {
      message.error('请先选择要解散的群组');
      return;
    }

    const callStatement = `await window.nim.V2NIMTeamService.dismissTeam(${JSON.stringify(teamId)}, ${teamType});`;

    console.log('V2NIMTeamService.dismissTeam 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleDismissTeam}
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
          rules={[{ required: true, message: '请选择要解散的群组' }]}
        >
          <Select
            placeholder="请选择要解散的群组"
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
          tooltip="必须与要解散的群组类型一致"
        >
          <Radio.Group>
            <Radio value={1}>高级群 (V2NIM_TEAM_TYPE_NORMAL)</Radio>
            <Radio value={2}>超大群 (V2NIM_TEAM_TYPE_SUPER)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              解散群组
            </Button>
            <Button type="default" onClick={handleReset}>
              重置
            </Button>
            <Button type="default" onClick={handleRefreshTeamList} loading={teamListLoading}>
              刷新群组列表
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
            <strong>选择群组:</strong> 从已加入的群组列表中选择要解散的群组
          </li>
          <li>
            <strong>群组类型:</strong> 必须与要解散的群组的实际类型一致
            <ul style={{ marginTop: 4 }}>
              <li>1 - 高级群 (V2NIM_TEAM_TYPE_NORMAL)</li>
              <li>2 - 超大群 (V2NIM_TEAM_TYPE_SUPER)</li>
            </ul>
          </li>
          <li>选择群组后，系统会自动填充对应的群组类型</li>
          <li>支持按群组名称或ID搜索群组</li>
          <li>可以点击"刷新群组列表"按钮获取最新的群组信息</li>
          <li>解散群组后，该群组将被永久删除，所有成员都会被移除</li>
          <li>解散群组操作是不可逆的，请谨慎操作</li>
          <li>
            <strong>只有群主才能解散群组</strong>
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
                <strong>全员:</strong> SDK 会抛出 V2NIMTeamListener.onTeamDismissed 事件
              </li>
            </ul>
          </li>
          <li>解散群组后，该群组将从所有成员的群组列表中移除</li>
          <li>群组的聊天记录会保留在本地，但群组不再存在</li>
          <li>解散后的群组无法恢复，也无法重新加入</li>
        </ul>
      </Card>

      {/* 权限说明 */}
      <Card title="权限说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>群主:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>拥有解散群组的权限</li>
              <li>可以解散自己创建的群组</li>
              <li>解散群组会通知所有群成员</li>
            </ul>
          </li>
          <li>
            <strong>管理员和普通成员:</strong>
            <ul style={{ marginTop: 4 }}>
              <li>没有解散群组的权限</li>
              <li>只能退出群组，不能解散群组</li>
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
            <strong>解散群组操作是不可逆的，群组将被永久删除</strong>
          </li>
          <li>
            <strong>只有群主才能解散群组，其他成员会收到权限不足的错误</strong>
          </li>
          <li>群组类型参数必须与目标群组的实际类型一致，否则会操作失败</li>
          <li>解散群组后，所有群成员都会收到群组解散的通知</li>
          <li>
            <strong>建议先通过 V2NIMTeamService.getJoinedTeamList 确认群组存在</strong>
          </li>
          <li>解散群组会触发相应的事件回调，请注意监听相关事件</li>
          <li>解散群组不会删除本地的聊天记录</li>
          <li>
            <strong>请确保你确实需要解散群组，此操作无法撤销</strong>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default DismissTeamPage;
