import { Button, Checkbox, Form, Input, InputNumber, Select, Space, Switch, message } from 'antd';
import { V2NIMLoginOption } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMLoginService';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';
import { getInitialValues, stringifyWithFunctions } from '../util';

const { Option } = Select;

interface LoginFormValues {
  accountId: string;
  token: string;
  loginOption: V2NIMLoginOption;
}

const defaultLoginFormValues: LoginFormValues = {
  accountId: 'account1',
  token: 'e10adc3************f20f883e',
  loginOption: {
    retryCount: 3,
    timeout: 60000,
    forceMode: false,
    authType: 0,
  },
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMLoginService.login`;

const LoginPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);
  // 是否显示高级配置选项
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 获取初始值. 从 localstorage 读取, 没有则使用默认值.
  const initialValues = getInitialValues(storageKey, defaultLoginFormValues);

  // 表单提交: 触发 API 调用
  const handleLogin = async (values: LoginFormValues) => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }
    setLoading(true);
    const { accountId, token, loginOption } = values;

    // 构建最终的 loginOption，根据认证类型添加 tokenProvider
    let finalLoginOption = showAdvanced ? { ...loginOption } : undefined;

    if (showAdvanced) {
      if (loginOption.authType === 1) {
        // 动态令牌认证时添加 tokenProvider 回调函数
        finalLoginOption = {
          ...finalLoginOption,
          tokenProvider: function (accid: string) {
            console.log(accid, '将会返回一个新的登录 token');
            return 'e10adc3************f20f883e';
          },
        };
      } else if (loginOption.authType === 2) {
        // 自定义认证时添加 loginExtensionProvider 回调函数
        finalLoginOption = {
          ...finalLoginOption,
          loginExtensionProvider: function (accid) {
            console.log(accid, '将会返回一个新的登录扩展字段');
            return 'example login extension';
          },
        };
      }
    }

    // 打印 API 入参
    console.log('API V2NIMLoginService.login execute, params:', accountId, token, finalLoginOption);

    // 执行 API
    const [error] = await to(() =>
      window.nim?.V2NIMLoginService.login(accountId, token, finalLoginOption)
    );
    if (error) {
      message.error(`Login 失败: ${error.toString()}`);
    } else {
      message.success('Login 成功');
    }
    // finally
    setLoading(false);
    // 构建最终执行的参数对象（注意：tokenProvider 函数不能序列化，所以存储时排除）
    const finalParams = {
      accountId,
      token,
      loginOption: showAdvanced ? loginOption : undefined, // 存储时不包含 tokenProvider
    };
    localStorage.setItem(storageKey, JSON.stringify(finalParams));
  };

  const handleLogout = async () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }
    const [error] = await to(() => window.nim?.V2NIMLoginService.logout());
    if (error) {
      message.error(`Logout 执行失败: ${error.message}`);
      console.error(`Logout 执行失败: ${error.toString()}`);
      return;
    }
    message.success(`Logout 执行成功`);
  };

  // 当高级配置选项切换时, 把选填参数设置为默认值.
  const handleShowAdvancedChange = (checked: boolean) => {
    setShowAdvanced(checked);
    if (checked) {
      form.setFieldsValue({ loginOption: defaultLoginFormValues.loginOption });
    }
  };

  // 重置表单到默认值
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 重置表单为默认值
    form.setFieldsValue(defaultLoginFormValues);
    // 重置高级参数显示状态
    setShowAdvanced(false);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { accountId, token, loginOption } = values;

    let callStatement = '';

    if (!showAdvanced) {
      // 基础调用，不带选项
      callStatement = `await window.nim.V2NIMLoginService.login("${accountId}", "${token}");`;
    } else {
      // 高级调用，包含选项
      const finalOption = { ...loginOption };

      // 如果是动态令牌认证，添加 tokenProvider 函数
      if (loginOption.authType === 1) {
        finalOption.tokenProvider = function (accid: string) {
          console.log(accid, '将会返回一个新的登录 token');
          return 'e10adc3************f20f883e';
        };
      } else if (loginOption.authType === 2) {
        // 自定义认证时添加 loginExtensionProvider 回调函数
        finalOption.loginExtensionProvider = function (accid: string) {
          console.log(accid, '将会返回一个新的登录扩展字段');
          return 'example login extension';
        };
      }

      const optionStr = stringifyWithFunctions(finalOption);
      callStatement = `await window.nim.V2NIMLoginService.login("${accountId}", "${token}", ${optionStr});`;
    }

    console.log('V2NIMLoginService.login 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleLogin}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMLoginService`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>
        <Form.Item
          label="账号 ID"
          name="accountId"
          rules={[{ required: true, message: '请输入用户账号' }]}
        >
          <Input placeholder="请输入用户账号" />
        </Form.Item>

        <Form.Item label="Token" name="token" rules={[{ required: true, message: '请输入令牌' }]}>
          <Input.Password placeholder="请输入令牌" />
        </Form.Item>

        <Form.Item label={null}>
          <Checkbox onChange={event => handleShowAdvancedChange(event.target.checked)}>
            登录高级参数
          </Checkbox>
        </Form.Item>

        {showAdvanced && (
          <>
            <Form.Item
              label="尝试次数"
              name={['loginOption', 'retryCount']}
              tooltip="登录失败时的重试次数，默认为 3 次"
            >
              <InputNumber min={0} placeholder="默认 3 次" />
            </Form.Item>

            <Form.Item
              label="超时时间"
              name={['loginOption', 'timeout']}
              tooltip="登录操作的超时时间，单位为毫秒，默认 60000ms (60秒)"
            >
              <InputNumber min={1000} step={1000} placeholder="默认 60000ms" />
            </Form.Item>

            <Form.Item
              label="强制登录"
              name={['loginOption', 'forceMode']}
              valuePropName="checked"
              tooltip="是否强制登录，开启后会踢掉其他端的登录状态"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label="认证类型"
              name={['loginOption', 'authType']}
              tooltip="登录认证类型，0表示默认的静态 token 认证"
            >
              <Select placeholder="选择认证类型">
                <Option value={0}>0 - 默认认证</Option>
                <Option value={1}>1 - 动态令牌认证, 示例 tokenProvider 回调</Option>
                <Option value={2}>2 - 第三方认证, 示例 loginExtensionProvider 回调</Option>
              </Select>
            </Form.Item>
          </>
        )}

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              登录
            </Button>
            <Button type="default" onClick={handleReset}>
              重置
            </Button>
            <Button type="default" onClick={handleOutput}>
              输出调用语句
            </Button>
            <Button type="default" danger onClick={handleLogout}>
              登出
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
