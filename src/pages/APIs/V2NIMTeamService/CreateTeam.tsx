import { Button, Card, Form, Input, InputNumber, Select, Space, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface CreateTeamFormValues {
  params: {
    name: string;
    teamType: number;
    memberLimit?: number;
    intro?: string;
    announcement?: string;
    avatar?: string;
    serverExtension?: string;
    joinMode?: number;
    agreeMode?: number;
    inviteMode?: number;
    updateInfoMode?: number;
    updateExtensionMode?: number;
    chatBannedMode?: number;
  };
  inviteeAccountIds: string;
  postscript: string;
}

const defaultCreateTeamFormValues: CreateTeamFormValues = {
  params: {
    name: '我的群组',
    teamType: 1, // V2NIM_TEAM_TYPE_NORMAL
    memberLimit: 200,
    intro: '这是一个测试群组',
    announcement: '欢迎加入群组',
    avatar: '',
    serverExtension: '',
    joinMode: 0, // V2NIM_TEAM_JOIN_MODE_FREE
    agreeMode: 0, // V2NIM_TEAM_AGREE_MODE_AUTH
    inviteMode: 1, // V2NIM_TEAM_INVITE_MODE_MANAGER
    updateInfoMode: 1, // V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER
    updateExtensionMode: 1, // V2NIM_TEAM_UPDATE_EXTENSION_MODE_MANAGER
    chatBannedMode: 0, // V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN
  },
  inviteeAccountIds: '',
  postscript: '邀请您加入群组',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMTeamService.createTeam`;

const CreateTeamPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);

  // 获取初始值，优先从 localStorage 中获取
  const getInitialValues = (): CreateTeamFormValues => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStored = JSON.parse(stored);
        return { ...defaultCreateTeamFormValues, ...parsedStored };
      }
    } catch (error) {
      console.error('Failed to parse stored values:', error);
    }
    return defaultCreateTeamFormValues;
  };

  const initialValues = getInitialValues();

  // 表单提交: 触发 API 调用
  const handleCreateTeam = async (values: CreateTeamFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { params, inviteeAccountIds, postscript } = values;
    if (!params.name.trim()) {
      message.error('请输入群组名称');
      return;
    }

    setLoading(true);

    // 处理邀请成员列表
    const inviteeList = inviteeAccountIds
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    // 打印 API 入参
    console.log('API V2NIMTeamService.createTeam execute, params:', {
      params,
      inviteeAccountIds: inviteeList,
      postscript,
      antispamConfig: null,
    });

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMTeamService.createTeam(params, inviteeList, postscript)
    );
    if (error) {
      message.error(`创建群组失败: ${error.toString()}`);
      console.error('创建群组失败:', error.toString());
    } else {
      message.success('创建群组成功');
      console.log('创建群组成功, 结果:', result);
    }
    // finally
    setLoading(false);
    // 存储最终执行的参数
    localStorage.setItem(storageKey, JSON.stringify(values));
  };

  // 重置表单到默认值
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 重置表单为默认值
    form.setFieldsValue(defaultCreateTeamFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { params, inviteeAccountIds, postscript } = values;

    if (!params.name.trim()) {
      message.error('请先输入群组名称');
      return;
    }

    const inviteeList = inviteeAccountIds
      .split(',')
      .map((id: string) => id.trim())
      .filter((id: string) => id.length > 0);

    const callStatement = `await window.nim.V2NIMTeamService.createTeam(${JSON.stringify(params)}, ${JSON.stringify(inviteeList)}, ${JSON.stringify(postscript)});`;

    console.log('V2NIMTeamService.createTeam 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleCreateTeam}
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
          label="群组名称"
          name={['params', 'name']}
          rules={[{ required: true, message: '请输入群组名称' }]}
        >
          <Input placeholder="请输入群组名称" maxLength={30} showCount />
        </Form.Item>

        <Form.Item
          label="群组类型"
          name={['params', 'teamType']}
          rules={[{ required: true, message: '请选择群组类型' }]}
        >
          <Select placeholder="请选择群组类型">
            <Select.Option value={1}>高级群 (V2NIM_TEAM_TYPE_NORMAL)</Select.Option>
            <Select.Option value={2}>超大群 (V2NIM_TEAM_TYPE_SUPER)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="群组人数上限" name={['params', 'memberLimit']}>
          <InputNumber
            min={1}
            max={5000}
            placeholder="群组人数上限，默认200"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item label="群组介绍" name={['params', 'intro']}>
          <Input.TextArea
            placeholder="群组介绍，最多255个字符"
            rows={2}
            maxLength={255}
            showCount
          />
        </Form.Item>

        <Form.Item label="群组公告" name={['params', 'announcement']}>
          <Input.TextArea
            placeholder="群组公告，最多5000个字符"
            rows={3}
            maxLength={5000}
            showCount
          />
        </Form.Item>

        <Form.Item label="群组头像" name={['params', 'avatar']}>
          <Input placeholder="群组头像URL" />
        </Form.Item>

        <Form.Item label="服务端扩展" name={['params', 'serverExtension']}>
          <Input.TextArea placeholder="服务端扩展字段，由第三方APP自由定义" rows={2} />
        </Form.Item>

        <Form.Item
          label="申请者"
          name={['params', 'joinMode']}
          tooltip="指申请者是否能发起加入群组"
        >
          <Select placeholder="申请入群模式">
            <Select.Option value={0}>自由加入 (V2NIM_TEAM_JOIN_MODE_FREE)</Select.Option>
            <Select.Option value={1}>需向管理员发起申请 (V2NIM_TEAM_JOIN_MODE_APPLY)</Select.Option>
            <Select.Option value={2}>
              不许申请, 仅能邀请入群 (V2NIM_TEAM_JOIN_MODE_INVITE)
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="受邀者同意"
          name={['params', 'agreeMode']}
          tooltip="指受邀请者是否需要同意"
        >
          <Select placeholder="被邀请人同意模式">
            <Select.Option value={0}>需要同意 (V2NIM_TEAM_AGREE_MODE_AUTH)</Select.Option>
            <Select.Option value={1}>
              直接邀请并加入, 不需要同意 (V2NIM_TEAM_AGREE_MODE_NO_AUTH)
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="邀请者" name={['params', 'inviteMode']} tooltip="指谁有权限可以发起邀请">
          <Select placeholder="邀请入群模式">
            <Select.Option value={0}>所有人 (V2NIM_TEAM_INVITE_MODE_ALL)</Select.Option>
            <Select.Option value={1}>仅管理员 (V2NIM_TEAM_INVITE_MODE_MANAGER)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="群信息修改"
          name={['params', 'updateInfoMode']}
          tooltip="指谁有权限可以修改群信息"
        >
          <Select placeholder="群信息修改模式">
            <Select.Option value={0}>所有人 (V2NIM_TEAM_UPDATE_INFO_MODE_ALL)</Select.Option>
            <Select.Option value={1}>仅管理员 (V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="扩展修改"
          name={['params', 'updateExtensionMode']}
          tooltip="指谁有权限可以修改群扩展字段"
        >
          <Select placeholder="扩展字段修改模式">
            <Select.Option value={0}>所有人 (V2NIM_TEAM_UPDATE_EXTENSION_MODE_ALL)</Select.Option>
            <Select.Option value={1}>
              仅管理员 (V2NIM_TEAM_UPDATE_EXTENSION_MODE_MANAGER)
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="群禁言模式"
          name={['params', 'chatBannedMode']}
          tooltip="指谁有权限可以控制群禁言"
        >
          <Select placeholder="群禁言模式">
            <Select.Option value={0}>不禁言 (V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN)</Select.Option>
            <Select.Option value={1}>
              全员禁言 (V2NIM_TEAM_CHAT_BANNED_MODE_BANNED_NORMAL)
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="邀请成员列表" name="inviteeAccountIds">
          <Input.TextArea
            placeholder="邀请成员的账号ID列表，多个用逗号分隔，如：user1,user2,user3"
            rows={2}
          />
        </Form.Item>

        <Form.Item label="邀请附言" name="postscript">
          <Input.TextArea placeholder="邀请附言" rows={2} maxLength={200} showCount />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              创建群组
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
            <strong>群组名称:</strong> 必填，群组的显示名称，最多30个字符
          </li>
          <li>
            <strong>群组类型:</strong> 必填，只能选择高级群(1)或超大群(2)
          </li>
          <li>
            <strong>群组人数上限:</strong> 可选， 高级群默认200人，而超大群最多支持5000人.
            更多请参见官网使用说明.
          </li>
          <li>
            <strong>邀请成员列表:</strong> 可选，创建群组时同时邀请的成员账号ID，多个用逗号分隔
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
            <strong>创建群组前请确保已登录并且网络连接正常</strong>
          </li>
          <li>群组类型创建后不可修改，请根据实际需求选择合适的类型</li>
          <li>邀请成员时请确保成员账号存在且有效</li>
          <li>创建群组操作会触发相应的事件回调，请注意监听相关事件</li>
          <li>
            <strong>建议先通过 V2NIMUserService.getUserList 验证邀请成员账号是否存在</strong>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default CreateTeamPage;
