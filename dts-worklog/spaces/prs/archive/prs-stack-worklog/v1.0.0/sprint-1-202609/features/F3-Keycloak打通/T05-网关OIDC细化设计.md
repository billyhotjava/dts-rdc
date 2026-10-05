# T05: 网关 OIDC 细化设计（共享 Keycloak 模式）
类型：设计。负责人：待确认；状态：DRAFT（B-001：09-21 前保持；证据见实际结果节，重定基复验后转正）；估算：2 点（假设）。
设计/需求依据：R-007；F3 README 关键契约；dts-stack forwardAuth 模式；BFF + HttpOnly Cookie 方案。
输入依赖：T01 realm 草案；B-004 已关闭（同一实例分 realm），按下文落实运维细节；B-005 合规确认在本任务内跟进；
输出消费方：T02（实现）、F2 规范鉴权章节。

## 目标和范围
输出网关 OIDC 细化设计：Bearer JWT 验证流程（JWKS 缓存/轮换）、access token TTL、aud 与时钟 skew、
租户声明映射（groups→tenant）、登出与会话失效、韧性（JWKS 缓存、Keycloak 短暂不可用
fail-closed 策略）、服务间保持 X-DTS-Service 不变；Sprint-2 BFF/Cookie 会话只写分层原则（单 enforcement 点），不做详细设计。
**agent 代用户调用**：设计 copilot → prs 的 Keycloak token exchange 流程（copilot 持有用户令牌，换取 audience 为 prs 的令牌；
令牌同时记录调用方 `azp` 与被代表用户 `sub`，租户声明保持不变）、forwardAuth 对换取令牌的校验规则、审计字段；
本期只做设计，实现在 Sprint-2。Keycloak 各版本对标准 token exchange 的支持情况需按官方文档核实。
同一实例下的运维设计：master 管理权归属、升级协调窗口、按 realm 备份/恢复、
realm 配额隔离、测试/生产 realm 分离（flower-test/flower）。
合规：与 dts-stack sprint-36（机密级合规整改，涉及 dts-keycloak，当前 PLANNING）对齐，取得合规方对
"客户 ERP 与机密级平台共用身份实例"的书面结论；结论为否则提出独立实例方案并回写 R-007。
排除：企微/钉钉 broker 对接（Sprint-2）、APP PKCE 细节（Sprint-2）。

## 工作内容
时序图（登录/鉴权/登出/轮换/token exchange 五条）+ 字段表 + 失败矩阵 + 运维对接表；
与 dts-stack 运维方对一次接口（实例接入、realm 配额、备份恢复、升级窗口），与合规方确认 B-005；
按 R-012 与 stack 运维方确定共享实例 26.3.4 → 26.7.4 的升级窗口（B-008），并把版本基线 §5 的检查项交给 stack 做回归；
与 prs 相关的变化需写进设计：令牌自省要求调用方在 `aud` 中（26.6.2）、组织成员查询默认精简返回（26.7.0）、
含 `state`/`code` 的重定向 URI 被拒（26.7.3）。

## Ready 与完成标准
Ready：T01 草案可读；运维细节在本任务内关闭。
完成：设计通过评审；T02 可据此实现；F2 鉴权章节引用定稿；B-005 有书面结论或明确去向；B-008（Keycloak 部分）有排期。

## 设计输出（v0.1，已实现验证）
- 双模流程：① Bearer JWT → JWKS 直取（标准 certs 路径）→ iss 可信列表 + aud/azp + 时效校验 →
  realm roles（去默认）+ groups(`/tenants/{id}`→tenant）→ 注入头；② Cookie PRS_SESSION → Redis 校验 →
  同注入。无凭证/失败 → 401 空体。
- Traefik：forwardAuth + authRequestHeaders 双透传（Authorization/Cookie，Cookie 默认不透传是坑）+
  authResponseHeaders 六头回注；白名单（/actuator/health、鉴权自身）直通防环路。
- BFF 分层：forwardAuth 端点是单 enforcement 点；BFF 只做聚合与会话签发，不管鉴权。
- 韧性：JWKS 懒加载 + 缓存（KC 短暂不可用不阻塞启动，已缓存可继续验签）；fail-closed 只拦未知。
- 生产要求（dev 豁免项）：单 canonical iss（KC_HOSTNAME_URL + strict）、B-004 运维对接表（归属/master/升级/备份/配额）。
- 实现中发现的 5 个坑（已修，见各任务实际结果）：① VERIFY_PROFILE 首登拦 direct grant（测试 realm 禁用；
  生产保留浏览器 onboarding）；② code-flow token 无 aud（azp 回退）；③ iss 容器内外不一致（可信列表）；
  ④ Boot 默认安全链锁死 forward 端点（显式链）；⑤ BOM-import 丢 -parameters（parent 补）。

## 实际结果
设计已产出并经实现验证（T02 按此实现，T03/T04 集成验证通过）。DONE，纳入 T02 评审复核。
