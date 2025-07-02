export function getInitialValues<T>(storageKey: string, defaultValue: T): T {
  try {
    const storedValue = localStorage.getItem(storageKey);
    if (storedValue) {
      return JSON.parse(storedValue);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    // console.warn('从 localStorage 读取初始值失败:', error);
  }
  return defaultValue;
}

// 生成可读的对象字符串，支持函数
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stringifyWithFunctions(obj: any, indent = 2): string {
  const spaces = ' '.repeat(indent);
  const entries = Object.entries(obj).map(([key, value]) => {
    if (typeof value === 'function') {
      return `${spaces}${key}: ${value.toString()}`;
    } else if (typeof value === 'string') {
      return `${spaces}${key}: "${value}"`;
    } else {
      return `${spaces}${key}: ${JSON.stringify(value)}`;
    }
  });

  return `{\n${entries.join(',\n')}\n}`;
}
