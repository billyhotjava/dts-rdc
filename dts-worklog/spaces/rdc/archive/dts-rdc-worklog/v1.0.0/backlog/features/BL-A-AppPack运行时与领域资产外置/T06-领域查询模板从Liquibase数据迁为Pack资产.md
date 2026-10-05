# T06: 领域查询模板从 Liquibase 数据迁为 Pack 资产

**原编号**: Sprint-5 F4/T06（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: IN_PROGRESS
**依赖**: T04

## 目标
把 Liquibase changeset 010/011/015–018/021/022/024–034（账本#14）中以 `insert` 方式写入的**领域查询模板数据**，转换为 prs-pack 的 `templates` 资产；
引擎数据库只保留表结构，模板内容由 Pack 激活时同步进来。

## 技术设计
- **步骤**：
  1. 解析上述 changeset，找出所有写入模板表的 `<insert>`、`<update>`、`<sql>`（表名以实际 changeset 为准，例如 nl2sql 模板表、mart 模板表）；写一次性转换脚本 `engine/tools/liquibase-to-pack-templates`，输出 `prs-stack/pack/templates/<domain>.yaml`，每个模板包含 `id, domain, intent, question_patterns[], sql, params[], datasource_ref, version`；
  2. **注意后续 changeset 的修正**：`031/032` 是对 `030` 的修正（`runtime_fix`、`dataset_fix`），转换时必须按顺序重放，取最终状态，不能只取 insert；
  3. 模板表增加列 `source_pack_version_id bigint null`；Pack 激活时，`TemplateSyncService` 在同一事务内"删除旧 pack 版本的模板 → 插入新版本的模板"；手工在 UI 创建的模板（source 为 null）不受影响；
  4. 旧 changeset **不删除**（Liquibase 校验和不能改），新增 `v1_1_0_002__detach_domain_templates.xml`：把旧的领域模板行标记为 `source='legacy-liquibase'`，Pack 首次激活时由 `TemplateSyncService` 接管（按 id 覆盖）。
- **错误路径**：模板 SQL 引用了不存在的视图 → pack 校验阶段给 warning（没有数据库连接时无法判断），BL-E 竖线验收时再检查。

## 验证
- [x] 开发验证：转换前后 106 条问题的模板命中与 SQL 均一致（原始基线保留，见 2026-09-30 记录）
- [x] 开发验证：`studio-pack` profile 空库跳过历史种子，仅安装 Pack 后恢复模板与对话能力

## Definition of Done
- [ ] 模板资产进入 prs-pack，回归通过

## 2026-09-29 编码进展

顺序重放 19 个 changeset 得到 57 个模板；内容指纹识别旧种子、手工模板保护、事务投影与回滚、缓存 generation 刷新已实现。全新发布配置跳过历史种子仍待收口。

证据与未完成项：[Pack runtime checkpoint](assets/pack-runtime-20260929.md)。状态不等同于部署或业务验收完成。

## 2026-09-30：模板来源追踪

JPA 模板对象映射既有 `source_pack_version_id`，匹配缓存加载时批量解析所属 Pack 名称/版本；缓存命中复用该证据，不以当前 ACTIVE 版本倒推旧模板来源。缺失所属版本时拒绝猜测，手工/历史模板不附加 Pack 来源。未新增数据库迁移或业务数据连接。详见 [验证记录](assets/pack-provenance-20260930.md)。

## 2026-09-30：空库仅加载 Pack 的启动路径

已新增 `studio-pack` profile：关闭 classpath 回退，用 Liquibase context 跳过 24 个历史领域种子 changeset；旧 SQL、ID、author、path 不变，61 个原 changeset 的校验和逐项一致。新建库持久化模式标记；丢失 profile 或把已有旧种子历史的库切为新模式时拒绝启动迁移，避免悄悄重新灌入旧模板。

空库对比发现同优先级模板依赖物理返回顺序。新增可空 `match_order` 列与模板子契约，PRS 0.1.2 显式携带 57 个顺序值；导出器重放原模板迁移及所有权接管后冻结顺序，停用模板附在活跃序列之后。优先级仍优先于顺序；SQL、参数、匹配表达式、优先级和启用状态均未改变。激活/回滚与顺序更新同事务，手工模板保留。

仅按编号排序或直接采用早期种子顺序均不足以保持旧结果；最终以修改前保存的 106 条实际匹配结果逐题验证，无重新生成预期来掩盖变化。编码与开发验证详见 [新库启动记录](assets/pack-bootstrap-20260930.md)。本段是第一轮 commit/push 后的继续完善，尚未再次提交/推送；正式评审与发布仍待后续阶段，状态保持 IN_PROGRESS。
