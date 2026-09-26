# T03: 中文全文检索 spike（pg_bigm vs zhparser）

**优先级**: P0 · **状态**: DRAFT

## 目标
在 PG 18 内实现可用的中文全文检索（W-ADR-8），不引入独立搜索集群。

## 评估方法
- 语料：导入 dts-rdc 全部 md（约 200 篇）到临时表。
- 查询集 30 条：纯中文词（"租户隔离""在营项目"）、中英混合（"QueryGateway 实现"）、短词（"报花"）、代码标识（`SqlGuard`）、错别字容忍。
- 指标：召回（人工标注的相关页是否命中）、排序合理性（前 5）、P95 时延、索引体积、镜像构建难度（是否需要自编译扩展）。

| 方案 | 说明 | 预期 |
|------|------|------|
| pg_bigm | 二元组索引，LIKE '%词%' 走 GIN；无需词典 | 召回高，排序靠 `bigm_similarity`；需自定义 PG 镜像编译扩展 |
| zhparser + SCWS | 真正分词，配合 `tsvector`/`ts_rank` | 排序更好；词典维护；编译依赖更多 |
| 仅 pg_trgm | 官方镜像自带 | 对 2 字中文词无效，作为对照组 |

## 产出
`assets/search-spike.md`（结果表 + 结论）；若需自定义镜像，给出 `deploy/postgres/Dockerfile`（基于 postgres:18，多阶段编译扩展）。
