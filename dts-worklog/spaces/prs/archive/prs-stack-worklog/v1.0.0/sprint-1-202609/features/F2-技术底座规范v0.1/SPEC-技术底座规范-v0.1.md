# 技术底座规范 v0.1（F2/T01 产出，待 T02 评审）

状态：草案。每条标【锁/假设/延后】。适用范围：PRS 新栈全部服务与模块。

## ① BOM 与版本【锁】
Java 25 LTS / Boot 4.1.1 / springdoc 3.1.1 / PG 18.6 / Valkey 9.1.2 / Traefik v3.7.13 /
Keycloak 26.7.4 / Kafka 4.3.1 / Liquibase 5.0.4 / SeaweedFS（版本待定）/ Flowable 8.0.0。
以 `../../assets/版本基线.md` 为准；新 BOM 的兼容性验证状态见 T03，旧 BOM 的通过记录不能替代复验。
无 SCA/Nacos（R-006）。parent pom 统一 import BOM；compose 镜像全 pin tag。

## ② 服务/模块模板【锁】
见 `sources/TEMPLATE.md`。默认能力：R 信封、全局异常、Long 转字符串、X-DTS-* 上下文、
OpenAPI、健康检查。Copy 范本 = prs-shadow。

## ③ API 规范【锁】
- 信封 `R{code,msg,data}`，HTTP 状态与 code 一致；校验失败 400 取首条；未知异常 500 不泄漏堆栈。
- 版本：URL 主版本（`/api/v1`，本期可先 `/api`，Sprint-2 业务域起切 v1）。
- 分页：`{page, size, total, list}`（Sprint-2 业务域统一，模板届时补 PageUtil）。
- 错误码：200/400/401/403/404/409（幂等冲突）/500；业务码用 4xx/5xx，不另起体系。
- OpenAPI：每个服务 `/v3/api-docs` 可达，网关聚合延后。

## ④ 事件规范【锁】
- 信封 CloudEvents（type/source/id/time/data 必备）；领域事件经 outbox 表（`outbox_event` 已建）。
- 首批事件目录（状态变更类）：单据状态变更、任务完成、结算确认、合同到期、应收逾期。
- Kafka 本期只定标准：topic 前缀 `flower.*`，复用 dts-stack 集群 + ACL；relay 投递 Sprint-2 建。

## ⑤ 数据规范【锁】
- 新表一律 Liquibase changeSet；基线表归 prs-platform；业务表归各域服务；禁跨库直连。
- 必备字段：`tenant_id`（全部业务表）、审计字段（create_by/at）、逻辑删除 `del_flag('0' 有效，沿用老口径）【假设：F1 签字确认后转锁】。
- 主键：应用层雪花（沿用老习惯）+ JSON 全局字符串；单号：DB 序列/Redis，禁查最大+1。
- 金额 BigDecimal（分）、HALF_UP；日期 timestamptz；中文排序 collation 全库一致（PG 初始化时定，F4 落实）。
- 扩展只装 pg_trgm + pg_stat_statements。

## ⑥ 安全规范【锁】
- 边缘唯一入口 Traefik；鉴权 forwardAuth 双模（JWT/JWKS + 会话），下游只信任头。
- 密钥：接管 dts-stack sprint-36/37 成果，不自建；compose 示例只放 dev 假值。
- 脱敏：手机号/身份证/金额列表默认脱敏（Sprint-2 业务域工具类，规范先行要求）。
- 审计：本地 audit_event（业务）+ agent 动作同步 dts-admin（Sprint-2 对接）。
- 制单≠审核、付款需出纳、作废需财务经理：业务域实现约束（Sprint-2 起强制）。

## ⑦ 前端规范【锁（方向）细则 Sprint-2】
- Web React19 + Vite + antd + TS；H5 React + antd-mobile + ECharts（Vite H5 主路径，企微/钉钉容器）。
- 请求封装：envelope 解析、401 回登录、SSE 用 fetch；消息协议见 F5（另行设计）。
- Keycloak 登录：PC 走标准 code flow；H5 走 BFF 会话（HttpOnly Cookie）；APP PKCE（Sprint-2）。

## ⑧ 部署与可观测最小集【锁】
- compose 跑全栈（dev 先行）；一次构建镜像，多环境只换 env；生产 HA（PG 主从/PgBouncer）列 Sprint-2。
- 日志 JSON 结构化；指标 + 健康检查；Boot Admin 纳管；tracing 二期。
- 发版线与 dts-stack 独立；备份恢复演练进门禁（Sprint-2 建门禁时落实）。

## 延后清单（明确不做）
ES、tracing、k8s、原生推送、读写分离规模、MinIO HA 形态、灰度发布策略。
