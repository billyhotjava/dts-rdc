# Studio 回答来源追踪 — 2026-09-30

本次承接 BL-A/T04、T06，沿用 `feature/studio/engine-import`，基线提交为 `06a6a8c6bc3a9731c6e4951a2904bb38bdf6166c`。代码仍为未提交工作区改动，未发布或部署生产。

## 已实现

- `PackSourceRef` 与 JSON Schema 定义 `{type:"pack",name,version}`；`PackReadScope` 在 Agent 的实际执行线程收集读取证据，结束或异常时释放，嵌套调用与不同线程隔离。
- 语义、规则等 Registry 缓存保留所属版本，命中缓存仍记录来源；提示词直接读取同样记录来源。未使用的 Pack 不因处于 ACTIVE 状态被自动列为来源，旧 classpath 回退不虚构版本。
- 查询模板加载既有 `source_pack_version_id`，批量解析不可变的所属版本。即使读取期间激活状态改变，也按模板行的实际所属版本归属；手工/历史模板不自动归属 Pack。缺失所有权元数据时拒绝猜测。
- 普通回答、SSE `done`、历史消息增加 `packRefs[]`，与持久化 `trace.packRefs` 一致。消息回放读取原记录，不查询当前 ACTIVE 版本。
- 一次生成过程中如先后读取了不同版本，则均保留并去重；仅发生激活而没有读取新版本时，不改变旧回答来源。本次不引入整次对话固定 generation 的语义。

来源表示本次执行读取/查询过的能力包依赖（包括路由目录、治理规则等），不证明其中每个资产都直接贡献了最终答案。当前工具调用同步执行；未来增加异步 Pack 读取时，必须显式传递和合并来源上下文。

## 兼容性决策

源代码显示：旧 REST `sourceRefs` 为字符串，旧 SSE 同名字段为字符串数组。因此本次采用增量字段 `packRefs`，没有改变旧字段类型。T17 与 BL-C/T02 负责映射到 Console 的统一结构化 `sourceRefs[]`，复用 `protocol/pack-source-ref.v1.schema.json`；此子契约不等于完整 UI Schema、TS 包或 Console 消费已交付。

新回答没有 Pack 读取时返回空数组；历史消息没有来源记录时不添加该字段。新来源复用既有 `trace` 持久化列和已存在的模板所有权列，无新数据库迁移。

## 验证

所有测试在 `/data/dts-studio` 执行，数据库仅为脚本创建并自动清理的隔离容器；源码位于 `/opt/prod/dts/dts-rdc/dts-studio`。

| 检查 | 结果 | 证据 |
|---|---|---|
| 定向回归 | 97 项通过，0 失败/错误/跳过 | `/data/dts-studio-provenance-20260930/focused.log` |
| AI 全量 `clean verify` | 528 项通过，0 失败/错误/跳过，JAR 打包成功 | `/data/dts-studio-provenance-20260930/ai-verify.log` |
| 真实 Spring Boot HTTP 运行测试 | 1 项通过：安装/激活、57 个模板、5 个有效领域、106 条问题匹配与 SQL 基线、普通回答、SSE、历史消息 | `/data/dts-studio-provenance-20260930/runtime-http.log` |
| 新增用例 | 12 项，已计入 528，覆盖缓存、版本切换、模板归属、异常释放、嵌套/线程隔离及历史消息 | `PackProvenanceTest`、`AgentPackProvenanceTest` |
| 来源契约 | 用真实执行结果验证来源 JSON Schema；SSE 与持久化/回放字段相等 | `AgentPackProvenanceTest` |

复现命令（工作目录 `/data/dts-studio`）：

```sh
./engine/scripts/with-test-postgres.sh mvn -B -ntp -f engine/pom.xml -pl engine-ai clean verify
STUDIO_TEST_POSTGRES_IMAGE=pgvector/pgvector:pg17 ./engine/scripts/with-test-postgres.sh \
  mvn -B -ntp -f engine/pom.xml -pl engine-ai -Dtest=PackRuntimeSmokeIT \
  -Dstudio.pack.archive=/data/dts-studio-migration-20260929/prs-flower-0.1.1.dtspack test
```

统计不可相加：97 项为 528 项中的定向子集，106 条模板问题为运行测试中的逐题断言。Analytics 本轮未修改、未重跑，不把历史测试计为本轮结果。最初有一处测试辅助函数的 checked exception 编译错误，修正后重新执行通过；最终日志对应修正后的源码。

## 保留边界

- T04/T06 继续 IN_PROGRESS：运行代码已补齐当前溯源切片；业务答案准确性基线、领域种子移除和统一 UI 消费仍按各自 Task 完成。
- 身份/租户验证、Stack 受控取数、动作审计外发、Console/BFF 及跨系统业务验收仍未闭合。
- 测试使用模拟模型和隔离业务资产，不宣称真实模型或线上业务查询验收通过。
- 未变更 PRS Pack 0.1.1 的内容，未发布新 Pack 版本，未运行远端 CI。

机器可读证据：[verification JSON](pack-provenance-verification-20260930.json)。
