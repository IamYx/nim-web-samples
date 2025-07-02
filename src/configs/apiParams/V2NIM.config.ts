// 导入配置文件
import V2NIMAIService from './V2NIMAIService';
import V2NIMClientAntispamUtil from './V2NIMClientAntispamUtil';
import V2NIMConversationGroupService from './V2NIMConversationGroupService';
import V2NIMConversationIdUtil from './V2NIMConversationIdUtil';
import V2NIMConversationService from './V2NIMConversationService';
import V2NIMFriendService from './V2NIMFriendService';
import V2NIMLocalConversationService from './V2NIMLocalConversationService';
import V2NIMLoginService from './V2NIMLoginService';
import V2NIMMessageAttachmentCreator from './V2NIMMessageAttachmentCreator';
import V2NIMMessageConverter from './V2NIMMessageConverter';
import V2NIMMessageCreator from './V2NIMMessageCreator';
import V2NIMMessageService from './V2NIMMessageService';
import V2NIMNotificationService from './V2NIMNotificationService';
import V2NIMPassthroughService from './V2NIMPassthroughService';
import V2NIMSettingService from './V2NIMSettingService';
import V2NIMSignallingService from './V2NIMSignallingService';
import V2NIMStorageService from './V2NIMStorageService';
import V2NIMSubscriptionService from './V2NIMSubscriptionService';
import V2NIMTeamService from './V2NIMTeamService';
import V2NIMUserService from './V2NIMUserService';

// 配置文件映射
export const V2NIMConfigMap = {
  V2NIMAIService,
  V2NIMLoginService,
  V2NIMLocalConversationService,
  V2NIMConversationService,
  V2NIMConversationIdUtil,
  V2NIMConversationGroupService,
  V2NIMMessageCreator,
  V2NIMMessageAttachmentCreator,
  V2NIMMessageConverter,
  V2NIMMessageService,
  V2NIMNotificationService,
  V2NIMStorageService,
  V2NIMClientAntispamUtil,
  V2NIMTeamService,
  V2NIMUserService,
  V2NIMFriendService,
  V2NIMSettingService,
  V2NIMSignallingService,
  V2NIMSubscriptionService,
  V2NIMPassthroughService,
};

export type V2NIMServiceType =
  | 'V2NIMAIService'
  | 'V2NIMLoginService'
  | 'V2NIMLocalConversationService'
  | 'V2NIMConversationService'
  | 'V2NIMConversationIdUtil'
  | 'V2NIMConversationGroupService'
  | 'V2NIMMessageCreator'
  | 'V2NIMMessageAttachmentCreator'
  | 'V2NIMMessageConverter'
  | 'V2NIMMessageService'
  | 'V2NIMNotificationService'
  | 'V2NIMStorageService'
  | 'V2NIMClientAntispamUtil'
  | 'V2NIMTeamService'
  | 'V2NIMUserService'
  | 'V2NIMFriendService'
  | 'V2NIMSettingService'
  | 'V2NIMSignallingService'
  | 'V2NIMSubscriptionService'
  | 'V2NIMPassthroughService';
