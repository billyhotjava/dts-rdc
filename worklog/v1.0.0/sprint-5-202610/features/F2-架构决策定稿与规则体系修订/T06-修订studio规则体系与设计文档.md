# T06: 修订 studio 规则体系与设计文档

**优先级**: P0
**状态**: DRAFT
**依赖**: T01–T04

## 目标
让 `dts-studio/.rules` 与已接受的 ADR 保持一致，消除"规则说一套、代码做一套"的情况。

## 技术设计
- **需要修订的文件与要点**：

  | 文件 | 修订要点 | 来源 ADR |
  |------|----------|----------|
  | `.rules/10-architecture/architecture-principles.rules` | 三语言 → "Java 主体 + Python sidecar + Go infra"；通信 gRPC → "HTTP/JSON 控制面 + Kafka 数据面，gRPC 仅限 infra" | 005 |
  | `.rules/10-architecture/service-boundaries.rules` | 25 服务清单 → 现实模块映射表（例如 dts-query-ai ⇒ engine-ai/Nl2Sql；dts-data-security ⇒ QueryGateway + stack 权限；dts-gateway ⇒ Traefik + dts-auth），保留"远期拆分"小节 | 005/008/009 |
  | `.rules/10-architecture/apppack-protocol.rules` | manifest 与 F4/T01 的 JSON Schema 对齐；"skills (gRPC)" → HTTP；"dts-operator 安装"在无 k8s 期间改为"Pack 注册 API 安装"（F4/T03） | 005/012 |
  | `.rules/10-architecture/infra-iron-laws.rules` | 复核，只做一致性检查 | - |
  | `.rules/00-foundation/five-iron-laws.rules` | 铁律 #2 "dts-gateway" 写明具体实现；铁律 #3 "dts-data-security" 写明 QueryGateway；铁律 #4 写明 `dts.audit.v1` | 008/009 |
  | `.rules/50-appstack/pack-development.rules` | 加入 prs-pack 的目录范例与校验命令 | 012 |
  | `.rules/20-development/dependency-policy.rules` | 引入 R-012 版本原则（有 LTS 取 LTS 等） | 010 |
  | `RDC/worklog/v1.0.0/docs/plans/2026-03-11-ai-decision-os-design.md` | 顶部加 "Superseded in part by ADR-005..010"，正文不改（保留历史） | 全部 |
  | `RDC/worklog/v1.0.0/docs/dts-agent-protocol.md` | 各层标注实现状态（Ontology 层 → 语义包 schema，F12） | 012 |

- **做法**：每处修改都在旁边注明 `Source: ADR-NNN`；产出对照表 `assets/rules-adr-diff.md`（规则条款 | 原文 | 新文 | ADR）。

## 验证
- [ ] 在 `.rules` 中 grep "LangGraph|25 个|gRPC"，每个命中都位于"远期/历史"语境，或已改写
- [ ] 对照表覆盖全部改动

## Definition of Done
- [ ] studio 提交 `docs(F2/T06): align rules with ADR-005..010`
