# woofy-goopy

> A cross-platform pigeon desktop pet with 9 state machines. ABSOLUTE FIRE 💥

## Crown · 可复用宠物资产

Woofy Goopy 是一个面向工作模式、Codex 与桌面客户端的数字宠物项目。当前角色 Crown 拥有大眼睛、灰色喙、白色身体和黄色皇冠，依据提供的动作设计稿制作。

## 文件

- `assets/spritesheet.png`：工作模式 / Codex v2 透明图集。
- `manifest.json`：动作行、有效帧数、时长和方向顺序。它是本套件的数据格式，不是声称官方会读取的安装配置。
- `runtime/`：无框架依赖的 Canvas 播放器，直接绘制精灵帧。
- `electron/`：透明、置顶窗口接入示例及受限 preload 接口。
- `preview.html`：可双击打开的独立预览，所有资源内嵌。
- `previews/`：GIF、视频、动作与方向检查图。
- `tests/`：方向坐标、帧时序和图集边界测试。

## 本地运行 Electron 示例

需要本机的 Node.js 与 npm。首次运行：

```sh
npm install --save-dev electron
npm start
```

安装后保留生成的 `package-lock.json`，固定本机验证的 Electron 版本。示例提供鼠标注视、动作选择、点击跳跃、减少动态和关闭按钮。窗口顶部可拖动。窗口关闭后进程退出。

该示例是客户端接入起点，不是已经打包签名的 Windows/macOS 安装程序。透明窗口、置顶和显示缩放需在目标系统验证。

## 接入现有客户端

复制 `assets/`、`manifest.json` 和 `runtime/`，将解析后的 manifest 传入播放器：

```js
import { PetPlayer } from './runtime/player.js';

const pet = await PetPlayer.load(canvas, {
  imageUrl: './assets/spritesheet.png',
  manifest,
});

pet.setState('running');       // 任务正在工作：思考动画
pet.setState('waiting');       // 需要用户输入
pet.setState('review');        // 等待检查结果
pet.setState('failed');        // 失败反应后回到待机
pet.setState('jumping');       // 播放一次并回到待机
pet.setState('idle');
pet.lookAt(mouseDx, mouseDy);   // 屏幕坐标：右正、下正，仅待机响应
pet.setReducedMotion(true);    // 固定显示第一帧
pet.destroy();                 // 卸载时释放帧循环和监听器
```

宿主负责把实际任务事件映射成这些状态。播放器不会读取 Codex 会话、其他应用或网络；示例也没有假造自动任务同步。后续接入自己的 Agent 事件即可，不必重新制作动画。

### 动作映射

| 行 | 状态 | 有效帧 | 用途 |
|---:|---|---:|---|
| 0 | idle | 6 | 呼吸、眨眼、待机 |
| 1 | running-right | 8 | 向右移动 |
| 2 | running-left | 8 | 向左移动 |
| 3 | waving | 4 | 打招呼 |
| 4 | jumping | 5 | 起跳、离地、落地 |
| 5 | failed | 8 | 失败、沮丧 |
| 6 | waiting | 6 | 等待输入或帮助 |
| 7 | running | 6 | 思考与工作 |
| 8 | review | 6 | 检查结果 |
| 9–10 | look | 16 | 顺时针十六方向注视 |

图集尺寸为 1536×2288，单格 192×208，8 列 11 行。每行只播放有效帧，剩余空格透明。方向 0° 向上、90° 向右、180° 向下、270° 向左，每格间隔 22.5°。GIF 的时序是这份移植示例的播放配置，宿主可自行调整。

## 工作模式与 Codex

工作模式创建结果和稳定宠物 ID 见 `pet-record.json`（完成创建后写入）。本次没有要求替换当前激活宠物，因此不主动切换原有选择。

支持宠物安装链接的 Codex 版本可使用官方格式：

```text
codex://pets/install?name=Crown&imageUrl=<URL编码的HTTPS图集地址>&spriteVersionNumber=2
```

必须使用实际可访问的 HTTPS 图集地址，不能把本地路径填进 `imageUrl`。本套件不公开托管素材，也不把短期下载链接写入持久配置。

官方说明：[Codex 宠物安装链接](https://learn.chatgpt.com/docs/reference/commands#pets)。安装入口可用性取决于宿主是否启用该功能。

## 后续改造

素材、播放行为与宿主代码分离。修改名称只需改显示配置；制作学士帽眼镜换装应输出第二套图集，并沿用相同帧位与数据接口。原始学士帽草图保存在制作源文件包中，本版本仅包含皇冠造型动画。

动画来自图像生成并经过组件提取、统一缩放和透明背景处理，属于逐帧位图，不是骨骼动画或可编辑矢量。需要更平滑的运动时，可增加帧数并另导出 Electron 专用图集；保留官方 v2 图集的固定格数。

Electron 实现参考：[BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window)、[Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)。
