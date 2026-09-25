# T02: Pack 注册表数据模型与迁移

**优先级**: P0
**状态**: DRAFT
**依赖**: T01、F3/T03

## 目标
在头脑库（`copilot_ai` schema，暂不改名）中新增 Pack 注册表，满足"多版本共存、同一 pack 只能有一个 ACTIVE、资产可按 kind/key 快速查询"。

## 技术设计
- **Liquibase**：`engine-ai/src/main/resources/config/liquibase/changelog/v1_1_0_001__pack_registry.xml`，并加入 master changelog。
- **DDL 要点**（PG 18）：
  ```sql
  create table studio_pack (id bigint primary key, name varchar(64) not null unique,
    vendor varchar(64) not null, created_at timestamptz not null default now());
  create table studio_pack_version (id bigint primary key, pack_id bigint not null references studio_pack(id),
    version varchar(32) not null, status varchar(16) not null check (status in ('INSTALLED','ACTIVE','SUPERSEDED','FAILED')),
    manifest jsonb not null, checksum char(64) not null, installed_by varchar(128) not null,
    installed_at timestamptz not null default now(), activated_at timestamptz,
    unique (pack_id, version));
  create unique index uq_pack_one_active on studio_pack_version(pack_id) where status = 'ACTIVE';
  create table studio_pack_asset (id bigint primary key, pack_version_id bigint not null references studio_pack_version(id) on delete cascade,
    kind varchar(32) not null, key varchar(128) not null, content jsonb, content_text text, sha256 char(64) not null,
    unique (pack_version_id, kind, key));
  create index ix_pack_asset_kind on studio_pack_asset(pack_version_id, kind);
  create table studio_pack_generation (id smallint primary key default 1 check (id = 1), generation bigint not null default 0);
  ```
- 主键生成：沿用 engine 现有的 ID 策略（实施前先看 `v1_0_0_001__baseline.xml` 用的是序列还是雪花算法，与之保持一致，不另造）。
- **JPA**：`domain/StudioPack`、`StudioPackVersion`、`StudioPackAsset`；`repository/*Repository`，遵循 engine 现有的 `domain/`、`repository/` 分层（账本#10）。
- **租户**：Pack 属于平台级资源（全租户共享）；"租户覆盖"（R-010 的平台默认 + 租户覆盖）本期不做，但在 `studio_pack_asset` 预留 `tenant_id bigint null`（null 表示平台默认），**本期不读取**。

## 验证（RED→GREEN）
- [ ] 集成测试（Testcontainers PG）：同一 pack 插入两条 ACTIVE 必须违反唯一索引；级联删除正确
- [ ] 在干净数据库上执行 Liquibase update 成功，rollback 可执行

## Definition of Done
- [ ] 迁移合入；干净数据库和已有数据库（F0 基线库的副本）都能升级成功
