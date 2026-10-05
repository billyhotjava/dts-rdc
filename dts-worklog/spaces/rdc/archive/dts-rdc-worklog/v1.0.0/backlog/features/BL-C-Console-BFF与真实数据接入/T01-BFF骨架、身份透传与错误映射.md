# T01: BFF骨架、身份透传与错误映射

**原编号**: 新增（2026-09-27，ADR-013：UI 驱动的 BFF 只承担与前端的交互）

**优先级**: P0 · **状态**: DRAFT · **依赖**: BL-S/T03、BL-S/T04；Sprint-5 F6/T13（契约 v1 冻结）

## 目标
`dts-studio/console-bff/` 在 dts-gateway 之后运行，透传用户身份调用下游，并把下游错误映射为统一错误体。

## 技术设计
- 技术基线与 studio engine 一致（随 ADR-005/010 定稿）；只经 Traefik + forwardAuth 暴露（铁律 #2），无旁路端口。
- 身份：读取网关注入的 `X-DTS-User-Id / X-DTS-Tenant-Id / X-DTS-Roles / X-DTS-Trace-Id`，原样透传给下游；**禁止**服务账号兜底提权；缺租户直接 fail-closed。
- 错误体统一为契约 `common.yaml` 的 `{errorKey, message, traceId, details?}`；下游 401/403 原样传递，不改写成空数据。
- 无业务数据库；可选的 UI 偏好（列宽、收藏）若需要，另起契约评审。
- 契约测试：用 OpenAPI 请求/响应校验器对每个端点做契约测试（库按 R-012 选定），CI 必须通过。

## 验证（RED→GREEN）
- [ ] 缺租户、无角色、下游 403 三种情况的契约测试
- [ ] 绕过网关直连 BFF 端口失败（网络层不可达）

## Definition of Done
- [ ] 对应契约（Sprint-5 F6 冻结的 `console-contracts-v1`）的契约测试全绿
- [ ] 端点与 `../../../sprint-5-202610/assets/console-contract-map.md` 中的映射一致；不含业务规则、不直连数据库、不提权

## 身份入口与完整页面承接

- 本 Task 同时实现 `me.openapi.yaml` 与启动所需的身份/能力响应，消费可信网关身份及各领域已授权范围，承接 Sprint-5 F6/T12；不从浏览器提交的 tenant/user/roles 构造权限。
- 网关删除外部同名 `X-DTS-*` 头并重新生成；下游只接受已认证的代理/服务传递。身份凭证和目标 audience 由 BL-S/T01/T03 定稿，不能把复制任意 HTTP 头当作代用户鉴权。
- 缺少业务租户时，受保护数据调用 fail-closed；`/me` 可返回已认证账户及“尚未选择/无可用租户”状态，不返回任何业务数据，使登录与错误展示可用。
- 明确下游超时、取消与错误映射；请求未完成不得自动重放有副作用的 POST。契约覆盖伪造身份头、跨租户缓存、401/403 与无租户身份页。
