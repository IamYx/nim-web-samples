// 导入配置文件
import V2NIMChatroomMessageCreator from './V2NIMChatroomMessageCreator';
import V2NIMChatroomQueueService from './V2NIMChatroomQueueService';
import V2NIMChatroomService from './V2NIMChatroomService';
import V2NIMChatroomStorageService from './V2NIMChatroomStorageService';

// 配置文件映射
export const V2ChatroomConfigMap = {
  V2NIMChatroomMessageCreator,
  V2NIMChatroomQueueService,
  V2NIMChatroomService,
  V2NIMChatroomStorageService,
};

export type V2ChatroomServiceType =
  | 'V2NIMChatroomMessageCreator'
  | 'V2NIMChatroomQueueService'
  | 'V2NIMChatroomService'
  | 'V2NIMChatroomStorageService';
