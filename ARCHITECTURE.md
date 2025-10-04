## 项目架构与功能概览（Portrait Banana）

本文件基于仓库当前代码推断项目架构、运行机制与功能清单，帮助快速理解与后续扩展。

### 一、技术栈与运行环境
- 前端框架：React 19（`react`, `react-dom`）
- 构建工具：Vite 6（`@vitejs/plugin-react`，TypeScript）
- UI：Tailwind CSS（通过 `index.html` CDN 注入，非 PostCSS 本地编译）
- AI 服务：Google Gemini（`@google/genai`，在 `index.html` 亦通过 import map 指向 CDN）
- 运行目标：纯前端 SPA，浏览器直接请求 Gemini API 生成图像

### 二、目录结构与模块职责
- `index.html`：
  - 注入 Tailwind CDN 与 Google Fonts；定义 import map 将 `react`/`react-dom`/`@google/genai` 指向 CDN。
  - 挂载点 `#root`，入口脚本 `/index.tsx`。
- `index.tsx`：React 应用入口，挂载 `<App />`，开启 `React.StrictMode`。
- `App.tsx`：页面状态与业务编排中心：
  - 管理上传的图片、生成结果、选择状态、生成中状态、错误、订阅状态、支付弹窗开关。
  - 调用 `services/geminiService.ts` 的 `generatePortraits`，增量回传生成图片。
  - 组织 UI：`Header`、`Hero`、`ImageGrid`、`LoadingSpinner`、`PaymentModal`。
- `components/`：
  - `Header.tsx`：头部栏，提供「Upgrade to Pro」按钮，显示订阅状态。
  - `Hero.tsx`：首屏交互区：上传图片、触发生成、预览上传图。
  - `ImageGrid.tsx`：展示生成的图片列表，选择与下载入口，带 PRO 标识与选择限制提示。
  - `LoadingSpinner.tsx`：生成过程中的轮播提示语与加载指示。
  - `PaymentModal.tsx`：模拟订阅升级弹窗，输入测试兑换码 `BANANA2024` 可激活 Pro（无真实支付）。
  - `icons/`：SVG 图标集合。
- `services/geminiService.ts`：
  - 将本地 `File` 转换为 Gemini 的 `inlineData`。
  - 懒加载与缓存 `GoogleGenAI` 客户端实例。
  - 内置多种「风格模板」（含是否为 `isPremium`），以批处理（默认每批 4）并发请求生成图片。
  - 逐个风格返回 `GeneratedImage`（`onProgress` 回调）。
- `types.ts`：定义 `GeneratedImage` 数据模型。
- `vite.config.ts`：
  - 通过 `define` 注入 `process.env.API_KEY`、`process.env.GEMINI_API_KEY`（值取自本地环境 `GEMINI_API_KEY`）。
  - 配置 `@` 别名到仓库根目录。
- `README.md`：本地运行步骤与设置 `GEMINI_API_KEY` 的指引。

### 三、核心数据流与交互流程
1) 用户上传图片（`Hero` → `App.handleImageUpload`）：
   - 生成本地预览 URL；清空旧的生成结果与选择。
2) 触发生成（`Hero` → `App.handleGenerate`）：
   - 前置条件：已上传图片且已配置 API Key（`isApiKeyConfigured()`）。
   - 调用 `generatePortraits(file, onProgress)`：
     - 将图片转为 base64 `inlineData`。
     - 按预置风格分批并发请求 Gemini 模型 `gemini-2.5-flash-image-preview`，响应包含 IMAGE/TEXT。
     - 找到 `inlineData` 图片数据后构造 `GeneratedImage`，通过 `onProgress` 逐步回传到 `App`，累积渲染。
3) 选择与下载（`ImageGrid` + `App.handleImageSelect`/`handleDownload`）：
   - 免费用户：最多选择 3 张非 Premium 图片；选择 Premium 会在下载时触发升级弹窗。
   - 下载：按选择顺序创建 `<a>` 并点击触发下载（使用延时规避浏览器拦截）。
4) 升级流程（`PaymentModal`）：
   - 模拟弹窗，无真实支付；输入测试码 `BANANA2024` 即可激活 `isSubscribed=true`，解除下载限制。

