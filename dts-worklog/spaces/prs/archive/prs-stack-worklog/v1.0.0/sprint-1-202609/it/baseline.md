# it/baseline.md — G0 交付基线（旧 BOM 已验证，待按 BOM v1.0 重定基复验）

状态：证据齐全，待 Sprint Review 确认 Gate。责任 Task：F4/T02（DONE）。

| 基线项 | 期望 | 实际结果 | 证据 |
|---|---|---|---|
| 可运行实例 | 新栈空服务在测试环境启动（PG + Traefik 路由可达） | PASS：7 容器运行（auth/shadow/platform + PG/Redis/KC/Traefik）；`mvn package` BUILD SUCCESS + 4 单测通过 | `docker compose ps`；构建日志 |
| 登录 | Keycloak flower realm 测试用户经网关完成 OIDC 登录 | PASS：GM/PM/STAFF/FIN 四角色全过（JWT×3 + 会话×1），负例 401 | F3/T03、T04 执行报告；sources/README 验证节命令 |
| 种子数据 | 字典/组织/测试租户种子经 Liquibase 初始化 | PASS：8 changesets；tenant 1 行/dict 3 行 | psql 查询；Liquibase 成功日志 |
| 验收路径 | 测试/业务方可按文档走通"登录→鉴权→空服务接口" | PASS：sources/README 验证节 6 条命令全过 | 同上 |

缺口：生产级 HA/密钥管理/种子评审列 Sprint-2；B-001/B-002/B-003 未关。
