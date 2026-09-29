# Product Backlog（v1.0.0）

**更新**: 2026-09-27（继承 09-26 月度重构，按产品场景补齐切片）
**用途**: 已细化、排在下一个月度 Sprint 的工作。只有 Sprint 目录里的 Task 才是"本月承诺"。当前全部内容计划于 11-02 整体转入 Sprint-6（2026-11）。

## 规则
1. **整体转入、按依赖排周次**：每月第一个工作日把已细化 Feature 转入当月 Sprint，按 Task 依赖层级排周次；不按人力容量切碎连贯工作，不为单个 Feature 开 Sprint。
2. **拉入方式**：把 Feature 目录移入新 Sprint 的 `features/`，按 Sprint 内顺序分配 `F<n>`；Task 编号不变（可以有缺号），在 Feature README 注明"原 BL-X"。只拉入部分 Task 时，其余 Task 留在这里。
3. **新需求**：先判断属于哪个既有 Feature（本月 Sprint 或 backlog），追加为 Task；确实是新工作流时才在这里新增 `BL-<字母>` Feature，并在月度规划评审中确认。
4. **未完成的 Task**：月底仍未完成的 Task 回到 backlog 对应 Feature（或随 Feature 进入下月 Sprint），不延长 Sprint、不新开 Sprint。
5. 交叉引用写作 `BL-S/T07`；拉入 Sprint 后按 `sprint-5-202610/assets/renumber-20260926.md` 的做法登记对照。

## 已细化条目

| 序 | ID | Feature | Task 数 | 优先级 | 目标月份 | 来源 |
|----|----|---------|---------|--------|----------|------|
| 1 | [BL-A](features/BL-A-AppPack运行时与领域资产外置/README.md) | AppPack运行时与领域资产外置 | 22 | P0 | 2026-11（W1–W4；T18 安全依赖完成后，T22 W2 探索/W4 收口） | 原 AppPack / 领域资产 / DAP；新增 DTS-C02 探索 |
| 2 | [BL-S](features/BL-S-铁律安全基座-网关出口审计/README.md) | 铁律安全基座-网关出口审计 | 18 | P0 | 2026-11（W1–W3，含完整审计） | 原统一身份、数据出口与审计 |
| 3 | [BL-D](features/BL-D-数据中台收敛-BI口径Finance/README.md) | 数据中台收敛-BI口径Finance | 17 | P0（首个数据场景）/P1（其余） | 2026-11（W1–W4） | 原收敛任务；新增 DTS-C01 数据产品 |
| 4 | [BL-C](features/BL-C-Console-BFF与真实数据接入/README.md) | Console-BFF与真实数据接入 | 8 | P0 | 2026-11（W2 骨架，W3 页面接入，W4 全量切换） | 新增（ADR-013：UI 驱动 BFF） |
| 5 | [BL-E](features/BL-E-端到端竖线验收与发布/README.md) | 端到端竖线验收与发布 | 4 | P0 | 2026-11：W3 阶段 A，W4 阶段 B 与发布 | 原端到端验收，首次业务联调前移 |

**依赖**: BL-A 依赖 Sprint-5 F0（ADR-005/012）与 F1；BL-S 依赖 ADR-008/009；BL-D 口径/数据产品依赖 ADR-007，BI 收敛另依赖 ADR-006。BL-E/T01 阶段 A 仅依赖首个场景链，阶段 B 依赖当期全部发布范围，详见其 Task。
**关键路径**（原 Sprint-5）: F0/T01 → F0/T07 → F0/T12 → F1/T03 → BL-A/T04 → BL-A/T09 → BL-S/T09 → BL-E/T01

**当前选取原则**：[产品能力规划](../docs/plans/2026-09-27-product-capability-roadmap.md) §4 优先一个 PRS 数据场景，跨 BL-A/BL-S/BL-D/BL-C/BL-E 拉入完整切片，不逐个做完整个 Feature 才联调。共 **5 Feature / 69 Task，全部 DRAFT**，全部计划于 Sprint-6（2026-11）完成，周次见规划 §4。审计最小链与场景一起交付，不以早期试点为由后置。

## 待细化条目（尚无 Task 文件）

| 条目 | 归属 | 目标月份 | 出处 |
|------|------|----------|------|
| Wiki 看板/列表视图（基于 `page_meta`） | Wiki 后续规划 | 待定 | Sprint-5 F2/design/10 §3.4 |
| Wiki RAG 生产接入（探索已细化为 BL-A/T22；此行仅指后续实现） | BL-A / studio 知识中心 | T22 结论后评估，非 v1.0.0 必达 | DTS-C02；Sprint-5 Wiki 非目标 |

## 版本级完成标准（Sprint-6 验收）
- [ ] **契约**：`pack-manifest` v1 JSON Schema、`PackRegistry` REST、`QueryGateway` 接口、`dts.audit.v1` 事件、agent UI 消息 Schema 均有契约测试（BL-A、BL-S）。
- [ ] **边界**：静态扫描确认 studio engine 源码与 classpath 中无 `flowerbiz|xycyl_|rs-flowers|Finance[A-Z]` 领域硬编码（BL-A/T14、BL-D/T15）。
- [ ] **安全**：红队 SQL 用例集（≥40 条）全部被拦截或在只读事务中失败；跨租户查询 0 行；无租户上下文时 fail-closed（BL-S）。
- [ ] **UI**：alice 在 DTS Console 工作台完成提问，看到答案、证据等级与审计号（四态截图）；Pack 管理页可查看已安装 Pack（Sprint-5 F6 原型，BL-C 接真实数据，BL-E/T01 验收）。
- [ ] **竖线**：在运行实例上完成主竖线（契约链见 `sprint-5-202610/README.md` §端到端契约链），Kafka 中可查到对应审计事件（BL-E/T01）。
- [ ] **可回退**：旧 copilot 后端按兼容方案并行；前端回退为已验证 Console/BFF 组合，首版撤回新入口并保留原业务路径（BL-E/T02）。
- [ ] **业务一致性**：同主体/租户/快照/指标版本下，PRS 原页面/API 与 AI 的项目集合及计数一致，来源、新鲜度、质量异常与无权限有明确反馈（BL-D/T17）。
- [ ] **价值证据**：保留人工/API 与 AI 同批任务的时间、成功率、纠正次数及成本；未知项明确未测，不以搬仓、表数或服务数充当客户收益（BL-E/T01）。
- [ ] **知识范围**：10 月授权读取接口与后续 RAG 探索分别记状态；探索结论不计生产知识问答上线。