### 四、状态与边界处理
- 加载与进度：`LoadingSpinner` 提示；生成阶段禁用按钮与显示 Loading。
- 错误处理：生成异常捕获，显示用户态错误文案并打印控制台细节。
- 资源回收：替换上传图时 `URL.revokeObjectURL` 释放旧预览。
- 选择上限：免费至多 3 张非 Premium，Pro 不限。
- 并发与速率：每批 4 个风格请求，降低速率限制风险。

### 五、配置与密钥管理（重要）
- `vite.config.ts` 通过 `loadEnv` 注入 `process.env.API_KEY` / `process.env.GEMINI_API_KEY`，来源于本地环境 `GEMINI_API_KEY`。
- `services/geminiService.ts` 的 `getAiInstance()`：
  - 依赖 `process.env.API_KEY` 判断是否配置；
  - 但当前实现里包含一段硬编码 API Key（安全风险）并与前述环境变量命名不一致：
    - `isApiKeyConfigured()` 检查 `process.env.API_KEY`；
    - Vite 实际注入来自 `GEMINI_API_KEY`；
    - 建议统一为 `process.env.GEMINI_API_KEY` 并删除任何硬编码密钥。
- 纯前端直连第三方 API 的模型调用存在暴露密钥风险。生产建议：
  - 将生成请求改为后端代理（服务器端持有与保护密钥）。
  - 客户端仅调用自有后端 API。

### 六、功能清单（基于代码推断）
- 图片上传与预览（单张）
- 使用 Gemini 模型对同一张图片生成多风格肖像：
  - 免费风格与 Premium 风格混合；分批并发生成，逐步展示结果
- 图片网格浏览与选择；免费用户最多选 3 张非 Premium
- 多文件批量下载（按选择顺序触发）
- 升级到 Pro（模拟）：输入测试码 `BANANA2024` 激活当次会话 Pro
- 主题适配（`dark:` 类）与响应式栅格、动效与图标

### 七、潜在问题与改进建议
- 安全：
  - 秘钥硬编码与前端可见（高风险），应移除硬编码、改为后端代理请求。
  - 统一环境变量命名（例如仅使用 `process.env.GEMINI_API_KEY`），并在 `isApiKeyConfigured()` 与客户端检查逻辑中保持一致。
- 可靠性与错误处理：
  - 对 `response.candidates`/`parts` 的空值安全更健壮的防护。
  - 对网络失败与速率限制可增加退避/重试策略与用户可恢复操作。
- 性能与体验：
  - 大量 base64 图片会占用内存，考虑使用 Blob URL 或服务端存储与分页加载。
  - 下载可打包为 ZIP（需后端或前端 zip 库）。
- 可维护性：
  - `portraitStyles` 可拆分为独立配置文件/远端配置，便于 A/B 与运营。
  - 引入国际化（当前中英混合，UI 文案集中管理）。
  - 更细的组件划分与无障碍（alt、aria、键盘导航）。

### 八、部署与运行
- 本地运行：
  - Node 环境安装依赖
  - 设置环境变量 `GEMINI_API_KEY`
  - 启动开发服务器

```bash
npm install
# macOS/Linux
export GEMINI_API_KEY=your_key_here
# Windows PowerShell
$Env:GEMINI_API_KEY="your_key_here"

npm run dev
```

- 生产部署：
  - 目前为纯前端构建产物，可托管到静态站点；但强烈建议将模型调用迁移至后端代理，避免密钥暴露。

### 九、关键文件清单（速查）
- 入口与骨架：`index.html`、`index.tsx`、`App.tsx`
- 组件：`components/Header.tsx`、`components/Hero.tsx`、`components/ImageGrid.tsx`、`components/LoadingSpinner.tsx`、`components/PaymentModal.tsx`
- 服务：`services/geminiService.ts`
- 类型：`types.ts`
- 构建配置：`vite.config.ts`、`tsconfig.json`
- 说明：`README.md`

---
如需我据此进行安全整改（移除硬编码密钥、后端代理化）或统一环境变量命名与校验逻辑，请在 Issue 或任务中说明，我可以直接提交对应编辑与改造。
