import { StrAnyObj } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/types';

export type V2APIParamsType = 'number' | 'string' | 'boolean' | 'json' | 'file' | 'function';

// export type V2APIMap = {
//   // key 为 API 名称
//   [key: string]: {
//     // API 简介
//     name: string;
//     // 实例, 聊天室必须指定是 chatroomV2. nim 可以不指定
//     instance?: string;
//     // 回参
//     returnVar?: string;
//     // 额外依赖的视图, 如上传需要一个 DOM 存放文件
//     externalView?: string;
//     // API 入参描述
//     params?: {
//       // 参数名称
//       name: string;
//       // 参数类型
//       type: V2APIParamsType;
//       // 参数默认值
//       defaultValue?: string | boolean | number | StrAnyObj;
//     }[];
//     bestPractice?: string;
//   };
// };

export type V2API = {
  // API 简介
  name: string;
  // 实例, 聊天室必须指定是 chatroomV2. nim 可以不指定
  instance?: string;
  // 回参
  returnVar?: string;
  // 额外依赖的视图, 如上传需要一个 DOM 存放文件
  externalView?: string;
  // API 入参描述
  params?: {
    // 参数名称
    name: string;
    // 参数类型
    type: V2APIParamsType;
    // 参数默认值
    defaultValue?: string | boolean | number | StrAnyObj;
  }[];
  bestPractice?: string;
};
