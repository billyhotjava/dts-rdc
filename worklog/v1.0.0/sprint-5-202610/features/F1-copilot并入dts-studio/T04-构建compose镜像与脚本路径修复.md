# T04: 构建、镜像与交付路径修复

**原编号**: Sprint-5 F3/T04（2026-09-26 按月度 Sprint 整合重编号；保留文件名以稳定引用）

**优先级**: P0
**状态**: IN_PROGRESS
**依赖**: T03；正式交付适配消费 F7/T02、T25

## 目标
engine 在新位置具备独立的后端构建、测试和打包入口；镜像与正式部署路径按 ADR-014/F7 收口。旧 Compose 仅保留来源参考，不作为 Studio 正式交付或回退入口。

## 技术设计
- 根目录 `build.sh` 委托 `engine/build.sh`，支持 `verify`、`package`，默认执行完整后端测试；不加载运行 `.env`，不构建旧 webapp，不启动业务服务。
- `engine/scripts/with-test-postgres.sh` 为现有 JSONB 用例创建独立测试数据库：随机 loopback 端口、tmpfs、显式测试身份，覆盖继承的 `PG_*`；成功和失败均清理本次创建的容器。离线使用预载镜像，不隐式 pull。
- Maven module 路径为 `engine-ai` / `engine-analytics`；Java 包名和 artifactId 保持原值。两处测试的 worklog 资源引用改到 `worklog-history`，保持原有断言。
- 原部署脚本、Compose 和服务配置迁至 `engine/deploy/legacy/`，明确不能直接作为新部署命令使用；历史版本调整随导入保留。
- **仍待实现**：按 F7/T02 规范向 T25 提供 Studio 镜像、chart 配置及健康探针；镜像命名采用 `dts-studio-engine-ai`，过渡 analytics 的部署范围受 ADR-006 约束。旧 webapp 不进入镜像或 chart。
- **仍待实现**：CI 调用相同构建入口，记录受测 SHA、镜像标识和制品清单；索引在迁移后按需要重建。不得以 Maven 测试通过代替镜像或 K8s 验收。

## 验证
- [x] `/data/dts-studio/build.sh verify` 成功，610 个后端用例无失败/跳过，两份可执行 JAR 产出。
- [x] 受测代码与记录的 Studio SHA 一致；源仓库及 7 项原有修改保持不变。
- [x] 测试数据库失败退出保留原退出码，容器已清理，不接触业务库。
- [ ] 镜像构建与 F7/T25 chart/健康检查验证。
- [ ] CI 对当前分支执行并保留结果。
- [ ] F0/T02 固定上下文下 API/SSE 回归；由 T06 联合记录。

## Definition of Done
- [ ] 构建、镜像、CI 与交付接口验证完成，证据进入 `it/IT-02-studio-build.md`；正式部署状态另由 F7/BL-E 记录。

## Implementation checkpoint (2026-09-29)

Root/engine build entry and disposable PostgreSQL harness implemented; both backend JARs built. Legacy deployment files are references only; image/chart/CI delivery remains pending with F7/T25.

Evidence: [implementation record](../../assets/studio-refactor-20260929.md), [IT-02](../../it/IT-02-studio-build.md).
