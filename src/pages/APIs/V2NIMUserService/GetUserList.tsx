import { Button, Card, Form, Input, Space, Tag, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

interface GetUserListFormValues {
  accountIds: string[];
}

const defaultGetUserListFormValues: GetUserListFormValues = {
  accountIds: ['cs1', 'cs2'],
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMUserService.getUserList`;

const GetUserListPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 账号ID输入框的值
  const [accountIdInput, setAccountIdInput] = useState('');
  // 当前账号ID列表
  const [accountIds, setAccountIds] = useState<string[]>(defaultGetUserListFormValues.accountIds);

  // 获取初始值
  const initialValues = { ...defaultGetUserListFormValues };

  // 添加账号ID
  const handleAddAccountId = () => {
    const trimmedInput = accountIdInput.trim();
    if (!trimmedInput) {
      message.warning('请输入账号ID');
      return;
    }
    if (accountIds.includes(trimmedInput)) {
      message.warning('账号ID已存在');
      return;
    }
    const newAccountIds = [...accountIds, trimmedInput];
    setAccountIds(newAccountIds);
    setAccountIdInput('');
    // 更新表单值
    form.setFieldsValue({ accountIds: newAccountIds });
  };

  // 移除账号ID
  const handleRemoveAccountId = (accountId: string) => {
    const newAccountIds = accountIds.filter(id => id !== accountId);
    setAccountIds(newAccountIds);
    // 更新表单值
    form.setFieldsValue({ accountIds: newAccountIds });
  };

  // 清空所有账号ID
  const handleClearAccountIds = () => {
    setAccountIds([]);
    form.setFieldsValue({ accountIds: [] });
  };

  // 添加示例账号
  const handleAddExampleAccounts = () => {
    const exampleAccounts = ['cs1', 'cs2', 'cs3'];
    const newAccountIds = [...new Set([...accountIds, ...exampleAccounts])];
    setAccountIds(newAccountIds);
    form.setFieldsValue({ accountIds: newAccountIds });
  };

  // 表单提交: 触发 API 调用
  const handleGetUserList = async (values: GetUserListFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { accountIds: formAccountIds } = values;
    if (!formAccountIds || formAccountIds.length === 0) {
      message.error('请至少输入一个账号ID');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMUserService.getUserList execute, params:', formAccountIds);

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMUserService.getUserList(formAccountIds)
    );
    if (error) {
      message.error(`获取用户列表失败: ${error.toString()}`);
      console.error('获取用户列表失败:', error.toString());
    } else {
      message.success('获取用户列表成功');
      console.log('获取用户列表成功, 结果:', result);
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
    setAccountIds(defaultGetUserListFormValues.accountIds);
    form.setFieldsValue(defaultGetUserListFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { accountIds: formAccountIds } = values;

    if (!formAccountIds || formAccountIds.length === 0) {
      message.error('请先输入账号ID');
      return;
    }

    const callStatement = `await window.nim.V2NIMUserService.getUserList(${JSON.stringify(formAccountIds)});`;

    console.log('V2NIMUserService.getUserList 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  // 处理输入框回车事件
  const handleInputPressEnter = () => {
    handleAddAccountId();
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleGetUserList}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMUserService`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item label="账号ID列表" required>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="输入账号ID"
                value={accountIdInput}
                onChange={e => setAccountIdInput(e.target.value)}
                onPressEnter={handleInputPressEnter}
              />
              <Button type="primary" onClick={handleAddAccountId}>
                添加
              </Button>
            </Space.Compact>

            <Space size="small" style={{ marginTop: 8 }}>
              <Button size="small" onClick={handleAddExampleAccounts}>
                添加示例账号
              </Button>
              <Button size="small" onClick={handleClearAccountIds} danger>
                清空全部
              </Button>
            </Space>

            {accountIds.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Space size={[0, 8]} wrap>
                  {accountIds.map(accountId => (
                    <Tag key={accountId} closable onClose={() => handleRemoveAccountId(accountId)}>
                      {accountId}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </Space>
        </Form.Item>

        <Form.Item name="accountIds" hidden>
          <Input />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              获取用户列表
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
            <strong>此接口的数据来源乃数据同步时下发的某好友的用户信息</strong>
          </li>
          <li>
            因此调用时机依然需要等待 V2NIMLoginService 的 onDataSync 事件, 数据同步完毕后, 才能调用.
          </li>
          <li>而缓存里查不到的账号回去发协议查一遍后返回, 接着存入内存缓存</li>
          <li>
            <strong>
              鉴于用户的信息可能做不到事实更新, 所以推荐在有需要的情况下用另一个接口
              getUserListFromCloud 来确保一定从服务器获取最新的信息
            </strong>
          </li>
        </ul>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>支持添加多个账号ID，最多支持150个账号</li>
          <li>账号ID不能为空且不能重复</li>
          <li>返回结果包含用户的基本信息如昵称、头像等</li>
          <li>可以点击"添加示例账号"快速添加测试用的账号ID</li>
        </ul>
      </Card>
    </div>
  );
};

export default GetUserListPage;
