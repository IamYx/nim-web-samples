import { UploadOutlined } from '@ant-design/icons';

import { Button, Form, Input, InputNumber, Switch, Upload, message } from 'antd';
import { get } from 'es-toolkit/compat';
import { V2NIMError } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/types';
import { useEffect } from 'react';

import { V2NIMServiceType } from '@/configs/apiParams/V2NIM.config';
import { V2API } from '@/configs/apiParams/types';
import { to } from '@/utils/errorHandle';
import { formatMethodParams } from '@/utils/format';

import styles from './index.module.less';

interface SharedFormProps {
  interfaceName: V2NIMServiceType;
  methodName: string;
  methodConfig: V2API;
}

// 参数类型定义
type ParamType = {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'file' | 'json' | 'function';

  defaultValue?: any;
};

const SharedForm = ({ interfaceName, methodName, methodConfig }: SharedFormProps) => {
  const [form] = Form.useForm();

  // 当选择的配置文件变化时，重置表单
  useEffect(() => {
    form.resetFields();
  }, [interfaceName, form]);

  // 执行 API 方法
  const handleMethodRun = async () => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }
    const values = form.getFieldsValue();
    // const interfaceName = interfaceName as V2NIMServiceType;

    let paramsArr: any[] = [];
    try {
      if (methodConfig.params) paramsArr = formatMethodParams(methodConfig.params, values, false);
    } catch (error) {
      console.error(`${interfaceName}.${methodName} API 执行终止, 格式化参数出错`, error);
      message.error('格式化参数出错');
      return;
    }

    console.log(`${interfaceName}.${methodName} API 执行开始, 入参为:`, ...paramsArr);
    // 缓存上一次执行过的 API
    localStorage.setItem(`V2NIM-${interfaceName}-${methodName}`, JSON.stringify(values));
    const method = get(window.nim, `${interfaceName}.${methodName}`);
    if (!method) return;

    // 执行 API
    const [error, methodReturn] = await to(() => {
      return (method as any).apply(window.nim?.[interfaceName], paramsArr);
    });
    if (error) {
      const err = error as V2NIMError;
      let desc = `${error.name}\n code: ${err.code}\n message: "${err.message}"\n detail: ${err.detail ? JSON.stringify(err.detail) : ''}`;
      if (err?.detail?.rawError) {
        desc += `\n rawError: ${err.detail.rawError.message}`;
      }
      console.error(`${interfaceName}.${methodName} API 执行出错: ${desc}. \nerror is`, error);
      message.error(`${interfaceName}.${methodName} API 执行出错`);
      return;
    }
    console.log(`${interfaceName}.${methodName} API 执行成功, 回参为:`, methodReturn);
    message.success(`${interfaceName}.${methodName} API 执行成功`);
    if (methodConfig.returnVar) {
      // @ts-ignore
      window[methodConfig.returnVar] = methodReturn;
      console.log(
        `${interfaceName}.${methodName} API 的返回值赋值给 window.${methodConfig.returnVar}, 即 [[${methodConfig.returnVar}]]`
      );
    }
  };

  // 重置 API 方法
  const handleMethodReset = () => {
    // const interfaceName = interfaceName as V2NIMServiceType;
    localStorage.removeItem(`V2NIM-${interfaceName}-${methodName}`);
    if (methodConfig.params) {
      const params = methodConfig.params.reduce((total: strAnyObj, next: strAnyObj) => {
        total[next.name] = next.defaultValue;
        return total;
      }, {});
      form.setFieldsValue(params);
    }
  };

  // 输出 API 调用语句
  const handleMethodOutput = () => {
    const values = form.getFieldsValue();
    // const interfaceName = interfaceName as V2NIMServiceType;

    let paramsArr: any[] = [];
    try {
      if (methodConfig.params) paramsArr = formatMethodParams(methodConfig.params, values, true);
    } catch (error) {
      console.error(`${interfaceName}.${methodName} API 执行终止, 格式化参数出错`, error);
      message.error('格式化参数出错');
      return;
    }
    let paramStr = JSON.stringify(paramsArr, null, 2);
    /**
     * 多个参数，去掉首尾括号
     *
     * 比如 paramStr = '[a, b, c]'，需要去掉括号，然后放到函数参数中: fn(a, b, c)
     */
    paramStr = paramStr.slice(1, paramStr.length - 1);

    // 将字符串形式的函数转回实际函数
    paramStr = paramStr.replace(/"function\s*\([^)]*\)\s*{[^}]*}"/g, function (match) {
      return match.slice(1, -1); // 去掉前后的双引号
    });
    // 将全局变量转为实际形式
    paramStr = paramStr.replace(/"window\.__\w+"/g, function (match) {
      return match.slice(1, -1); // 去掉前后的双引号
    });
    // console.log(`window.nim.${interfaceName}.${radioMethod}(${paramStr})`);
    message.success(`已复制调用语句到剪切板, 请粘贴到浏览器控制台执行`);
    navigator.clipboard.writeText(`await window.nim.${interfaceName}.${methodName}(${paramStr})`);
  };

  const handleBestPractice = () => {
    // const interfaceName = interfaceName as V2NIMServiceType;
    console.log(methodConfig.bestPractice);
    message.success('已在控制台输出最佳实践示例');
  };

  // 渲染配置文件对应的表单
  const renderConfigForm = () => {
    if (!methodConfig || Object.keys(methodConfig).length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
          未找到方法 {interfaceName}.{methodName} 的配置
        </div>
      );
    }

    return (
      <div className={styles.formContainer}>
        <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          {renderMethodParams()}

          <Form.Item label={null} className={styles.btnBar}>
            <Button type="primary" onClick={handleMethodRun} className={styles.btn}>
              执行
            </Button>
            <Button type="default" onClick={handleMethodReset} className={styles.btn}>
              重置
            </Button>
            <Button type="default" onClick={handleMethodOutput} className={styles.btn}>
              输出调用语句
            </Button>
            {methodConfig && methodConfig.bestPractice ? (
              <Button type="default" onClick={handleBestPractice} className={styles.btn}>
                输出最佳实践
              </Button>
            ) : null}
          </Form.Item>
        </Form>
      </div>
    );
  };

  // 渲染方法参数
  const renderMethodParams = () => {
    if (!methodConfig || !methodConfig.params || !Array.isArray(methodConfig.params))
      return (
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPINoParams}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#${interfaceName}`}
              target="_blank"
            >
              {interfaceName}.{methodName}
            </a>
          </p>
          无参数
        </Form.Item>
      );

    let result = [
      <Form.Item key="api" label={null} className={styles.leftAligned}>
        <p className={styles.interfaceAPI}>
          <a
            href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#${interfaceName}`}
            target="_blank"
          >
            {interfaceName}.{methodName}
          </a>
        </p>
      </Form.Item>,
    ];
    // 读取上一次执行过的 API
    const lastParamsStr = localStorage.getItem(`V2NIM-${interfaceName}-${methodName}`);
    if (lastParamsStr) {
      const lastParams = JSON.parse(lastParamsStr);
      const items = methodConfig.params.map((param: ParamType, index: number) => {
        return renderParamItem(param, index, lastParams[param.name]);
      });
      result = result.concat(items);
      return result;
    } else {
      const items = methodConfig.params.map((param: ParamType, index: number) => {
        return renderParamItem(param, index);
      });
      result = result.concat(items);
      return result;
    }
  };

  // 渲染单个参数项

  const renderParamItem = (param: ParamType, index: number, lastCacheValue?: any) => {
    const { name, type, defaultValue } = param;
    const value = lastCacheValue || defaultValue;
    switch (type) {
      case 'string':
      case 'function':
        return (
          <Form.Item
            key={index}
            label={name}
            name={name}
            initialValue={value || ''}
            style={{ textAlign: 'left' }}
          >
            <Input placeholder={`请输入 ${name}`} />
          </Form.Item>
        );
      case 'number':
        return (
          <Form.Item
            key={index}
            label={name}
            name={name}
            initialValue={value || 0}
            style={{ textAlign: 'left' }}
          >
            <InputNumber placeholder={`请输入 ${name}`} />
          </Form.Item>
        );
      case 'boolean':
        return (
          <Form.Item
            key={index}
            label={name}
            name={name}
            valuePropName="checked"
            initialValue={value || false}
            style={{ textAlign: 'left' }}
          >
            <Switch />
          </Form.Item>
        );
      case 'file':
        return (
          <Form.Item key={index} label={name} name={name} style={{ textAlign: 'left' }}>
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        );
      case 'json':
        return (
          <Form.Item
            key={index}
            label={name}
            name={name}
            initialValue={typeof value === 'string' ? value : JSON.stringify(value) || '{}'}
            style={{ textAlign: 'left' }}
          >
            <Input.TextArea rows={10} placeholder={`请输入 JSON 格式的 ${name}`} />
          </Form.Item>
        );
      default:
        return (
          <Form.Item
            key={index}
            label={name}
            name={name}
            initialValue={value || ''}
            style={{ textAlign: 'left' }}
          >
            <Input placeholder={`请输入 ${name}`} />
          </Form.Item>
        );
    }
  };

  const renderForm = () => {
    return renderConfigForm();
  };

  return renderForm();
};

export type { V2NIMServiceType };

export default SharedForm;
