## 项目落地实施规划（plan）

本规划在现有前端 Demo 的基础上，补齐上线所需的后端、数据、账号、支付、记录、联络与分享等能力，目标是将「Portrait Banana」从单机体验升级为可用的在线服务。

### 0. 基线与安全整改（前置）
- 统一环境变量命名：仅使用 `process.env.GEMINI_API_KEY`，移除前端硬编码密钥。
- 将生成服务改为后端代理：客户端上传图片到后端，后端持密钥调用 Gemini；前端仅拿到结果 URL/资源标识。
- 资源存储方案：将生成图像存储到对象存储（如 GCS/S3），避免前端长期持有 base64，支持 CDN 分发与到期清理。
- 日志与追踪：接入基础审计日志（生成调用、支付回调、登录行为）；接入 Sentry 之类错误上报。

### 1. 多语言设计（i18n）
- 目标：支持至少中/英，后续可插拔更多语言；默认按浏览器或用户设置。
- 前端：
  - 引入 i18n 库（如 `react-i18next`），抽离所有文案到 `locales/{lang}.json`。
  - 文案键命名规范、组件级按需加载；SSR 场景预留。
- 后端：
  - 返回可国际化的错误码与 message key，前端本地化渲染。
- 管理：
  - 在用户设置中保存语言偏好；匿名用户用 localStorage。
- 验收要点：切换语言、刷新后保持；新功能默认补齐多语键。

### 2. 登录设计（OAuth + 自主账号）
- 目标：支持 Google/WeChat/Apple/X 等第三方登录 + 邮箱密码主站登录；设备会话保持与风控。
- 后端：
  - 采用 OpenID Connect/OAuth 2.0（可用 `NextAuth`/自建 OAuth flow）。
  - 统一用户表 `users`（`id`, `email`, `display_name`, `avatar`, `locale`, `created_at`）。
  - 第三方凭证表 `user_providers`（`user_id`, `provider`, `provider_uid`, `access_token`(加密), `refresh_token`(加密), `expires_at`）。
  - 会话/令牌：使用 JWT（短期）+ Refresh Token（长期）或服务端会话（如 Redis）。
  - 邮箱登录：注册/登录/重置密码（邮件服务，限速/风控、密码哈希）。
- 前端：
  - 登录/注册页，第三方登录按钮；登录后拉取用户资料与订阅状态。
- 安全：
  - CSRF、PKCE、State 校验；邮箱保护暴露（统一提示）。
- 验收要点：多端登录、退出、过期刷新、撤销授权。

### 3. 支付设计（Stripe/微信支付等）
- 目标：支持订阅（Pro）与单次购买（可选），面向海外用 Stripe，国内用微信/支付宝（分地区开关）。
- 后端：
  - 订单表 `orders`（`id`, `user_id`, `type`(subscription/oneoff), `amount`, `currency`, `status`, `provider`, `provider_order_id`, `created_at`）。
  - 订阅表 `subscriptions`（`id`, `user_id`, `plan_id`, `status`, `current_period_start/end`, `cancel_at`, `provider_customer_id`, `provider_sub_id`）。
  - Webhook 处理：支付成功/失败/退款/续费/取消，幂等处理与签名校验。
- 前端：
  - 支付页与订阅管理 UI；状态联动（试用、到期、续费提醒）。
- 验收要点：
  - 下单-支付-回调-开通/续费全链路；异常订单自动对账与修复任务。

### 4. 用户信息管理
- 目标：统一管理用户资料、订阅、支付、第三方凭证、通知偏好。
- 后端：
  - 用户资料 API：头像、昵称、语言、地区、联系渠道（微信/Discord/邮箱）。
  - 订阅 API：当前状态、账单历史、取消/恢复、升级/降级。
  - 凭证管理：列出已绑定的第三方，支持解绑；邮箱重置与修改。
- 前端：
  - 用户中心：资料、订阅、订单、账号安全（登录设备、2FA 预留）。

### 5. 生成记录管理
- 目标：可在「生成记录」中查看每次生成与其下属图片，支持筛选、重命名、删除、再次生成、批量下载。
- 数据模型：
  - `generations`（`id`, `user_id`, `source_image_url`, `model`, `style_ids[]`, `status`, `created_at`）。
  - `images`（`id`, `generation_id`, `url`, `style_name`, `is_premium`, `metadata`, `created_at`）。
- 后端：
  - 生成任务异步化（队列/任务系统）；状态轮询或 WebSocket 推送。
  - 鉴权与配额限制（免费 3 张下载上限、速率限制）。
- 前端：
  - 列表与详情页；选择/下载/分享；失败重试与错误提示。

### 6. 联系我们（邮箱/Discord/微信）
- 前端：
  - 联系页：展示渠道信息，支持提交表单（FAQ 引导）。
- 后端：
  - 工单/反馈表 `tickets`（`id`, `user_id/null`, `channel`, `email/wechat/discord`, `content`, `status`, `created_at`）。
  - 邮件通知团队，或入群机器人提醒（可选）。

### 7. 社交分享（朋友圈/Instagram/X 等）
- 前端：
  - 生成分享页（公共可见、到期失效）；一键复制链接与海报。
  - 微信：适配 JSSDK 分享（需配域名与签名后端）；图文卡片。
  - 其他：Web Share API（支持的平台），OG Meta 生成。
- 后端：
  - 短链服务（可选）；分享资源防盗链与到期清理。

### 8. 其他必要功能（补充）
- 审批与内容安全：
  - 图像与文本安全检测（成人、暴恐、版权等），必要时加人工复核通道。
- 配额与计费：
  - 免费额度、邀请奖励、按风格/清晰度计费；超限引导订阅或单次购买。
- 运营能力：
  - A/B 配置化 `portraitStyles`（服务端下发），活动开关、公告。
