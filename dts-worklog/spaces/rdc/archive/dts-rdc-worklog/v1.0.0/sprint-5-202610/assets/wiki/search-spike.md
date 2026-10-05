# T03 中文全文检索 spike：pg_bigm vs zhparser（+ pg_trgm 对照）

**Task**: `F2/T03` · **状态**: DONE · **日期**: 2026-09-26 · **耗时**: 约半人日
**结论**: 选 **pg_bigm**，W-ADR-8 转 Accepted。结论已回写 `design/00` D9；自定义镜像
`dts-wiki/src/main/docker/postgres.Dockerfile`（镜像名 `dts-wiki-db:18-bigm`）已验证可构建可用。

## 1. 方法

- 语料：dts-rdc 全部 661 个 md → 纯文本（去 frontmatter/围栏标记/链接 URL 留文字，
  近似 03 §7 的 CommonMark 取文本规则），共 1.18MB，入 PG18 临时表 `docs(path,title,body)`。
- 查询集 30 条（`terms.txt`）：纯中文词 q01–q10、中英混合 q11–q15、短词 q16–q20、
  代码标识 q21–q25、错别字 q26–q28、长句 q29–q30；每条带已知相关页（ground truth），命中 top-5 计召回。
- 检索式（即 02 §3 的 `page_search_doc` 用法）：`WHERE body LIKE '%词%' ORDER BY <sim>(body,'词') DESC LIMIT 5`，
  计 top-5 命中与 `EXPLAIN ANALYZE` 执行 ms。
- 环境：本机 Docker，`postgres:18`（PG 18.6）；pg_bigm 由源码编译（HEAD `8c0a691`），
  pg_trgm 为官方自带；zhparser 因时间盒只做构建成本与适配性评估（见 §4）。

## 2. 结果

| 方案 | 召回（top-5） | 时延（661 篇/1.2MB） | 索引体积 | 镜像构建 |
|------|---------------|----------------------|----------|----------|
| pg_bigm（GIN `gin_bigm_ops` + `bigm_similarity`） | 26/30 精确命中；q16 相关命中（见 §3）；q26–28 错别字 LIKE 无命中（预期内） | max 27ms，p95 约 12ms | 3224KB | 需自编译（本 spike 已验证，见 §5） |
| pg_trgm 对照（GIN + `similarity`） | 同左（同一 4 条 miss，行为一致） | max 27ms，p95 约 16ms | 4368KB（大 35%） | 官方镜像自带 |
| zhparser + SCWS | 未实测（见 §4；预期排序更优、短词/代码标识更差） | — | — | SCWS autotools 编译 + 词典运维 |

决定性差异（短词索引）：
- `LIKE '%报花%'`（2 字）：pg_trgm → **Seq Scan**（26ms，全表扫；trigram 需 ≥3 字才走索引），
  pg_bigm → **Bitmap Index Scan on ix_bigm**（走索引）。
- `LIKE '%租户隔离%'`（4 字）：两者都走 Bitmap Index Scan。
- 即：wiki 检索以 2 字中文词为主（"同步""网关""报花"），pg_trgm 在该主场景下索引失效，
  数据量上万页后必超 07 §4 的 800ms 预算；pg_bigm 无此问题。

## 3. miss 项说明（非方案缺陷）

- q07/q15：原查询词（"部署回退"/"Docker 镜像"）在语料中**零出现**，属 ground truth 失误；
  修正为"切换与回退"/"docker save"后两方案均 top-5 命中（F5 运维页、T01 建仓页）。
- q16"报花"：18 篇含该词，两方案 top-5 均为 PRS 花卉相关页（`products/prs/docs` 等），
  属相关命中；原 truth（只认 `flowerbiz` 看板路径）过窄。附带发现：大文档（sprint-5 README 25KB，
  "报花"仅出现 1 次）被 `similarity` 压分——排序层面两者行为一致，后续如需调权（标题加权），
  两方案都支持（`bigm_similarity(title,..)*w + bigm_similarity(body,..)`），不 блоки选型。
- q26–q28 错别字：LIKE 精确路径无命中符合预期；另测纯相似度全表排序
 （`ORDER BY similarity/bigm_similarity LIMIT 5`）——两方案 top-5 均未稳定命中 truth，
  短查询在 1MB 级 body 上的相似度区分度不足。结论：错别字容忍不由本层解决（v1 不做；
  后续可在前端做查询改写/拼音建议，不在本 spike 范围）。

## 4. zhparser 评估（未实测，基于构建与适配分析）

1. 构建链：SCWS 无 workshops 预编译包，需 autotools（`autoreconf -i` + configure + make install），
   再编译 zhparser 并挂词典（自带 `dict.utf8.xdb`）；本机已验证到 clone 层，完整链明显重于
   pg_bigm（单 C 文件 + `make USE_PGXS=1`，约 1 分钟）。
2. 适配性：SCWS 通用词典对 IT 标识（`SyncOutbox`/`QueryGateway`/`Nl2SqlService`，q21–q25 类）
   切分效果差，需自维护补充词典——新增持续运维项；而 bigm 二元组对中英混合与代码标识零词典即用，
   本 spike q21–q25 全部命中。
3. 排序：`ts_rank` 理论上更优，但 §2 显示 bigm 在 30 条集上排序与 trgm 一致且满足预算，
   v1 无需为此引入分词运维。后续若万页规模出现排序投诉，再评估（检索 SQL 已把相似度函数
   隔离在一处，切换成本低）。

## 5. 交付与后续

1. **自定义镜像**：`dts-wiki/src/main/docker/postgres.Dockerfile`
   （多阶段：`postgres:18` + `gcc/make/postgresql-server-dev-18/libicu-dev` 编译 pg_bigm @`8c0a691`，
   终态只含 `.so` + extension SQL/control）。已验证：`docker build -t dts-wiki-db:18-bigm-spike` 成功，
   启动后 `CREATE EXTENSION pg_bigm; SELECT bigm_similarity(...)` 正常（457MB）。
   注意：`make` 必须显式 `PG_CONFIG=/usr/lib/postgresql/18/bin/pg_config`（镜像内 PATH 有同名包装器，
   否则 `--pkglib` 为空）；`ARG PG_MAJOR` 在 builder/final 两段各声明一次。
2. **02 §3 已一致**：`9000_extensions.xml` 的 `CREATE EXTENSION IF NOT EXISTS pg_bigm;` 与
   `gin_bigm_ops` 索引定义即按此结论书写，无需修改。
3. **W-ADR-8 → Accepted**：PG 内实现，不引入搜索集群；`searchEngine: no` 保持（JDL 已是 `no`）。
4. 性能预算（07 §4 检索 P95 < 800ms）：本集 p95 约 12ms（含排序）；1 万页模拟数据的压测留给 F5/T03
  （按 02 §2 体量估算，GIN 索引随行数亚线性增长，预算内）。
5. 复现：开发机容器 `wikispike-pg`（PG18 + 双扩展，661 篇语料）、脚本与查询集
   `/tmp/opencode/search-spike/`（`build_corpus.py`、`terms.txt`、`run.sh`、
   `results-trgm.tsv`、`results-bigm.tsv`）。
