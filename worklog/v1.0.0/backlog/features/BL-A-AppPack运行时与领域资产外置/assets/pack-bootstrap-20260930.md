# Studio 提交与空库启动验证 — 2026-09-30

## 已完成的提交与推送

按照用户“commit 和 push 一次，然后继续完善”的指令，先完成一个跨仓库提交检查点，并用 `git ls-remote` 核对远端 SHA。子仓库先推送、父仓库随后更新 gitlink；未合并到 main。

| 仓库 | 分支 | 已推送提交 |
|---|---|---|
| dts-studio | `feature/studio/engine-import` | `2b697d03b75cdbfb3e437efc6683b732eb3547d7` |
| prs-stack | `feature/studio/pack-runtime` | `8d867d5a31422ed308f1175a9713066d867fb685` |
| dts-app-stack | `feature/studio/pack-runtime` | `b643656307e5483ede02e707d35eb0539377aa2c` |
| dts-rdc | `feature/studio/pack-runtime` | `fae2c6fb809e70b912f9f2db7a31f7bbb504fd7e` |

此检查点包含 Pack 核心运行时、PRS 0.1.1、动作抽象、来源追踪及对应 worklog。PRS/App Stack 原有 README、sources 等未归属于本次重构的改动及 Wiki 工作区均保留。

## 推送后继续实现

以下为继续完善的本地代码，尚未进行第二轮提交/推送：

1. 新增 `application-studio-pack.yml`：空库只跑结构迁移，跳过 24 个旧领域种子 changeset，关闭 classpath 回退。模板、路由规则、业务枚举初始均为空；Pack 激活后写入模板。
2. 旧迁移仅增加 context 元数据，19 个历史 XML 的其余字节完全一致。61 个旧 changeset 的 Liquibase 4.29.2 V9 校验和与提交前快照逐项相同。
3. 新建 `studio_pack_bootstrap` 模式标记。拒绝把已有种子历史的库直接切到新模式，也拒绝新模式库在丢失 profile 后重新执行旧种子。重复执行正确模式为幂等。不得独立覆盖 profile 中的 context/parameter；这不是存量库转换或旧二进制降级方案。
4. 新增可空 `match_order` 列、模板子契约及事务写入。匹配仍先按原 priority，再按 Pack 声明顺序；旧模板未声明顺序时保留原行为，手工行不被接管。
5. PRS 0.1.2 为 57 个模板携带明确顺序。导出器重放原模板迁移及所有权接管更新，冻结活跃模板的实际匹配顺序，停用模板附后。SQL、参数、匹配表达式、原优先级、启用状态等其他字段逐项一致。
6. 增加 `verify-pack-bootstrap.sh`，在两个独立隔离 PostgreSQL 实例中验证旧启动与空库启动，并保留 JUnit XML、日志、106 条基线。

空库验收发现：同优先级模板的数据库物理返回顺序不稳定；按模板编号排序、或只捕获早期种子顺序，都不能保留原答案。最终通过资产声明顺序解决，未在 Studio 硬编码花卉模板偏好，也未重写预期来掩盖行为差异。

## 验证结果

| 检查 | 结果 | 证据 |
|---|---|---|
| AI 后端全量 `clean verify` | 531 项通过，0 失败/错误/跳过，打包成功 | `/data/dts-studio-bootstrap-20260930/ai-final-verify.log` |
| 历史兼容与 Pack 集成定向检查 | 初始 29 项通过；后续完整回归也覆盖对应检查 | `/data/dts-studio-bootstrap-20260930/migrations.log` |
| 最新导出器 | 57 个模板，完整字段比较通过；非活跃模板也有顺序 | `/data/dts-studio-bootstrap-20260930/export-runtime.log` |
| 严格 Pack 校验/构建 | `prs-flower@0.1.2`，31 个资产，0 warnings，重复构建字节一致 | `prs-flower-0.1.2.dtspack`，见下方路径 |
| 空库对比原始预期 | 106 条模板编号及 SQL 与最初的旧模式基线一致；HTTP/SSE/回放、幂等启动、模式切换保护通过 | `/data/dts-studio-bootstrap-20260930/fresh-runtime-ordered.log` |
| 最终双库脚本 | 2 个完整运行测试通过；新生成的旧模式基线也与最初的 106 条基线完全一致 | `/data/dts-studio-bootstrap-20260930/pack-bootstrap.3ZMvWw/legacy.log`、`fresh.log` 及对应 JUnit XML |

全量测试后，对导出器补上运行时接管步骤和停用模板顺序处理，已单独重新编译打包、运行隔离导出、比较全部模板字段，并用最终双库运行测试验证。全量测试数不包含显式执行的两个 `*SmokeIT`；定向测试与 106 条逐题断言不累加到 531。

早期失败及修复均有保留日志：旧库/新库同优先级匹配不一致、模板编号排序改变趋势查询选择、导出未覆盖停用模板，以及新增迁移后测试回滚数量需调整。最终记录仅以末次通过结果作为证据。

复现（在 `/data/dts-studio`，本地已有 pgvector 镜像）：

```sh
./engine/scripts/with-test-postgres.sh mvn -B -ntp -f engine/pom.xml -pl engine-ai clean verify
./engine/scripts/verify-pack-bootstrap.sh \
  /data/dts-studio-bootstrap-20260930/prs-flower-0.1.2.dtspack \
  /data/dts-studio-bootstrap-20260930
```

初始旧预期保留在 `pack-bootstrap.S6wZU7/legacy-golden.json`；最终结果在 `pack-bootstrap.3ZMvWw/legacy-golden.json`，两份 JSON 内容相同。新库启动标记不支持回滚成旧种子模式；模板顺序列具有独立 schema rollback，模板版本切换及回滚的顺序更新也有事务测试。

## 边界

- T06 编码与开发验证的空库缺口已补齐；正式评审、后续提交和发布仍未完成。Feature 状态不标为整体 DONE；README 各任务行已按 Task 文档纠正状态。
- 默认兼容启动路径仍保留；新建库必须明确启用 `studio-pack`。引擎内历史领域代码、资源、表结构的进一步移除仍属 BL-A/T14、BL-D。
- 真实测试只运行于隔离容器，没有部署生产，没有查询生产业务库或调用真实模型，也不构成身份/租户授权的业务验收。
- Analytics 本轮未修改、未重跑；远端 push 已核实，但不据此宣称远端 CI 成功。

机器可读记录：[verification JSON](pack-bootstrap-verification-20260930.json)。