- 观测性：
  - 指标：生成成功率、耗时、失败原因；支付转化漏斗；留存与活跃。
- 法务与合规：
  - 隐私政策、服务条款、GDPR/CCPA 请求处理；未成年人保护；删除数据流程。

### 9. 后端技术选型示例
- API：Node.js（NestJS/Express/Fastify）或 Next.js App Router（SSR + API Route）。
- 存储：PostgreSQL（主业务）+ Redis（会话/队列）+ 对象存储（GCS/S3）。
- 身份认证：OpenID Connect（Auth0、Clerk、NextAuth 自建）；苹果与微信需额外配置。
- 支付：Stripe（国际）+ 微信支付/支付宝（国内）；统一订单抽象与 Provider 适配层。
- 队列：BullMQ/Cloud Tasks；WebSocket/SSE 推送进度。

### 10. 关键 API 草案（简化）
- Auth：
  - `POST /api/auth/login`（邮箱）、`GET /api/auth/oauth/:provider/callback`、`POST /api/auth/logout`、`GET /api/me`。
- Payment：
  - `POST /api/payments/checkout`、`POST /api/payments/webhook`、`GET /api/subscriptions/me`、`POST /api/subscriptions/cancel`。
- Generation：
  - `POST /api/generations`（上传源图/引用）→ 返回任务 id。
  - `GET /api/generations/:id`（状态/结果）
  - `GET /api/generations`（分页）
  - `DELETE /api/images/:id`、`POST /api/generations/:id/retry`。
- Profile：
  - `PATCH /api/me`（资料）
  - `GET /api/orders`、`GET /api/orders/:id`。
- Share：
  - `POST /api/share`（生成分享链接）、`GET /s/:slug`（公共页）。

### 11. 数据表（简要）
- `users`、`user_providers`、`sessions`（可选）
- `orders`、`subscriptions`、`payment_events`
- `generations`、`images`
- `tickets`（反馈/工单）

### 12. 里程碑拆解与时间估算（示例）
- M0 安全与基建（1 周）：密钥整改、后端脚手架、存储与队列、错误上报。
- M1 账号与多语言（1-2 周）：OAuth + 邮箱登录、i18n、用户中心雏形。
- M2 生成服务后端化（1-2 周）：上传/任务/回调、列表与详情页、下载。
- M3 支付与订阅（2 周）：Stripe/微信支付全链路、订阅管理、权限控制。
- M4 分享与联络（1 周）：分享页、OG、联系表单、后台查看。
- M5 内容安全与配额（1 周）：内容审核、配额策略、速率与风控。
- M6 打磨与上线（1 周）：监控与报表、BUG 修复、文档与合规页面。

### 13. 验收标准（Definition of Done）
- 登录/退出/授权稳定；异常路径（撤销、过期）可恢复。
- 生成任务可控：失败可重试；配额受控；性能达标；UI 具备进度反馈。
- 支付闭环打通且对账正确；订阅状态一致；退款/取消正确回滚权限。
- 数据安全：个人数据加密存储；秘钥严格后端；日志可审计。
- 多语言覆盖率 ≥ 95%；新增页面必须带文案键。

### 14. 风险与缓解
- 第三方合规（微信、苹果、Stripe 审核）：预留审批周期与灰度方案。
- 模型速率与费用：做批量/队列与重试、降级策略；缓存热点风格结果。
- 图片版权与敏感内容：上线内容安全策略与申诉通道，明确用户协议。

### 15. 限流与风控（新增）
- 目标：防盗刷、防批量薅羊毛、防接口滥用，保护成本与服务稳定。
- 维度：IP、账号、设备指纹、支付状态、地区/渠道、接口类型。
- 策略：
  - 速率限制（Rate Limit）：
    - 通用：`N requests / minute`（IP 级）+ `M requests / minute`（账号级）。
    - 高价值接口（生成/下单）：更严格阈值与冷却时间；对匿名用户更严格。
    - 实现：网关或后端中间件（Redis 令牌桶/滑动窗口），配合 `Retry-After`。
  - 配额限制（Quota）：
    - 免费：每日/每月生成次数/下载数；订阅：按计划配额；超限拦截并引导。
  - 异常行为检测：
    - 指标：失败率激增、国家与支付地区不一致、短时多账号绑定同设备。
    - 风控分（Risk Score）：综合信号打分，超过阈值进入二次验证（验证码/邮箱验证/支付前置）。
  - 黑白名单：
    - 黑名单 IP/设备/账号；白名单内部账号与测试环境。
  - 验证码：
    - 登录/注册/异常高频；图形或隐式验证码（hCaptcha/Turnstile）。
- 落地：
  - Redis 做计数与窗口；可在 API 网关或边缘（Cloudflare/WAF）先挡一层。
  - 记录命中与封禁事件到 `risk_events`，可回溯与解封工作流。

### 16. 告警与监控（新增）
- 指标：
  - 系统：CPU/内存、响应时间、错误率（5xx/4xx 比例）、队列长度。
  - 业务：生成成功率、平均耗时、模型调用失败分布；支付成功率、退款率；登录失败率；限流命中率。
- 告警：
  - 通道：Slack/飞书/微信机器人、邮件、短信（关键级别）。
  - 规则：静态阈值 + 动态基线（如异常突增）；分级（P1/P2/P3）。
  - 护栏：告警抑制与合并，避免风暴；告警值班轮转与Runbook 链接。
- 可观测性栈：
  - 日志（ELK/Cloud Logging）、指标（Prometheus/Grafana/Cloud Monitoring）、追踪（OpenTelemetry）。

---
如需，我可以将限流与风控纳入 M0 阶段，与密钥整改一起先落地（Redis + 中间件 + 基础告警）。
