export function formatMethodParams(
  stratigies: {
    name: string;
    type: string;
  }[],
  formData: strAnyObj,
  isOutput: boolean
) {
  if (!stratigies || !stratigies.length) return [];
  return stratigies.map(config => {
    switch (config.type) {
      case 'string':
        return String(formData[config.name]);
      case 'number':
        return Number(formData[config.name]);
      case 'boolean':
        return Boolean(formData[config.name]);
      case 'file':
        return formData[config.name].fileList[0].originFileObj;
      case 'json':
        // 检查可能的全局变量, 若存在则用对应的全局变量替换
        if (formData[config.name] && formData[config.name].indexOf('[[') === 0) {
          return formatJSONInGlobalVar(formData[config.name], isOutput);
        }
        try {
          return formatJSONWithInObject(JSON.parse(formData[config.name]), isOutput);
        } catch (error) {
          const err = error as Error;
          console.error(`参数 "${config.name}", json 格式错误: ${err.message}`);
          throw new Error(`参数 "${config.name}", json 格式错误`);
        }
      case 'function':
        if (formData[config.name] && formData[config.name].indexOf('return function') === 0) {
          return isOutput
            ? formData[config.name].replace('return function', 'function')
            : new Function(formData[config.name])();
        }
        break;
      default:
        return formData[config.name];
    }
  });
}

function formatJSONInGlobalVar(obj: string, isOutput = false) {
  if (obj.indexOf('[[') === 0) {
    const globalVar = obj.replace(/\[\[/g, '').replace(/\]\]/g, '');
    const result = window[globalVar as never];
    if (result) {
      return isOutput ? `window.${globalVar}` : result;
    } else {
      throw new Error(`全局变量 "${globalVar}" 不存在`);
    }
  }
  return obj;
}

function formatJSONWithInObject(obj: strAnyObj, isOutput = false) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      if (obj[key].indexOf('return function') === 0) {
        obj[key] = isOutput
          ? obj[key].replace('return function', 'function')
          : new Function(obj[key])();
      }
      // if (obj[key].indexOf('[[') === 0) {
      //   const globalVar = obj[key].replace(/\[\[/g, '').replace(/\]\]/g, '');
      //   obj[key] = window[globalVar];
      // }
    }
  }
  return obj;
}
