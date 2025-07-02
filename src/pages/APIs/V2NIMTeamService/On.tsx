import { Button, Card, Form, Space, Typography, message } from 'antd';
import {
  V2NIMTeam,
  V2NIMTeamMember,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService';
import { V2NIMError } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/types';

import styles from '../nim.module.less';

const { Text } = Typography;

const storageKey = `V2NIMTeamService.on`;

const OnPage = () => {
  // 表单数据
  const [form] = Form.useForm();

  // 同步开始
  const onSyncStarted = () => {
    message.info(`收到 V2NIMTeamService 模块的 onSyncStarted 事件, 详情见控制台`);
    console.log('群组信息同步开始');
  };

  // 同步完成
  const onSyncFinished = () => {
    message.success(`收到 V2NIMTeamService 模块的 onSyncFinished 事件, 详情见控制台`);
    console.log('群组信息同步完成');
  };

  // 同步失败
  const onSyncFailed = (error: V2NIMError) => {
    message.error(`收到 V2NIMTeamService 模块的 onSyncFailed 事件, 详情见控制台`);
    console.log('群组信息同步失败:', error);
  };

  // 群组创建
  const onTeamCreated = (team: V2NIMTeam) => {
    message.success(
      `收到 V2NIMTeamService 模块的 onTeamCreated 事件, 群组: ${team.name || team.teamId}, 详情见控制台`
    );
    console.log('群组被创建:', team);
  };

  // 群组解散
  const onTeamDismissed = (team: V2NIMTeam) => {
    message.warning(
      `收到 V2NIMTeamService 模块的 onTeamDismissed 事件, 群组: ${team.name || team.teamId}, 详情见控制台`
    );
    console.log('群组被解散:', team);
  };

  // 加入群组
  const onTeamJoined = (team: V2NIMTeam) => {
    message.success(
      `收到 V2NIMTeamService 模块的 onTeamJoined 事件, 群组: ${team.name || team.teamId}, 详情见控制台`
    );
    console.log('(自己)加入群组:', team);
  };

  // 离开群组
  const onTeamLeft = (team: V2NIMTeam, isKicked: boolean) => {
    const reason = isKicked ? '被踢出' : '主动离开';
    message.warning(
      `收到 V2NIMTeamService 模块的 onTeamLeft 事件, ${reason}群组: ${team.name || team.teamId}, 详情见控制台`
    );
    console.log('(自己)离开群组:', { team, isKicked, reason });
  };

  // 群组信息更新
  const onTeamInfoUpdated = (team: V2NIMTeam) => {
    message.info(
      `收到 V2NIMTeamService 模块的 onTeamInfoUpdated 事件, 群组: ${team.name || team.teamId}, 详情见控制台`
    );
    console.log('群组信息更新:', team);
  };

  // 群组成员加入
  const onTeamMemberJoined = (teamMembers: V2NIMTeamMember[]) => {
    const memberNames = teamMembers
      .map(m => (m.memberRole ? `${m.accountId}(${getRoleText(m.memberRole)})` : m.accountId))
      .join(', ');
    message.success(
      `收到 V2NIMTeamService 模块的 onTeamMemberJoined 事件, 成员: ${memberNames}, 详情见控制台`
    );
    console.log('群组成员加入:', teamMembers);
  };

  // 群组成员被踢
  const onTeamMemberKicked = (operatorAccountId: string, teamMembers: V2NIMTeamMember[]) => {
    const memberNames = teamMembers.map(m => m.accountId).join(', ');
    message.warning(
      `收到 V2NIMTeamService 模块的 onTeamMemberKicked 事件, 操作者: ${operatorAccountId}, 被踢成员: ${memberNames}, 详情见控制台`
    );
    console.log('群组成员被踢:', { operatorAccountId, teamMembers });
  };

  // 群组成员离开
  const onTeamMemberLeft = (teamMembers: V2NIMTeamMember[]) => {
    const memberNames = teamMembers.map(m => m.accountId).join(', ');
    message.warning(
      `收到 V2NIMTeamService 模块的 onTeamMemberLeft 事件, 离开成员: ${memberNames}, 详情见控制台`
    );
    console.log('群组成员离开:', teamMembers);
  };

  // 群组成员信息更新
  const onTeamMemberInfoUpdated = (teamMembers: V2NIMTeamMember[]) => {
    const memberNames = teamMembers.map(m => m.accountId).join(', ');
    message.info(
      `收到 V2NIMTeamService 模块的 onTeamMemberInfoUpdated 事件, 更新成员: ${memberNames}, 详情见控制台`
    );
    console.log('群组成员信息更新:', teamMembers);
  };

  // 群组申请动作
  const onReceiveTeamJoinActionInfo = (joinActionInfo: any) => {
    message.info(`收到 V2NIMTeamService 模块的 onReceiveTeamJoinActionInfo 事件, 详情见控制台`);
    console.log('收到群组申请动作信息:', joinActionInfo);
  };

  // 获取角色文本
  const getRoleText = (role: number) => {
    switch (role) {
      case 0:
        return '普通成员';
      case 1:
        return '管理员';
      case 2:
        return '群主';
      default:
        return `未知角色(${role})`;
    }
  };

  // 设置事件监听
  const handleSetListener = async () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 设置前先取消一遍能防止重复监听
    window.nim.V2NIMTeamService.off('onSyncStarted', onSyncStarted);
    window.nim.V2NIMTeamService.off('onSyncFinished', onSyncFinished);
    window.nim.V2NIMTeamService.off('onSyncFailed', onSyncFailed);
    window.nim.V2NIMTeamService.off('onTeamCreated', onTeamCreated);
    window.nim.V2NIMTeamService.off('onTeamDismissed', onTeamDismissed);
    window.nim.V2NIMTeamService.off('onTeamJoined', onTeamJoined);
    window.nim.V2NIMTeamService.off('onTeamLeft', onTeamLeft);
    window.nim.V2NIMTeamService.off('onTeamInfoUpdated', onTeamInfoUpdated);
    window.nim.V2NIMTeamService.off('onTeamMemberJoined', onTeamMemberJoined);
    window.nim.V2NIMTeamService.off('onTeamMemberKicked', onTeamMemberKicked);
    window.nim.V2NIMTeamService.off('onTeamMemberLeft', onTeamMemberLeft);
    window.nim.V2NIMTeamService.off('onTeamMemberInfoUpdated', onTeamMemberInfoUpdated);
    window.nim.V2NIMTeamService.off('onReceiveTeamJoinActionInfo', onReceiveTeamJoinActionInfo);

    // 设置监听
    window.nim.V2NIMTeamService.on('onSyncStarted', onSyncStarted);
    window.nim.V2NIMTeamService.on('onSyncFinished', onSyncFinished);
    window.nim.V2NIMTeamService.on('onSyncFailed', onSyncFailed);
    window.nim.V2NIMTeamService.on('onTeamCreated', onTeamCreated);
    window.nim.V2NIMTeamService.on('onTeamDismissed', onTeamDismissed);
    window.nim.V2NIMTeamService.on('onTeamJoined', onTeamJoined);
    window.nim.V2NIMTeamService.on('onTeamLeft', onTeamLeft);
    window.nim.V2NIMTeamService.on('onTeamInfoUpdated', onTeamInfoUpdated);
    window.nim.V2NIMTeamService.on('onTeamMemberJoined', onTeamMemberJoined);
    window.nim.V2NIMTeamService.on('onTeamMemberKicked', onTeamMemberKicked);
    window.nim.V2NIMTeamService.on('onTeamMemberLeft', onTeamMemberLeft);
    window.nim.V2NIMTeamService.on('onTeamMemberInfoUpdated', onTeamMemberInfoUpdated);
    window.nim.V2NIMTeamService.on('onReceiveTeamJoinActionInfo', onReceiveTeamJoinActionInfo);

    message.success('成功设置群组服务监听');
    console.log('群组服务监听已设置');
  };

  // 移除所有监听器
  const handleRemoveAllListeners = () => {
    if (!window.nim) {
      message.error('NIM SDK 未初始化，请先进行初始化操作');
      return;
    }

    // 取消掉所有群组服务相关的监听
    window.nim.V2NIMTeamService.removeAllListeners('onSyncStarted');
    window.nim.V2NIMTeamService.removeAllListeners('onSyncFinished');
    window.nim.V2NIMTeamService.removeAllListeners('onSyncFailed');
    window.nim.V2NIMTeamService.removeAllListeners('onTeamCreated');
    window.nim.V2NIMTeamService.removeAllListeners('onTeamDismissed');
    window.nim.V2NIMTeamService.removeAllListeners('onTeamJoined');
    window.nim.V2NIMTeamService.removeAllListeners('onTeamLeft');
    window.nim.V2NIMTeamService.removeAllListeners('onTeamInfoUpdated');
    window.nim.V2NIMTeamService.removeAllListeners('onTeamMemberJoined');
    window.nim.V2NIMTeamService.removeAllListeners('onTeamMemberKicked');
    window.nim.V2NIMTeamService.removeAllListeners('onTeamMemberLeft');
    window.nim.V2NIMTeamService.removeAllListeners('onTeamMemberInfoUpdated');
    window.nim.V2NIMTeamService.removeAllListeners('onReceiveTeamJoinActionInfo');

    message.success('已取消所有群组服务监听');
    console.log('所有群组服务监听已取消');
  };

  // 输出监听设置代码到控制台
  const handleOutputCode = () => {
    const code = `
// 设置群组服务监听
const setupTeamServiceListeners = () => {
  // 同步相关事件
  window.nim.V2NIMTeamService.on('onSyncStarted', () => {
    console.log('群组信息同步开始');
  });

  window.nim.V2NIMTeamService.on('onSyncFinished', () => {
    console.log('群组信息同步完成');
  });

  window.nim.V2NIMTeamService.on('onSyncFailed', (error) => {
    console.log('群组信息同步失败:', error);
  });

  // 群组操作事件
  window.nim.V2NIMTeamService.on('onTeamCreated', (team) => {
    console.log('群组被创建:', team);
  });

  window.nim.V2NIMTeamService.on('onTeamDismissed', (team) => {
    console.log('群组被解散:', team);
  });

  window.nim.V2NIMTeamService.on('onTeamJoined', (team) => {
    console.log('(自己)加入群组:', team);
  });

  window.nim.V2NIMTeamService.on('onTeamLeft', (team, isKicked) => {
    console.log('(自己)离开群组:', { team, isKicked });
  });

  window.nim.V2NIMTeamService.on('onTeamInfoUpdated', (team) => {
    console.log('群组信息更新:', team);
  });

  // 群组成员事件
  window.nim.V2NIMTeamService.on('onTeamMemberJoined', (teamMembers) => {
    console.log('群组成员加入:', teamMembers);
  });

  window.nim.V2NIMTeamService.on('onTeamMemberKicked', (operatorAccountId, teamMembers) => {
    console.log('群组成员被踢:', { operatorAccountId, teamMembers });
  });

  window.nim.V2NIMTeamService.on('onTeamMemberLeft', (teamMembers) => {
    console.log('群组成员离开:', teamMembers);
  });

  window.nim.V2NIMTeamService.on('onTeamMemberInfoUpdated', (teamMembers) => {
    console.log('群组成员信息更新:', teamMembers);
  });

  // 群组申请事件
  window.nim.V2NIMTeamService.on('onReceiveTeamJoinActionInfo', (joinActionInfo) => {
    console.log('收到群组申请动作信息:', joinActionInfo);
  });
};

// 调用设置函数
setupTeamServiceListeners();
`;

    console.log('V2NIMTeamService 监听设置代码:');
    console.log(code);
    message.success('监听设置代码已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ marginTop: 24 }}>
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMTeamService`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>
        <Form.Item label={'操作项'}>
          <Space size="middle" style={{ width: '100%', flexWrap: 'wrap' }}>
            <Button type="primary" onClick={handleSetListener} style={{ minWidth: 120 }}>
              设置监听
            </Button>
            <Button type="default" danger onClick={handleRemoveAllListeners}>
              取消所有监听
            </Button>
            <Button type="default" onClick={handleOutputCode}>
              输出监听代码
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 事件说明 */}
      <Card title="监听事件说明" style={{ marginTop: 16 }} size="small">
        <div style={{ marginBottom: 16 }}>
          <Text strong>同步相关事件：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>onSyncStarted</Text> - 群组信息同步开始
            </li>
            <li>
              <Text code>onSyncFinished</Text> - 群组信息同步完成
            </li>
            <li>
              <Text code>onSyncFailed</Text> - 群组信息同步失败
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>群组操作事件：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>onTeamCreated</Text> - 群组被创建（包括多端同步和初始化同步）
            </li>
            <li>
              <Text code>onTeamDismissed</Text> - 群组被解散
            </li>
            <li>
              <Text code>onTeamJoined</Text> -
              自己加入某群（被邀请后接受邀请、申请通过、或直接被拉入群组）
            </li>
            <li>
              <Text code>onTeamLeft</Text> - 自己离开群组（主动离开或被管理员踢出）
            </li>
            <li>
              <Text code>onTeamInfoUpdated</Text> - 群组信息更新
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>群组成员事件：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>onTeamMemberJoined</Text> - 群组成员加入（非本账号的用户加入群组）
            </li>
            <li>
              <Text code>onTeamMemberKicked</Text> - 群组成员被踢
            </li>
            <li>
              <Text code>onTeamMemberLeft</Text> - 群组成员退出群组
            </li>
            <li>
              <Text code>onTeamMemberInfoUpdated</Text> - 群组成员信息变更
            </li>
          </ul>
        </div>

        <div>
          <Text strong>群组申请事件：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>
              <Text code>onReceiveTeamJoinActionInfo</Text> - 群组申请动作
              <ul style={{ marginTop: 4 }}>
                <li>管理员收到入群申请</li>
                <li>申请人收到入群申请被拒绝</li>
                <li>成员收到入群邀请</li>
                <li>管理员收到入群邀请被拒绝</li>
              </ul>
            </li>
          </ul>
        </div>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>本页面演示 V2NIMTeamService 的事件监听功能</li>
          <li>设置监听后，相关的群组操作会触发对应事件并显示消息提示</li>
          <li>对同一个事件 on 监听多次，都会生效并触发多次，使用时注意防止重复监听</li>
          <li>
            建议在 <Text code>onSyncFinished</Text> 事件告知数据同步完毕后，
            再使用群组模块数据，以保证数据完整性
          </li>
          <li>使用"取消所有监听"可以一次性移除所有已设置的监听器</li>
          <li>
            <Text type="success">注意：设置监听后，可以去其他群组相关页面进行操作来触发事件：</Text>
            <ul style={{ marginTop: 4 }}>
              <li>创建群组 → 触发 onTeamCreated</li>
              <li>加入群组 → 触发 onTeamJoined</li>
              <li>邀请成员 → 触发 onTeamMemberJoined</li>
              <li>踢出成员 → 触发 onTeamMemberKicked</li>
              <li>离开群组 → 触发 onTeamLeft</li>
              <li>解散群组 → 触发 onTeamDismissed</li>
              <li>修改群组信息 → 触发 onTeamInfoUpdated</li>
              <li>修改成员角色 → 触发 onTeamMemberInfoUpdated</li>
            </ul>
          </li>
          <li>所有事件都会在控制台输出详细信息，方便调试和学习</li>
        </ul>
      </Card>

      {/* API 参数说明 */}
      <Card title="事件回调参数说明" style={{ marginTop: 16 }} size="small">
        <div style={{ marginBottom: 16 }}>
          <Text strong>V2NIMTeam 群组对象：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>teamId: 群组ID</li>
            <li>teamType: 群组类型（1=高级群，2=超大群）</li>
            <li>name: 群组名称</li>
            <li>intro: 群组介绍</li>
            <li>announcement: 群组公告</li>
            <li>avatar: 群组头像</li>
            <li>ownerAccountId: 群主账号ID</li>
            <li>memberCount: 群成员数</li>
            <li>maxMemberCount: 最大成员数</li>
            <li>createTime: 创建时间</li>
            <li>updateTime: 更新时间</li>
          </ul>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>V2NIMTeamMember 群成员对象：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>teamId: 群组ID</li>
            <li>accountId: 成员账号ID</li>
            <li>memberRole: 成员角色（0=普通成员，1=管理员，2=群主）</li>
            <li>teamNick: 群昵称</li>
            <li>joinTime: 加入时间</li>
            <li>inviterAccountId: 邀请人账号ID</li>
          </ul>
        </div>

        <div>
          <Text strong>V2NIMTeamJoinActionInfo 申请动作对象：</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>actionType: 动作类型</li>
            <li>teamId: 群组ID</li>
            <li>applicantAccountId: 申请人账号ID</li>
            <li>actionStatus: 动作状态</li>
            <li>requestMsg: 申请消息</li>
            <li>attachmentMsg: 附加消息</li>
          </ul>
        </div>
      </Card>

      {/* 重要提醒 */}
      <Card
        title="⚠️ 重要提醒"
        style={{
          marginTop: 16,
          border: '2px solid #ff9c6e',
          backgroundColor: '#fff7e6',
        }}
        size="small"
        styles={{
          header: {
            backgroundColor: '#ffe7ba',
            color: '#d46b08',
            fontWeight: 'bold',
          },
        }}
      >
        <ul style={{ margin: 0, paddingLeft: 20, color: '#d46b08' }}>
          <li>
            <strong>确保SDK已初始化并登录成功</strong>
          </li>
          <li>群组事件监听在数据同步完成后才会正常工作</li>
          <li>建议在 onSyncFinished 事件后再进行群组相关操作</li>
          <li>onTeamJoined 和 onTeamLeft 事件只针对当前登录用户</li>
          <li>onTeamMemberJoined、onTeamMemberLeft、onTeamMemberKicked 事件针对其他用户</li>
          <li>
            <strong>重复设置监听会导致同一事件触发多次</strong>
          </li>
          <li>群组申请事件需要根据 actionType 区分不同的申请类型</li>
          <li>
            <strong>及时移除不需要的监听器以避免内存泄漏</strong>
          </li>
          <li>所有群组操作都是异步的，需要通过事件回调获取最终结果</li>
        </ul>
      </Card>
    </div>
  );
};

export default OnPage;
