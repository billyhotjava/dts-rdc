# T03: Pack 安装/激活/回滚 API

**原编号**: Sprint-5 F4/T03（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: DRAFT
**依赖**: T02

## 目标
实现 BL-A README 中的 5 个 REST 契约，激活操作是原子的，并能通知所有引擎实例刷新缓存。

## 技术设计
- **类**：`web/rest/PackResource`、`service/pack/PackInstallService`、`PackActivationService`、`PackAssetResolver`（接口）+ `RegistryPackAssetResolver`（实现，带缓存）。
- **安装流程**：接收 multipart（大小上限 20 MB，可配置）→ 计算 sha256 → 解压到内存（拒绝 zip-slip：条目路径不得包含 `..` 或以 `/` 开头；条目数 ≤ 2000）→ 执行 `pack-cli` 同一套校验（复用 T01 中的校验库，不要写两份）→ 同一个事务内写入 version（INSTALLED）和 assets → 发审计事件 `dts.pack.installed`。
  重复安装同名同版本：checksum 相同时幂等返回 200，不同时返回 409 `PACK_VERSION_CONFLICT`。
- **激活流程**：单事务：原 ACTIVE → SUPERSEDED；目标 → ACTIVE，写 `activated_at`；`studio_pack_generation.generation += 1` → 事务提交后通知缓存刷新：
  多实例场景通过 PG `LISTEN/NOTIFY`（channel `studio_pack_changed`）或 Resolver 每 10 秒轮询 generation（二选一，推荐轮询，更简单，符合 k8s-ready）。
- **回滚**：选取 `activated_at` 最近的一个 SUPERSEDED 版本执行激活；没有可回滚的版本时返回 409。
- **权限**：需要角色 `STUDIO_ADMIN`（来自 `X-DTS-Roles`，BL-S 之后生效；在 BL-S 完成之前用 admin secret 保护，与现有 `X-Admin-Secret` 机制一致，参见 copilot README 中的 API Key 管理）。
- **错误码**：422 `PACK_INVALID`（body 附 errors）、409 `PACK_VERSION_CONFLICT` / `PACK_ALREADY_ACTIVE` / `NO_ROLLBACK_TARGET`、413 `PACK_TOO_LARGE`、403。

## 验证（RED→GREEN）
- [ ] 契约测试覆盖 5 个端点的成功路径和所有错误码
- [ ] 安全测试：zip-slip 样例、超大文件、条目数超限
- [ ] 并发测试：两个请求同时激活不同版本，最终只有一个 ACTIVE，另一个得到 409 或按顺序生效

## Definition of Done
- [ ] OpenAPI 文档生成；契约测试通过；审计事件可以在日志或 Kafka 中看到（BL-S 之前先写本地审计表）
