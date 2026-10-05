# F4: 新栈可运行基线（G0）
产品 Feature：PF-RUNTIME；需求依据：`delivery-baseline` 技能 + F2 规范 + R-011（k8s-ready 约束）。
负责人：待确认；优先级：高（G0 阻断 Sprint-2 开工）；状态：DRAFT。

## 使用场景与验收
调用者：测试/业务验收方、Sprint-2 各域（基线复用）。触发：基线环境就绪。
输入：F2 模板 + PG/Traefik 资源 + F3 登录链路（基线"登录"项依赖 F3/T03）；结果：`it/baseline.md` 四项（实例/登录/种子/验收路径）结论。
正常流程：T01 搭建（PG+Liquibase+Traefik 路由+空服务+种子）→ T02 按基线表验证 → G0 结论。
替代流程：某资源不到位 → 先以最小可运行子集验证已到位项，缺项记 GAP，不谎报通过。
失败流程：基线连续阻塞超 3 天 → 升级为 Sprint 阻碍，F1/F2 文档工作继续（技能要求缺口不静默、
也不阻止无关工作）。
规则与边界：Liquibase 首版只含基线表（租户/字典/组织/audit/outbox），业务表随各域 Sprint 建（唯一例外：F7 验证用的只读 `prs.project`）；
种子数据与生产隔离；无 Nacos（R-006），服务发现用 DNS 服务名。
验收示例：Given 基线环境 / When 按验收路径操作 / Then 四项结论写入 it/baseline.md。
本期范围：基线搭建 + 验证 + k8s-ready 自检与 Helm chart 骨架。后续切片：各域服务接入基线（Sprint-2+）；
k8s 单集群（R-011 阶段 1）。非目标：业务功能、k8s 集群搭建。

## 设计
概念与共享架构：基线是全工程的运行底盘，维护责任：运维 + 架构。
概要协作：模板 → 空服务 → Traefik 路由 → PG → 种子 → 验证。
关键契约：Liquibase 变更集命名、种子数据清单、Traefik 路由表、健康检查端点。
路由表 v0.1：`prs-health`（`/api/prs/health`，白名单直通）、`prs-whoami`（`/api/prs/whoami`，挂 forwardAuth）；
F7 在此基础上新增 `prs-project`。老路由别名不进本期路由表（R-006）。
UI 或使用路径：无（API/作业消费路径：健康检查 + 影子接口）。
详细设计：见 T01–T02。
未决项：PG 高可用形态（一期单实例 + 备份先行；目标形态为 k8s 上的 CloudNativePG，随 R-011 阶段 1 落地，T01 明确记录）。

## Task
| ID | 类型/目标产出 | 负责人 | 输入依赖 | 估算 | 验证方式 | 状态 |
|---|---|---|---|---|---|---|
| T01 | 开发/迁移：基线搭建 | 待确认 | F2 模板、PG/Traefik 资源 | 5 点（假设） | 实例可达 + 路由可达 + 种子就绪 | DRAFT |
| T02 | 测试执行：基线验证 | 待确认 | T01；F3/T03 | 3 点（假设） | it/baseline.md 四项结论 | DRAFT |
| T03 | 开发：k8s-ready 自检 + Helm chart 骨架 | 待确认 | T01；F2/T01 ⑩ | 2 点（假设） | 清单逐项结论 + `helm lint`/`helm template` 通过 | DRAFT |

注意：F3 与 F4 的搭建可并行，但 F4/T02 的"登录"项必须等 F3/T03 通过；F3 未通过时该项记 GAP，不得记 PASS。

## Feature 完成标准
it/baseline.md 四项有结论；k8s-ready 清单逐项有结论；GAP 项有后续责任。标准映射到基线记录。
