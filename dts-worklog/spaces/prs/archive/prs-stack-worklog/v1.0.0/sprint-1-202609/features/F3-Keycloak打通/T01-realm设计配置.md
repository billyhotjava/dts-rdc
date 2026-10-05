# T01: realm 设计与配置
类型：设计 + 实施。负责人：待确认；状态：DRAFT（B-001：09-21 前保持；证据见实际结果节，重定基复验后转正）；估算：3 点（假设）。
设计/需求依据：F3 README；Keycloak 26.7.4（R-012；共享实例由 26.3.4 升级，见 B-008 与版本基线 §5；实例升级完成前在 26.3.4 上先行配置，验证结论注明所用版本）；
注意 26.7.1 起经 protocol mapper 授予的管理员角色不再获得 Admin API 权限，realm 专属管理员组须直接分配角色；R-007（同一实例分 realm，B-004 已关闭）。
输入依赖：F2 鉴权章节（若未出则按 F3 README 假设先行，差异回炉）；输出消费方：T02/T03/T04/T05。

## 目标和范围
在共享实例上新建独立 `flower-test` realm（生产 `flower` realm 待 B-005 合规确认后按同一导出文件创建）：
配四个角色（总经理/项目经理/员工/财务，可扩展位）、测试 client；
租户模型按 R-010 采用 Keycloak 26 Organizations：建两个测试组织（租户 A、B，各配四角色用户，另建一个同时属于 A、B 的用户），
验证令牌中的组织声明能映射出 bigint 租户 ID（组织属性存租户 ID）、多组织用户的租户选择方式；
任何一项不满足时退回 groups `/tenants/{tenantId}` + protocol mapper，并写明原因；realm 专属管理员组
（master 权限与升级协调归属由 T05 与运维方确认）；输出 realm 导出 JSON 入库备查
（实例级备份由 dts-stack 运维方负责，按 realm 导出纳入变更流程）。
关闭或转假设：租户模型取舍（B-003）、老用户密码迁移策略（迁移/重置二选一建议）。
排除：生产 realm、企微/钉钉 broker（预留位，不配）、APP client（Sprint-2）。

## 工作内容
realm 建模 → 共享实例上配置（与运维方协同开通）→ 四角色登录自测 → 导出文件存档；
按 F3 README 头契约 v0.1 配置 protocol mapper，确认每个头都有声明来源后冻结头契约，供 T05/T02 实现。

## Ready 与完成标准
Ready：共享 Keycloak 实例测试可达（若不可达则本 Task BLOCKED，不阻塞 F1/F2）。
完成：两个租户的四角色均可登录；令牌中租户声明正确；多组织用户行为有结论；B-003 关闭；导出文件存档；未决有去向。

## 实际结果
realm-flower-test.json 已产出并在 dev 实例导入验证：4 角色/4 用户/groups（租户 t1）/
VERIFY_PROFILE 禁用；四角色均可登录；该 JSON 即导出备份（入库）。
生产实例配置待运维协同（B-001）。dev 范围 DONE。
