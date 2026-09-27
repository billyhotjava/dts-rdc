# T01: Keycloak 实例、realm 与 Organization 设计

**原编号**: Sprint-5 F9/T01（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: DRAFT
**依赖**: F0/T15、F0/T03（Q4：stack 与 prs 是否已共用 Keycloak）

## 目标
确定唯一的 Keycloak 实例（版本遵循 R-012：26.7.x），以及花卉客户的 realm、Organization、client、角色模型，并导出为可以重复导入的 realm JSON。

## 技术设计
- **现状核对**：stack compose 中有 `dts-keycloak`（账本#24）；prs 有 `realm-flower-test.json`（账本#27）；copilot 没有 Keycloak（账本#21）。确认 prs 当前使用的是哪个实例、什么版本。
- **设计**（写入 `assets/iam-design.md`）：
  - realm：`flower`（生产）与 `flower-test`（测试）；stack 自己的平台管理 realm（例如 S10）保持不变；
  - Organization：每个租户一个，属性 `tenant_id`（bigint 的字符串形式），通过 mapper 写入 token 的 `organization` claim（Keycloak 26 的 organization scope）；
  - 角色：realm roles `STUDIO_ADMIN`、`STUDIO_USER`、`PRS_PM`、`PRS_FINANCE`、`STACK_ANALYST`…（与 prs F3 的角色表合并，避免重复定义）；
  - clients：见 BL-S README 的契约；`dts-studio-web` 的 redirect URI 与 web origins 按环境配置；
  - 测试账号：保留 alice=租户 1/PM、bob=租户 2/STAFF 的历史夹具；显式映射到新权限模型，另增双租户同权限账号与 admin，t1/t2 仅为显示别名。
- **产出**：更新后的 `prs-stack/sources/deploy/keycloak/realm-flower-test.json`（或迁到 `dts-gateway/keycloak/`，由 T04 决定位置）。

## 验证
- [ ] 导入后，用 alice 通过 direct grant 取到的 token 中包含 组织 claim 可映射到 tenant_id="1" 和对应角色（截取 JWT payload 作为证据，注意不要泄露签名）

## Definition of Done
- [ ] 设计文档评审通过，realm JSON 已提交

## 2026-09-26 承接约束

PRS-G01/02：当前 realm 是 groups 而非 Organizations。输出 groups→组织→数字 tenant_id、GM/PM/STAFF/FIN→目标角色、X-DTS-Dept-Code→平台头的映射；多组织用户必须显式选择且校验成员关系，不能取第一个组织。身份头必须由可信网关覆盖客户端输入。
