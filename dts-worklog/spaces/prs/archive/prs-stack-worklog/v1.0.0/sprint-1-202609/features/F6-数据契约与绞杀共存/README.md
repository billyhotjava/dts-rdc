# F6: 数据契约与绞杀共存策略
产品 Feature：PF-DATACONTRACT；需求依据：R-004（按域绞杀）、R-008（每域单一事实源）、三驾马车定位（sprint-queue.md）；
Sprint 账本 #12~#14（ODS 命名、copilot 语义包与口径 SoT 现状）。
负责人：待确认；优先级：最高（与 F1 并列，决定 Sprint-2 起每个域怎么切换）；状态：DRAFT。

## 使用场景与验收
调用者：Sprint-2+ 各域负责人、dts-stack 数据/运维对接人、dts-copilot 语义包负责人。触发：任何域开始重写前。
输入：F1 域划分与长事务链、老库 ODS 现状、copilot 语义包/dbt 包依赖的表清单。
结果：① 共存策略 ADR（事实源切换规则、同步方式、回切方案）；② 下游影响清单 + ODS 兼容契约 + 数据画像。
正常流程：T01 起草 ADR → 三方评审（prs 架构 / stack / copilot）→ T02 影响评估与兼容契约 → 签认。
替代流程：stack 或 copilot 对接人不可用 → ADR 标"假设"发布，F7 按假设推进，Sprint-2 首个域切换前必须补签。
失败流程：评审认定"按域切换 SoR"不可行（如长事务链跨域）→ 回写 R-008，改为"链路整体切换"，F1/T03 排序随之调整。
规则与边界：任一时点每个切换单元只有一个事实源；不做双写；老系统冻结期只修 bug（F1 清单 §11）；
既有 `ods_ptr_mysql_*` 表与 `xycyl_*` dbt 模型本期不改，只新增兼容层。
验收示例：Given ADR 与兼容契约已签认 / When Sprint-2 首个域规划切换 / Then 能直接回答"切换前后谁是 SoR、ODS 读哪边、
copilot 语义包是否要改、如何回切"四个问题。
本期范围：策略与契约文档 + 首批域与 `p_project` 的数据画像。后续切片：各域切换 runbook（随域 Sprint）。
非目标：同步工具实现（F7/T02 只做 `p_project` 一张表的验证）；copilot/dbt 模型改造。

## 设计
概念与共享架构：以 R-008（sprint-queue.md）的规则 1–5 与单元生命周期（未迁移 → 影子期 → 切换 → 保护期 → 退役）为准。
切换前 老 MySQL（SoR）→ 新 PG（只读副本）；切换后反向同步 新 PG → 老 MySQL，既为回切，也为仍在老系统上的域供数；
切换单元由跨域写矩阵决定（账本 #17）。
dts-stack ODS 并行接入 `ods_ptr_mysql_*`（老）与 `ods_prs_pg_*`（新），
兼容视图按 SoR 选择来源，输出与老 ODS 同形（含 `_dts_source_system` 标识来源），下游 dbt/copilot 只读兼容视图。
概要协作：prs 定义新表 → 登记 ODS 源 → 兼容视图映射（新列 → 老列）→ dbt 构建不变 → copilot 语义包不变。
关键契约：
- SoR 登记表：域 / 当前 SoR / 切换日期 / 回切截止 / 负责人。
- 兼容视图命名：`xycyl_ods_compat.<老表名>`（schema 与既有 `xycyl_*` 命名空间一致，T02 与 stack 对接人确认）。
- 新源命名：`public.ods_prs_pg_<新表名>`，保留 `_dts_*` 审计列。
- 列映射表：新列 / 老列 / 类型转换 / 枚举映射（涉及 §2 状态码变化时必须列出）。
UI 或使用路径：无（契约文档）。
详细设计：见 T01–T02。
未决项：`ods_prs_pg_*` 采集配置由谁负责（stack 运维 or prs 团队）——T02 关闭；同步管道选型（CDC 首选）——T01 关闭；
标准级多租户在中台侧的行级策略（B-007）——T02 提出需求；
兼容视图切换源是否需要同步改 copilot sprint-31 口径 SoT 的数据源登记——T02 与 copilot 对接人确认。

## Task
| ID | 类型/目标产出 | 负责人 | 输入依赖 | 估算 | 验证方式 | 状态 |
|---|---|---|---|---|---|---|
| T01 | 设计：绞杀期数据共存策略 ADR | 待确认 | F1 域划分；R-008 | 3 点（假设） | 三方评审通过，四个问题可回答 | DRAFT |
| T02 | 设计：下游影响评估 + ODS 兼容契约 + 数据画像 | 待确认 | T01；stack/copilot 表依赖清单 | 2 点（假设） | 影响清单签认；`assets/domain-profile.md` 建立 | DRAFT |

## Feature 完成标准
ADR 与兼容契约经 prs/stack/copilot 三方签认；`assets/domain-profile.md` 覆盖 `p_project` 与首批域主表；
未决项有书面去向。F7 竖线按本契约落地并通过，作为本 Feature 的实证。
