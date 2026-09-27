# F1: copilot并入dts-studio

**优先级**: P0
**状态**: DRAFT（DRAFT=6）
**时间窗**: 2026-10 第 2–4 周
**整合来源**: Sprint-5 F3 copilot 并入 dts-studio（保留历史）（2026-09-26 按月度 Sprint 整合）

## 目标
copilot 以保留 git 历史的方式并入 dts-studio（studio-engine），镜像/compose/脚本路径可用，合并后回归结果与 T02 冻结的行为基线等价，原仓库冻结只读。

## Task 列表

| ID | Task | 原编号 | 优先级 | 状态 | 依赖 |
|----|------|--------|--------|------|------|
| [T01](T01-copilot逐包逐资源归属清单.md) | copilot 逐包/逐资源归属清单 | Sprint-5 F3/T01 | P0 | DRAFT | F0/T12（ADR-005）、F0/T13（ADR-006） |
| [T02](T02-保留历史的合并方案演练.md) | 保留历史的合并方案演练 | Sprint-5 F3/T02 | P0 | DRAFT | F0/T08（studio 根目录已清理） |
| [T03](T03-执行合并进入studio-engine.md) | 执行合并进入 studio/engine | Sprint-5 F3/T03 | P0 | DRAFT | T01、T02、F0/T12、F0/T01（copilot 未提交修改已处置，账本#9） |
| [T04](T04-构建compose镜像与脚本路径修复.md) | 构建、compose、镜像与脚本路径修复 | Sprint-5 F3/T04 | P0 | DRAFT | T03 |
| [T05](T05-copilot原仓库冻结与worklog迁移.md) | copilot 原仓库冻结与 worklog 迁移 | Sprint-5 F3/T05 | P1 | DRAFT | T03 |
| [T06](T06-合并后回归验证.md) | 合并后回归验证 | Sprint-5 F3/T06 | P0 | DRAFT | T04、F0/T02 |

> 新需求或 review 发现的问题：在本表追加 Task（编号顺延），不新建 Feature。

## 来源规格：Sprint-5 F3 copilot 并入 dts-studio（保留历史）

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
dts-copilot 的代码与 git 历史进入 `dts-studio/engine/`，studio 成为"规则 + 协议 + 可运行引擎"的 AI 头脑仓库；
合并后功能与 F0/T02 基线一致，copilot 原仓库冻结。

### 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 目录 | `dts-studio/engine/` | `pom.xml`（原 CP/pom.xml）、`engine-ai/`（原 dts-copilot-ai）、`engine-analytics/`（原 dts-copilot-analytics，按 ADR-006 过渡保留）、`webapp/`（原 dts-copilot-webapp）、`deploy/`（原 docker、docker-compose*.yml、services、scripts）、`worklog-history/`（原 CP/worklog） |
| 构建 | `dts-studio/engine/build.sh` | 与原 `CP/build.sh` 行为一致（账本#21） |
| 镜像 | 镜像名 | 新名 `dts-studio-engine-ai`、`dts-studio-webapp`（`engine-analytics` 视 ADR-006 定）；compose 中保留旧名别名一个版本周期 |
| Java 包名 | `com.yuzhi.dts.copilot.*` | **本 sprint 不改包名**（降低风险）；改名登记为后续技术债 |
| API 路径 | `/api/ai/*`、`/api/*` | 不变 |

### UI/UX 规格
用户面不变：webapp 路由、页面、登录方式都不变（登录改造由 BL-S 负责）。验收时，工作台问数截图与 F0/T03 一致即可。

### Definition of Ready
- [x] 契约已钉死  - [x] 竖切片：功能不变  - [x] UI：不变  - [ ] 依赖：ADR-005/006  - [x] 验收：T06

### 完成标准
- [ ] `git -C dts-studio log --follow engine/engine-ai/src/main/java/.../Nl2SqlService.java` 能追溯到 copilot 的原始提交
- [ ] 146 个测试全部通过；golden set 按 F0/T02 的冻结上下文语义等价，安全断言零容差
