export const sceneMenuItems: any[] = [
  {
    key: '/scenes',
    label: '场景总览',
  },
  {
    key: 'init & login',
    label: '初始化登录',
    type: 'group',
    children: [
      {
        key: '/scenes/init',
        label: '初始化',
      },
      {
        key: '/scenes/login',
        label: '登录',
      },
    ],
  },
  {
    key: 'conversation',
    label: '会话',
    type: 'group',
    children: [
      {
        key: '/scenes/local-conversation',
        label: '本地会话',
      },
    ],
  },
];
