# 版本与公共镜像承接

资料导入日期：2026-09-26。下表是已存在文件的快照核对，**不是今日全网最新版调研**。
原 BOM 核实于 2026-09-18，公共镜像对齐记录为 2026-09-20；升级窗口前再核验官方制品可用性、安全补丁与兼容性。

| 层次 | 原记录/源码声明 | 当前承接状态 |
|---|---|---|
| PRS 应用 | JDK 25 / Boot 4.1.1 / Modulith 2.1.1 / Liquibase 5.0.4 / PG JDBC 42.7.13 | `sources/pom.xml` 一致；构建/兼容性未在本轮复验 |
| PRS 基础镜像 | `postgres:18.6`、`valkey/valkey:9.1.2`、`quay.io/keycloak/keycloak:26.7.4`、`traefik:v3.7.13` | 导入 Compose 声明一致；实际运行版本待取证 |
| 构建镜像 | `maven:3.9-eclipse-temurin-25`、`eclipse-temurin:25-jre` | 4 个 Dockerfile 沿用原声明，仍需在正式构建时记录 digest |
| 共享 Stack 组件 | `apache/kafka:4.3.1`；Keycloak/PG/Traefik 同公共基线 | 原记录为静态配置对齐，不能据此宣布共享实例已升级 |
| Copilot 扩展 | PG18.6 + pgvector 0.8.6 固定 digest、Ollama 0.18.0 | 使用下方原清单，不由 PRS 另建实例或改平台版本 |
| PRS 新前端选型 | Node 24 LTS / TS 6.0.3 / React 19.2.8 / Vite 8.2.2 / antd 6.6.4 | 原 BOM 的选定值，`sources/` 尚无前端实现；不代表已构建 |
| 3 月参考原型 | Java21 / Boot3.4.3、React18.3 / Vite6.2 / TS5.8 | 历史参考；不作为新 BOM，也不在本轮升级 |
| 后续组件 | SeaweedFS、Flowable、Debezium、k8s 配套等 | 选型/待验证项，不扩展为 Sprint-5 全量部署清单 |

权威来源（按原核实日期）：[版本基线](../sprint-1-202609/assets/版本基线.md)、[公共镜像基线](../sprint-1-202609/assets/公共镜像基线.md)、[原构建说明](../../../../../../../dts-app-stack/prs-stack/sources/README.md)。前两者保留原文；许可证描述、支持期限与升级行为属于历史记录，正式选版时需重新核验，不能直接据此作当前合规结论。

## Sprint-5 需要的版本证据

1. F0/T03 在隔离环境按锁定 BOM 构建并验证登录、种子、项目 API；保留旧 BOM 记录，另出新版本结果。
2. F2/T05 将“公共镜像已对齐的声明”与“Java21→25 / Boot3→4 的应用迁移”分开；PRS 不倒退，平台不因合并强制升级。
3. F9/T01 核对共享 Keycloak 的实例、realm、实际版本和旧 realm 回归；记录 dev 单实例与正式共享部署的差异。
4. F13 记录 commit、image tag、digest、CPU 架构、PGDATA、卷挂载、账号、测试结果；全部镜像不使用浮动 `latest`。
5. PG18 挂载父目录 `/var/lib/postgresql`；重建使用独立空库/卷，不删除现有卷，不把空库安装冒充历史升级。

构建/运行时不得把原 `.env` 导入版本库；仅带 `.env.example` 的开发占位值，真实配置由部署环境提供。
