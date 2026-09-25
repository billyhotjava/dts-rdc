# F3: copilot 并入 dts-studio（保留历史）

**优先级**: P0
**波次**: A
**状态**: DRAFT

## 目标
dts-copilot 的代码与 git 历史进入 `dts-studio/engine/`，studio 成为"规则 + 协议 + 可运行引擎"的 AI 头脑仓库；
合并后功能与 F0/T02 基线一致，copilot 原仓库冻结。

## 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 目录 | `dts-studio/engine/` | `pom.xml`（原 CP/pom.xml）、`engine-ai/`（原 dts-copilot-ai）、`engine-analytics/`（原 dts-copilot-analytics，按 ADR-006 过渡保留）、`webapp/`（原 dts-copilot-webapp）、`deploy/`（原 docker、docker-compose*.yml、services、scripts）、`worklog-history/`（原 CP/worklog） |
| 构建 | `dts-studio/engine/build.sh` | 与原 `CP/build.sh` 行为一致（账本#21） |
| 镜像 | 镜像名 | 新名 `dts-studio-engine-ai`、`dts-studio-webapp`（`engine-analytics` 视 ADR-006 定）；compose 中保留旧名别名一个版本周期 |
| Java 包名 | `com.yuzhi.dts.copilot.*` | **本 sprint 不改包名**（降低风险）；改名登记为后续技术债 |
| API 路径 | `/api/ai/*`、`/api/*` | 不变 |

## UI/UX 规格
用户面不变：webapp 路由、页面、登录方式都不变（登录改造由 F9 负责）。验收时，工作台问数截图与 F0/T03 一致即可。

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | copilot 逐包/逐资源归属清单 | P0 | DRAFT | F2/T01、F2/T02 |
| T02 | 保留历史的合并方案演练 | P0 | DRAFT | F1/T03 |
| T03 | 执行合并进入 studio/engine | P0 | DRAFT | T02、F2/T01 |
| T04 | 构建、compose、镜像与脚本路径修复 | P0 | DRAFT | T03 |
| T05 | copilot 原仓库冻结与 worklog 迁移 | P1 | DRAFT | T03 |
| T06 | 合并后回归验证 | P0 | DRAFT | T04、F0/T02 |

## Definition of Ready
- [x] 契约已钉死  - [x] 竖切片：功能不变  - [x] UI：不变  - [ ] 依赖：ADR-005/006  - [x] 验收：T06

## 完成标准
- [ ] `git -C dts-studio log --follow engine/engine-ai/src/main/java/.../Nl2SqlService.java` 能追溯到 copilot 的原始提交
- [ ] 146 个测试全部通过；golden set 与基线差异 ≤ 2%
