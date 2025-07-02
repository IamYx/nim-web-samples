/**
 * 安全执行函数：接收一个函数（可能返回 Promise 或同步值），统一返回 Promise 包裹的元组 [error, data]
 * 能够捕获同步抛出的错误和异步 Promise reject
 *
 * @param {() => T | Promise<T>} fn - 要执行的函数，可能返回同步值或 Promise
 * @returns {Promise<[Error | null, T | undefined]>} - 返回一个 Promise 对象，该对象解析为一个包含错误和数据的元组
 * @example
 * ```
 * // 处理可能同步抛错的 API 调用
 * const [error1, data1] = await to(() =>
 *   window.nim.someService.someMethod(params)
 * )
 *
 * // 处理异步 Promise
 * const [error2, data2] = await to(() => fetch('https://api.example.com'))
 *
 * // 处理同步函数
 * const [error3, data3] = await to(() => JSON.parse(jsonString))
 *
 * if (error1) {
 *   console.error('API call error', error1)
 *   return
 * }
 * console.log('success and get', data1)
 * ```
 */
export function to<T>(fn: () => T | Promise<T>): Promise<[Error | null, T | undefined]> {
  try {
    // 尝试执行函数
    const result = fn();

    // 判断结果是否为 Promise
    if (
      result &&
      typeof result === 'object' &&
      'then' in result &&
      typeof result.then === 'function'
    ) {
      // 处理 Promise 情况
      return (result as Promise<T>)
        .then<[null, T]>((data: T) => [null, data])
        .catch<[Error, undefined]>((error: Error) => [error, undefined]);
    } else {
      // 处理同步返回值
      return Promise.resolve([null, result] as [null, T]);
    }
  } catch (error) {
    // 捕获同步抛出的错误
    const err = error instanceof Error ? error : new Error(String(error));
    return Promise.resolve([err, undefined] as [Error, undefined]);
  }
}
