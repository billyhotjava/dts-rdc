# Sprint-5 集成验收证据

> 只放**真实**证据（命令 + 输出 + 时间戳 + 截图 + commit/镜像 digest）。"TODO" 不算完成。

| IT | 主题 | 对应 Task | 状态 | 文件 |
|----|------|-----------|------|------|
| baseline | 三系统交付基线 | F0/T03 | PENDING | `baseline.md` |
| IT-01 | 仓库布局与 clone --recursive | F0/T06–T09 | PENDING | `IT-01-repo-layout.md` |
| IT-02 | studio 合并后构建与回归 | F1/T04、F1/T06 | PENDING | `IT-02-studio-build.md` |
| IT-03 | 统一网关、身份、登录 | BL-S | PENDING | `IT-03-gateway.md` |
| IT-04 | Pack 安装、激活、回滚与 UI | BL-A/T03、T07、T13；F6/T08；BL-C/T05 | PENDING | `IT-04-pack-install.md` |
| IT-05 | 头脑无领域硬编码 | BL-A/T14、BL-D/T15 | PENDING | `IT-05-no-domain-in-engine.md` |
| IT-06 | 受控查询网关与红队 | BL-S | PENDING | `IT-06-query-gateway.md` |
| IT-07 | BI 收敛 | BL-D | PENDING | `IT-07-bi-merge.md` |
| IT-08 | 口径 SoT 与降级 | BL-D/T03 | PENDING | `IT-08-caliber-sot.md` |
| IT-09 | 审计入 Kafka 与追溯 | BL-S/T18 | PENDING | `IT-09-audit.md` |
| IT-10 | 主竖线端到端 | BL-E/T01 | PENDING | `IT-10-e2e-slice.md` |

## 2026-09-27 产品验收承接

以上 BL-* 行是版本级验收索引，转入 Sprint-6（2026-11）后在其 `it/` 留证，不计入 10 月已通过范围。新增规划尚未执行：

| 证据 | 范围 | 责任 | 当前状态 |
|---|---|---|---|
| `assets/domain-profile.md` / `assets/nfr-budget.md` | PRS 场景、oracle、质量/价值/成本测量设计 | F0/T04、T14、T18 | PENDING；不能代表运行达标 |
| `wiki/W6.5-diagram-agent.md` | Wiki 授权读取、撤权、删除与版本检查 | F3/T15 | 追加用例未执行；既有证据不自动覆盖 |
| 后续 `IT-data-product-prs.md` | 原业务/API 与 AI 同口径、同权限的项目集合与计数 | BL-D/T17 | PENDING |
| `console/`（本月） | DTS Console 外壳与全部页面原型的 mock 走查截图、契约冻结记录 | F6/T01～T13 | PENDING |
| 后续 `IT-10A-prs-first-integration.md` | Sprint-6 W3 首次联调、最小审计链与价值基线 | BL-E/T01 阶段 A | PENDING |
| 后续 `IT-11-console.md` | Console 经 BFF 接真实数据的逐页走查与 E2E | BL-C/T08 | PENDING |
| 后续 `IT-10-e2e-slice.md` | Sprint-6 W4 全回归、人工接管与发布前验收 | BL-E/T01 阶段 B | PENDING |
| 后续 `assets/wiki-rag-spike.md` | Wiki 检索对照探索，非生产 RAG 验收 | BL-A/T22 | PENDING |
