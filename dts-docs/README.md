# DTS 产品能力文档

本目录存放 **DTS 产品能力文档**，即对外、可以交付的正式文档：产品提供哪些能力、如何使用，以及客户如何在这些能力之上定制行业 App。

- 在 wiki 中对应 `dts` 空间（见 [`../dts-worklog/spaces.yml`](../dts-worklog/spaces.yml)）。研发中心的 wiki 从本目录同步。
- 随每个 DTS 版本打成内容包交付，在客户现场的 wiki 中以只读方式预置。客户在自己的 App 空间里，参照这些能力编写定制内容。
- 这里只放稳定的正式内容，不放研发过程文档（设计、计划、Sprint、证据）。研发过程文档放在 [`../dts-worklog/spaces/rdc/worklog/`](../dts-worklog/spaces/rdc/worklog/README.md)。
- 模块级的运维手册和契约规范随代码放在各模块仓库的 `docs/`，发布时再汇总进来。
- 不放任何凭据或内部地址，因为这些内容会交付给客户。

## 目录规划

| 目录 | 内容 | 状态 |
|------|------|------|
| `overview/` | 产品定位、五条铁律、模块地图（数据平台、BI、AI 工作台、Wiki、门户与身份） | 待建 |
| `capabilities/` | 各项能力说明：数据接入与治理、指标、问数与 AI、知识库、审计与权限 | 待建 |
| `app-development/` | 行业 App 开发：AppPack 协议、领域资产、AI 可调用的动作 API、身份与租户上下文 | 待建 |
| `integration/` | 外部系统接入、单点登录、数据源注册 | 待建 |
| `deployment/` | 部署形态、版本与升级、离线安装 | 待建 |

## 历史资料（研发归档，仅供参考，不随版本交付）

- [AI Decision OS 架构设计（2026-03，部分被 Sprint-5 ADR 取代）](../dts-worklog/spaces/rdc/archive/dts-rdc-worklog/v1.0.0/docs/plans/2026-03-11-ai-decision-os-design.md)
- [产品能力规划（2026-09-27）](../dts-worklog/spaces/rdc/archive/dts-rdc-worklog/v1.0.0/docs/plans/2026-09-27-product-capability-roadmap.md)
- [DTS Agent Protocol（DAP）](../dts-worklog/spaces/rdc/archive/dts-rdc-worklog/v1.0.0/docs/dts-agent-protocol.md)
- [知识战略](../dts-worklog/spaces/rdc/archive/dts-rdc-worklog/v1.0.0/docs/knowledge-strategy.md)
