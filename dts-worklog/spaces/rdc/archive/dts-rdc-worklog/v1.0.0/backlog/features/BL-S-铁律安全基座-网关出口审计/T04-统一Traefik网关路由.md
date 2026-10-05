# T04: 统一 Traefik 网关路由

**原编号**: Sprint-5 F9/T04（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: DRAFT
**依赖**: T02

## 目标
用一套 Traefik 配置（dts-gateway）承载 Studio、prs（以及评估后的 stack）的外部入口；各系统自带的 Traefik（copilot 的 `copilot-proxy`、prs 的边缘层）合并。

## 技术设计
- **位置**：`dts-rdc` 下新增 `deploy/gateway/`（总纲仓库负责跨模块的部署编排），或放在 dts-infra 中（ADR-008 决定）；
- **内容**：
  - `traefik.yml`（静态配置：entrypoints web/websecure、providers file）；
  - `dynamic/middlewares.yml`：`dts-forward-auth`（`address: http://dts-auth:8081/api/internal/auth/forward`，`trustForwardHeader: false`，`authResponseHeaders` 为 ADR-008 的头列表）、`strip-identity-headers`（在 forwardAuth 之前清空客户端带来的 `X-DTS-*`）；
  - `dynamic/studio.yml`、`prs.yml`（迁移 prs 的 `sources/deploy/traefik/dynamic/prs.yml`，账本#27）、`stack.yml`（T06 之后）；
  - TLS：沿用 copilot 的本地 CA 脚本（`services/certs/gen-certs.sh`）生成开发证书；
- **网络隔离**：业务服务不暴露 host 端口（只有网关暴露），compose 中移除业务服务的 `ports`（开发 override 文件除外）；
- **老路由别名**：prs R-006 提到的老路由别名只在网关层映射，并逐条登记下线日期（沿用 prs 的规则）。

## 验证
- [ ] 路由矩阵测试脚本：每条路由分别用无 token（401）、有 token（2xx）、角色不足（403）访问
- [ ] 伪造身份头测试：客户端发送 `X-DTS-User-Id: admin`，下游 echo（prs-shadow）显示的是真实用户

## Definition of Done
- [ ] 证据进入 `it/IT-03-gateway.md`

## 2026-09-26 承接约束

PRS-G04：当前 dev `prs-internal-sync` 无 forwardAuth。统一网关不照搬此公网旁路：同步接口仅内部服务身份可达；验证匿名、伪造头、普通用户及公网直连均不能调用。开发配置的匿名路由不得进入验收/生产配置。
