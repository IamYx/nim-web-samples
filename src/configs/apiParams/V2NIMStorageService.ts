import { V2API } from './types';

const apis: Record<string, V2API> = {
  addCustomStorageScene: {
    name: '添加存储场景',
    params: [
      {
        name: 'sceneName',
        type: 'string',
      },
      {
        name: 'expireTime',
        type: 'number',
      },
    ],
  },
  getStorageSceneList: {
    name: '查询存储场景列表',
    params: [],
  },
  createUploadFileTask: {
    name: '创建文件上传任务',
    externalView: '<input type="file" id="nim-external">',
    returnVar: '__uploadTask',
    params: [
      {
        name: 'fileParams',
        type: 'json',
        defaultValue: {
          fileObj: 'nim-external',
          sceneName: 'nim_default_im',
        },
      },
    ],
  },
  uploadFile: {
    name: '上传文件',
    params: [
      {
        name: 'fileTask',
        type: 'json',
        defaultValue: '[[__uploadTask]]',
      },
      {
        name: 'progress',
        type: 'function',
        defaultValue: `return function(progress) { console.log('上传中', progress) }`,
      },
    ],
  },
  uploadFileWithMetaInfo: {
    name: '上传文件并返回媒体信息',
    params: [
      {
        name: 'fileTask',
        type: 'json',
        defaultValue: '[[__uploadTask]]',
      },
      {
        name: 'progress',
        type: 'function',
        defaultValue: `return function(progress) { console.log('上传中', progress) }`,
      },
    ],
  },
  cancelUploadFile: {
    name: '取消上传文件',
    params: [
      {
        name: 'fileTask',
        type: 'json',
        defaultValue: '[[__uploadTask]]',
      },
    ],
  },
  shortUrlToLong: {
    name: '短链接转长链接',
    params: [
      {
        name: 'url',
        type: 'string',
      },
    ],
  },
  getImageThumbUrl: {
    name: '生成缩略图链接',
    instance: 'chatroomV2',
    params: [
      {
        name: 'attachment',
        type: 'json',
      },
      {
        name: 'thumbSize',
        type: 'json',
        defaultValue: {
          width: 100,
          height: 100,
        },
      },
    ],
  },
  getVideoCoverUrl: {
    name: '生成视频封面图链接',
    instance: 'chatroomV2',
    params: [
      {
        name: 'attachment',
        type: 'json',
      },
      {
        name: 'thumbSize',
        type: 'json',
        defaultValue: {
          width: 100,
          height: 100,
        },
      },
    ],
  },
};
export default apis;
