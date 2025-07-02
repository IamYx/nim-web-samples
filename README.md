网易云信即时通讯 IM Elite SDK，为 web sdk 的下一代版本，提供完善的即时通信功能开发框架，屏蔽其内部复杂细节，对外提供较为简洁的 API 接口，方便第三方应用快速集成即时通信功能。

IM Elite SDK 分为 V1 和 V2 两个版本。V2 对 V1 的 API 接口做了大幅调整，并与其它客户端对齐。其中 V1 版本号 < 1，V2 版本号 >= 10。

## 安装

如果你是新用户，推荐使用 V2 API 的SDK，安装方式为:

```
npm install nim-web-sdk-ng@">=10"
```

如果你是现有 V1 增强版用户，可使用下面命令安装 SDK。或者使用固定版本号安装

```
npm install nim-web-sdk-ng@"<1"
```

## IM V2

### sdk 选择

sdk 默认提供以下几种形式。其中 sdk 默认入口为 dist/v2/NIM_BROWSER_SDK.js。
注意，v2 暂未提供 QCHAT SDK。v2 IM SDK 接口兼容 v1 IM SDK。所以 v1 文件夹中没有构建 IM SDK。

```
dist/
  |── v2
    ├── NIM_BROWSER_SDK.js       v2 IM 浏览器适配版 UMD 格式
    ├── NIM_MINIAPP_SDK.js       v2 IM 小程序适配版 UMD 格式
    ├── NIM_UNIAPP_SDK.js        v2 IM UNIAPP 适配版 UMD 格式
    ├── CHATROOM_BROWSER_SDK.js  v2 聊天室浏览器适配版 UMD 格式
    ├── CHATROOM_MINIAPP_SDK.js  v2 聊天室小程序适配版 UMD 格式
    ├── CHATROOM_UNIAPP_SDK.js   v2 聊天室 UNIAPP 适配版 UMD 格式
  |── v1
    ├── CHATROOM_BROWSER_SDK.js  v1 聊天室浏览器适配版 UMD 格式
    ├── CHATROOM_MINIAPP_SDK.js  v1 聊天室小程序适配版 UMD 格式
    ├── CHATROOM_UNIAPP_SDK.js   v1 聊天室 UNIAPP 适配版 UMD 格式
    ├── QCHAT_BROWSER_SDK.js     v1 圈组浏览器适配版 UMD 格式
    ├── QCHAT_UNIAPP_SDK.js      v1 圈组浏览器适配版 UMD 格式
```

#### 基础引入例子

```js
// 若使用 IM 能力则引入
import NIM from 'nim-web-sdk-ng'
// 等效于
import NIM from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK'

// 0.11.0 版开始支持单例模式获取实例, 在此之前通过 new 创建实例
const nim = NIM.getInstance(
  {
    "appkey": "YOUR_APPKEY",
    "debugLevel": "debug",
    "apiVersion": "v2"
  },
  {}
)

nim.V2NIMLoginService.on('onLoginStatus', function(arg1) {
  console.log('收到 V2NIMLoginService 模块的 onLoginStatus 事件', arg1)
})

async function init() {
  try {
    await nim.V2NIMLoginService.login("YOUR_ACCOUNT", "YOUR_TOKEN", {
      "authType": 0
    })
  } catch (err) {
    console.error('login failed cause', err)
  }
}

init()
```

## IM V1

### sdk 选择

sdk 默认提供以下几种形式

```
dist/
├── CHATROOM_BROWSER_SDK.js  聊天室浏览器适配版 UMD 格式
├── CHATROOM_MINIAPP_SDK.js  聊天室小程序适配版 UMD 格式
├── CHATROOM_UNIAPP_SDK.js   聊天室 UNIAPP 适配版 UMD 格式
├── NIM_BROWSER_SDK.js       IM 浏览器适配版 UMD 格式
├── NIM_MINIAPP_SDK.js       IM 小程序适配版 UMD 格式
├── NIM_UNIAPP_SDK.js        IM UNIAPP 适配版 UMD 格式
├── QCHAT_BROWSER_SDK.js     圈组浏览器适配版 UMD 格式
```

#### 基础引入例子

```js
// 若使用 IM 能力则引入
import NIM from 'nim-web-sdk-ng'
// 等效于
import NIM from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK'

// 0.11.0 版开始支持单例模式获取实例, 在此之前通过 new 创建实例
const nim = NIM.getInstance(
  {
    debugLevel: 'debug',
    appkey: 'YOUR_APPKEY',
    account: 'YOUR_ACCOUNT',
    token: 'YOUR_TOKEN'
  },
  {}
)

async function init() {
  try {
    if (nim.status === 'unconnected' || nim.status === 'waitReconnect') {
      await nim.connect()
    }
  } catch (err) {
    console.error('login failed cause', err)
  }
}

init()
```
