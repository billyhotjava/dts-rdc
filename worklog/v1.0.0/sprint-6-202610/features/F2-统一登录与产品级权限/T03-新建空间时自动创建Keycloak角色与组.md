# T03: 新建空间时自动创建 Keycloak 角色与组

**优先级**: P1 · **状态**: DRAFT · **依赖**: T02

## 技术设计
- Keycloak 新建服务账号 client `dts-wiki-provisioner`（client credentials），只授予 realm-management 的 `manage-clients`、`view-users`、`manage-users` 中必要的最小集合（实施时核对 Keycloak 26 细粒度权限 v2，能收窄就收窄）。
- 管理员在 wiki 中新建空间 → 后端调用 Keycloak Admin API：创建 client 角色 `space-<slug>`、组 `产品-<名称>` 并挂角色（逻辑同现网 `deploy/sso/apps/wiki-spaces.sh`）。
- 失败不回滚空间，界面提示"请运行 wiki-spaces.sh 补建"并记审计事件。

## 验证
- [ ] 集成测试（Keycloak Testcontainer）：新建空间后角色与组存在；重复执行幂等
