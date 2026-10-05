# PRS 重写基础承接（2026-09-26）

状态：**原型与资料已导入工作副本；未提交、未部署，新 BOM 验收待执行**。
来源：`/opt/prod/prs/source/dts-prs`；目标：`dts-rdc/dts-app-stack/prs-stack`。
源目录没有独立 Git 历史，逐文件 SHA256 是本次来源锚点；目标保留原仓库 `fc3d0e7` 历史，不重建仓库、不覆盖已有内容。

## 1. 已接收成果

| 成果 | 位置 | 承接与验证边界 | RDC Sprint-5 |
|---|---|---|---|
| 重写底座原型 | `sources/`，5 个 Maven 模块、23 个 Java 文件、部署与 Helm 骨架 | 原样接收，不重写已存在的模板/鉴权/项目服务；构建与运行需按新 BOM 复验 | F0/T03、F1/T01、F9、F10 |
| 迁移执行底稿 | [迁移清单](../sprint-1-202609/assets/迁移清单-v0.1.md) | 能力迁移依据；财务 23 问与口径签字不是已确认业务事实；§12/13 仍待完成 | F0/T04、F5、F8 |
| 技术底座规范、模板 | [SPEC](../sprint-1-202609/features/F2-技术底座规范v0.1/SPEC-技术底座规范-v0.1.md)、`sources/TEMPLATE.md` | 复用结构；过时条款按第 3 节处理 | F2/T05、T07 |
| BOM 与公共镜像清单 | [版本承接](version-handoff.md) | 选定版本/配置声明/静态验证/运行验收分别记录 | F0/T03、F2/T05、F13 |
| 多租户与云原生路线 | [原设计](../sprint-1-202609/assets/多租户与云原生演进.md) | R-010/011 仍属提议；已有 RLS/Helm 源码不等于已验收 | F9、F10；k8s 运行时后续 |
| 原执行记录 | [旧 BOM 基线](../sprint-1-202609/it/baseline.md)、F2/F3/F4 Task 实际结果 | 历史记录说明旧 BOM 验证，不继承为新版本 PASS | F0/T03 |
| 原仓库的 3 月原型 | `backend/`、`frontend/`、`pack/` | 现有 21 个页面文件与业务概念可参考，保持原样；不直接视为新产品完成 | F1/T01、F5/T01、F12 |

导入 93 文件、278598 字节；排除 68 个本机文件（编译输出、`.env` 等）。[导入清单](source-manifest.json) 记录原路径、字节数及 SHA256；历史文件未加注释或改状态，以保留字节一致性。

## 2. 必须继承的决策与边界

- R-001：React + TypeScript 优先；Web/H5 接口类型从 OpenAPI 生成；Agent 消息契约由头脑维护。新前端不照搬 3 月原型 React 18 的版本。
- R-004：按业务能力承接，旧 handler 仅作覆盖核对，不能逐接口复制旧 RPC 风格；报花→配送/出库→结算等跨域写关系必须确认。
- R-006/007：新栈不用 Nacos/SCA；复用共享 Keycloak 的方向，realm 隔离；旧系统网关保留到业务切换。源码中的 dev 独立 Keycloak 不是共享实例已落地的证明。
- R-008（提议）：按切换单元保持唯一可写事实源，不做双写。Sprint-5 的空库重建不需要迁入旧 ERP 生产数据；以后业务切换仍需要共存/标识/反向同步设计，两者不能混淆。
- R-009：PRS 的消息协议 F5 已调出，不重建另一套；随着已定 ADR-3，协议维护方由 copilot 转为 studio，消费映射由 RDC F12 承接。
- R-010/011（提议）：租户隔离必须执行层强制；本期 Compose、保留 Helm 骨架与 k8s-ready 检查，不能被旧 All-in-K8s 规划阻塞。
- R-012（源记录已确认）：保留 9 月锁定 BOM，不因为 3 月 prototype/旧 Stack 的版本倒退；平台 JDK/Boot 升级仍由 RDC ADR-010 评估，公共镜像版本与应用依赖版本分开。
- 四模块定位以 RDC ADR-1～4 为准。R-013 的正式落档和双方队列同步由 F2/T07 完成；本说明不把未定 ADR 或未验收 Task 自动转为 Accepted/DONE。

## 3. 静态核对发现的差异（不在本轮改代码）

| ID | 当前证据 | 承接动作与通过条件 |
|---|---|---|
| PRS-G01 | realm 使用 `/tenants/1`、`/tenants/2` groups；`ForwardAuthController` 从 groups 取首个租户，缺失时回退 `default` | F9/T01–T03：设计 Organizations 映射及多组织选择，租户路由缺少上下文拒绝；不能直接复用 default 回退 |
| PRS-G02 | 当前角色为 GM/PM/STAFF/FIN；用户 alice=租户1/PM、bob=租户2/STAFF；头为 `X-DTS-Dept-Code` | F9：建立角色与头映射，保留原测试账号含义；补独立双租户测试用户，禁止默默改 bob 的角色；代理身份和真实用户同时审计 |
| PRS-G03 | `ProjectController` 将租户解析为 long；项目种子为 1/2，每租户各 1 个项目；查询未强制 `del_flag=0` | F0/T02、F10/T03：t1/t2 只作显示别名，实际 ID 用数字字符串；主指标固定 status=1/type=1/del_flag=0。不能用“两个计数不同”证明隔离，应比对可见 ID 与预期集合 |
| PRS-G04 | `003-project.xml` 含 ENABLE/FORCE RLS；dev Compose 使用建库账号；`prs-internal-sync` 路由没有 forwardAuth | F0/T03、F9/T04、F10/T04：核验实际账号非 superuser/BYPASSRLS/owner；同步端点仅服务身份可达，公网不可访问；新 BOM 双租户负例重新执行 |
| PRS-G05 | 原 it/README 写未建，baseline 和 Task 末尾写旧 BOM DONE/PASS；队列汇总与 Task 头状态不一致 | F0/T03、F2/T07：保留历史证据，按源码/旧 BOM/新 BOM/验收分栏重新登记，不整体标 DONE |
| PRS-G06 | SPEC 仍有“F5 另行设计”“Boot Admin”“tracing 二期”“MinIO HA”等旧措辞 | F2/T07：分别按 R-009、R-011/012 与公共镜像清单校正；OTel 从基线接入，不新引入 Boot Admin；对象存储仍是选型，未锁具体镜像 |
| PRS-G07 | 3 月 JSON Pack 为 `prs-pack@0.1.0`，含 RPC/前端联邦入口；Sprint-5 是 YAML `dts.pack/v1` 领域资产包 | F4/T01、F5/T01：制作字段/能力迁移表；保留旧制品和历史，区分业务 App 与头脑资产包；新包使用独立暂存目录，不覆写旧 manifest |

## 4. 来源与本轮验证

源码差异来自本轮静态阅读，不代表缺陷已修复；新环境、双租户、共享实例、正式镜像都仍待 F0/F9/F10/F13 验证。
原目录未修改；新目录没有 `.env`。仅在本机初始化了已登记的 prs-stack submodule，远端和三层 gitlink 尚未更新。
本轮校验记录见 [import-validation.md](import-validation.md)。
