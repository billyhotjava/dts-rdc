# F3: Keycloak flower realm 与网关打通
产品 Feature：PF-IAM；需求依据：R-002（独立 flower realm、多租户预留）+ R-006（无 Nacos，
Traefik forwardAuth）+ R-007（与 dts-stack 共用 Keycloak：同一实例分 realm；本期只做 Bearer JWT）+ F2 规范鉴权章节；
阻碍：B-005（共用实例合规确认，未确认前只在 flower-test realm 推进）。
负责人：待确认；优先级：高（第一条集成路径）；状态：DRAFT。

## 使用场景与验收
调用者：测试用户（总经理/项目经理/员工/财务四角色各一）。触发：访问影子服务受保护接口。
输入：realm 配置 + forwardAuth 鉴权服务；结果：四角色均可登录，Bearer JWT 验证通过，
`X-DTS-*` 头（含租户位）按下文头契约注入正确，影子服务放行/拒绝正确。
正常流程：realm 建用户配角色 → Traefik forwardAuth 到鉴权服务（Bearer JWT 本地验签）→ 注入头 → 影子服务
`GET /api/prs/whoami` 返回身份回显。
替代流程：APP/移动通道本期不做；H5/BFF Cookie 会话模式整体顺延 Sprint-2（R-007），本期不实现、不测试。
失败流程：Keycloak 实例不可达 → 头契约先行对齐（Traefik 侧配直通），realm 联调顺延并标
BLOCKED；运维细节未落实不阻塞协议与配置工作。
规则与边界：与 dts-stack 共用同一 Keycloak 实例（B-004 已关闭，合规待 B-005）；realm 严格分离，
S10 不动；租户模型按 R-010 采用 Keycloak 26 原生 Organizations（现网 26.3.4 已支持，目标版本 26.7.4，账本 #10、#20），每个租户一个组织；
T01 验证不满足时才退回 groups `/tenants/{id}` 并记录原因；不采用每租户一个 realm；按钮级权限留应用层，不进 Keycloak。
验收示例：Given 四角色用户已建 / When 携带 token 调影子接口 / Then 200 与身份回显正确，无 token 时 401。
本期范围：flower-test realm + forwardAuth 鉴权服务（Bearer JWT）+ Traefik 配置 + 验证 + OIDC 细化设计（T05）。
生产 flower realm 待 B-005 合规确认后再建。
后续切片：APP PKCE、H5/BFF 会话、老用户密码迁移、企微/钉钉 broker、copilot 代用户调用的 token exchange 实现、
租户开通流水线（建组织 → 种子数据 → 租户目录）（Sprint-2+）。
非目标：菜单权限模型（F1 §5 另行决策）。

## 设计
概念与共享架构：身份面唯一事实源 = Keycloak flower realm（与 dts-stack 共实例）；
Traefik 为唯一边缘入口，鉴权逻辑收敛在鉴权服务的 forwardAuth 端点
（复用 dts-stack ForwardAuthResource 模式，账本 #11），下游只信任注入的头；
Traefik 须在转发前剥离客户端自带的 `X-DTS-*` 头，防止伪造。
概要协作：用户 → Traefik（forwardAuth 到鉴权服务做 OIDC）→ 头透传 → 影子服务。
关键契约：401/403 语义；aud/azp 校验；租户声明映射；JWKS 缓存轮换与韧性（短暂不可用 fail-closed 策略）。

头契约（v0.1，沿用 dts-stack 命名，新增租户头；T01 确认后冻结）：

| 头 | 来源 | 必填 | 说明 |
|---|---|---|---|
| `X-DTS-User` | JWT `preferred_username` | 是 | 登录名 |
| `X-DTS-User-Id` | JWT `sub` | 是 | 替代老系统 loginUserId 本人门控 |
| `X-DTS-Display-Name` | JWT `name`/`nickname` | 否 | 替代老系统 nickName 默认值 |
| `X-DTS-Roles` | realm roles，逗号分隔 | 是 | 四角色编码 T01 定 |
| `X-DTS-Dept-Code` | 用户属性 | 否 | 部门 |
| `X-DTS-Tenant-Id` | Organization 声明映射的租户 ID（bigint）；退回方案为 groups `/tenants/{id}` | 是 | prs 新增；缺失或用户属于多个组织且未指定时 403；下游用它执行 `SET LOCAL app.tenant_id` |
| `X-DTS-Service` | 服务间调用 | 服务间必填 | 保持现有机制 |

结果语义：无 token / 验签失败 / 过期 → 401；有身份但无租户或角色不符 → 403。
dts-stack 的 `X-DTS-Permissions`、`X-DTS-Personnel-Level` 本期不注入（按钮级权限留应用层）。
UI 或使用路径：Keycloak 自带登录页本期够用；企微免登延后。
详细设计：见 T01–T05（协议主体见 T05）。
未决项：B-003（groups vs organizations 取舍、老密码迁移策略）T01 关闭或转假设。

## Task
| ID | 类型/目标产出 | 负责人 | 输入依赖 | 估算 | 验证方式 | 状态 |
|---|---|---|---|---|---|---|
| T01 | 设计+实施：realm 设计与配置 | 待确认 | F2 鉴权章节（假设可先行） | 3 点（假设） | realm 导出文件 + 四角色可登录 | DRAFT |
| T05 | 设计：网关 OIDC 细化（共享 Keycloak 模式） | 待确认 | T01 草案、R-007、B-005 | 2 点（假设） | 设计评审通过，T02 可据此实现 | DRAFT |
| T02 | 开发：forwardAuth Bearer JWT 验证 + Traefik 配置 + 单测 | 待确认 | T01 头契约、T05 协议 | 2 点（假设） | 单测 + 非法 token 拒绝记录 | DRAFT |
| T03 | 集成：端到端登录验证 | 待确认 | T01/T02、测试环境 | 1 点（假设） | 四角色端到端记录 | DRAFT |
| T04 | 测试设计与执行：登录鉴权用例 | 待确认 | T01 规则 | 1 点（假设） | 用例执行报告 | DRAFT |

执行顺序：T01 → T05 → T02 → T04（设计可与 T01 并行）→ T03。T03 完成是 F4/T02 基线"登录"项的前提。

## Feature 完成标准
四角色端到端通过；flower-test realm 配置有导出备份；头契约冻结；T05 设计通过评审；B-005 有书面结论或明确去向。
标准映射到集成记录、用例报告与设计评审记录。
