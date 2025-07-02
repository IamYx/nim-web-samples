import { V2API } from './types';

const apis: Record<string, V2API> = {
  createTeam: {
    name: '创建群',
    params: [
      {
        name: 'createTeamParams',
        type: 'json',
        defaultValue: {
          name: '群名',
          teamType: 1,
          memberLimit: 200,
          joinMode: 0,
          agreeMode: 0,
          inviteMode: 0,
          updateInfoMode: 0,
          updateExtensionMode: 0,
          chatBannedMode: 0,
        },
      },
      {
        name: 'inviteeAccountIds',
        type: 'json',
        defaultValue: ['cs1'],
      },
      {
        name: 'postscript',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'antispamConfig',
        type: 'json',
        defaultValue: {},
      },
    ],
  },
  updateTeamInfo: {
    name: '更新群',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'updateTeamInfoParams',
        type: 'json',
        defaultValue: {
          name: '群名1',
          memberLimit: 200,
          joinMode: 0,
          agreeMode: 0,
          inviteMode: 0,
          updateInfoMode: 0,
          updateExtensionMode: 0,
          chatBannedMode: 0,
        },
      },
      {
        name: 'antispamConfig',
        type: 'json',
        defaultValue: {},
      },
    ],
  },
  leaveTeam: {
    name: '离开群',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
    ],
  },
  getTeamInfo: {
    name: '查询某群信息',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
    ],
  },
  getJoinedTeamList: {
    name: '获取当前已经加入的群组列表',
    params: [
      {
        name: 'teamTypes',
        type: 'json',
        defaultValue: [1],
      },
    ],
  },
  getJoinedTeamCount: {
    name: '获取当前已经加入的群组数量',
    params: [
      {
        name: 'teamTypes',
        type: 'json',
        defaultValue: [1],
      },
    ],
  },
  getTeamInfoByIds: {
    name: '通过 id 列表查询群信息',
    params: [
      {
        name: 'teamIds',
        type: 'json',
        defaultValue: [],
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
    ],
  },

  dismissTeam: {
    name: '解散群',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
    ],
  },
  inviteMember: {
    name: '邀请成员加入群',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'inviteeAccountIds',
        type: 'json',
        defaultValue: [],
      },
      {
        name: 'postscript',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  inviteMemberEx: {
    name: '邀请成员加入群',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'inviteeParams',
        type: 'json',
        defaultValue: {
          inviteeAccountIds: [],
          postscript: '',
          serverExtension: '',
        },
      },
    ],
  },
  acceptInvitation: {
    name: '接受邀请入群',
    params: [
      {
        name: 'invitationInfo',
        type: 'json',
        defaultValue: {},
      },
    ],
  },
  rejectInvitation: {
    name: '拒绝邀请入群',
    params: [
      {
        name: 'invitationInfo',
        type: 'json',
        defaultValue: {},
      },
      {
        name: 'postscript',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  kickMember: {
    name: '踢出群组成员',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'memberAccountIds',
        type: 'json',
        defaultValue: [],
      },
    ],
  },
  applyJoinTeam: {
    name: '(用户)申请加入群组',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'postscript',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  acceptJoinApplication: {
    name: '(管理员)接受(用户的)入群申请',
    params: [
      {
        name: 'invitationInfo',
        type: 'json',
        defaultValue: {},
      },
    ],
  },
  rejectJoinApplication: {
    name: '(管理员)拒绝(用户的)入群申请',
    params: [
      {
        name: 'invitationInfo',
        type: 'json',
        defaultValue: {},
      },
      {
        name: 'postscript',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  updateTeamMemberRole: {
    name: '设置成员角色',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'memberAccountIds',
        type: 'json',
        defaultValue: [],
      },
      {
        name: 'memberRole',
        type: 'number',
        defaultValue: 0,
      },
    ],
  },
  transferTeamOwner: {
    name: '移交群主',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'accountId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'leave',
        type: 'boolean',
        defaultValue: false,
      },
    ],
  },
  updateSelfTeamMemberInfo: {
    name: '修改自己的群成员信息',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'memberInfoParams',
        type: 'json',
        defaultValue: {
          teamNick: '',
          serverExtension: '',
        },
      },
    ],
  },
  updateTeamMemberNick: {
    name: '修改群成员昵称',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'accountId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'nick',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  setTeamChatBannedMode: {
    name: '设置群组禁言模式',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'chatBannedMode',
        type: 'number',
        defaultValue: 0,
      },
    ],
  },
  setTeamMemberChatBannedStatus: {
    name: '设置群组成员聊天禁言状态',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'accountId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'chatBanned',
        type: 'boolean',
        defaultValue: false,
      },
    ],
  },
  getTeamMemberList: {
    name: '获取群成员列表',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'queryOption',
        type: 'json',
        defaultValue: {
          roleQueryType: 0,
          onlyChatBanned: false,
          direction: 0,
          limit: 100,
          nextToken: '',
        },
      },
    ],
  },
  getTeamMemberListByIds: {
    name: '根据账号 ID 列表获取群组成员列表',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'accountIds',
        type: 'json',
        defaultValue: [],
      },
    ],
  },
  getTeamMemberInvitor: {
    name: '根据账号 ID 列表获取群组成员邀请人',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'accountIds',
        type: 'json',
        defaultValue: [],
      },
    ],
  },
  getTeamJoinActionInfoList: {
    name: '获取群加入, 邀请等相关信息',
    params: [
      {
        name: 'option',
        type: 'json',
        defaultValue: {
          types: [0, 1, 2, 3],
          status: [0, 1, 2, 3],
          offset: 0,
          limit: 50,
        },
      },
    ],
  },
  clearAllTeamJoinActionInfo: {
    name: '清空所有群申请',
    params: [],
  },

  deleteTeamJoinActionInfo: {
    name: '删除群申请',
    params: [
      {
        name: 'applicationInfo',
        type: 'json',
        defaultValue: {
          actionType: 0,
          teamId: '2348598524',
          teamType: 1,
          operatorAccountId: 'ctt1',
          postscript: 'xxx',
          timestamp: 1729240254764,
          actionStatus: 1,
        },
      },
    ],
  },
  searchTeamByKeyword: {
    name: '根据关键字搜索群组',
    params: [
      {
        name: 'keyword',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
  addTeamMembersFollow: {
    name: '添加群组特别关注',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'accountIds',
        type: 'json',
        defaultValue: [],
      },
    ],
  },
  removeTeamMembersFollow: {
    name: '移除群组特别关注',
    params: [
      {
        name: 'teamId',
        type: 'string',
        defaultValue: '',
      },
      {
        name: 'teamType',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'accountIds',
        type: 'json',
        defaultValue: [],
      },
    ],
  },
};
export default apis;
