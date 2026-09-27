# T19: ADR-013 界面原型先行与契约驱动 BFF（铁律 #5 澄清）

**原编号**: 新增（2026-09-27，用户确定交付方法：模板化 UI 原型先行 → UI 驱动 BFF → 领域模块按常规设计）

**优先级**: P0 · **状态**: READY · **依赖**: 无（与 T12～T16 并行，10-09 前定稿，F6 据此开工）

## 目标
定稿 ADR-013，使"界面原型先行"与铁律 #5"能力先于界面（API-first）"一致，并钉死三层职责边界。

## 决策内容（定稿文本写入 Sprint README ADR 表与 `dts-studio/.rules/10-architecture/` 对应规则）
1. **铁律 #5 解释**：界面原型可以先行，但只用 mock 数据来发现和冻结契约；原型**接真实数据、上线之前**，所依赖的领域 API 与测试必须已完成。铁律文字不变。
2. **三层职责**：
   | 层 | 位置 | 可以做 | 不可以做 |
   |----|------|--------|----------|
   | DTS Console（UI） | `dts-studio/console/`（antd 6 外壳，模块联邦挂载 PRS/stack 页面） | 展示、交互、客户端校验 | 直连领域服务或数据库；自行判断权限 |
   | Console BFF | `dts-studio/console-bff/` | 按页面聚合/裁剪下游响应、表单校验、错误码映射、分页适配；透传用户身份（`X-DTS-*`、traceId） | 业务规则、持久化业务数据、服务账号兜底提权、绕过 dts-gateway |
   | 领域模块 | Pack 运行时、QueryGateway、审计、指标、PRS 服务等 | 完整 API + 测试，独立可用（关掉 Console/BFF 仍可经 API 使用，满足铁律 #1） | 为某个页面定制接口形状 |
3. **契约流程**：F6 原型 → `console/contracts/*.openapi.yaml`（OpenAPI 3.1，唯一契约源）→ 前端类型由 `openapi-typescript` 生成、mock 由 MSW 按契约实现 → F6/T13 业务评审后冻结 v1 → BL-C 的 BFF 以契约测试实现 → 领域 API 由各自 Feature 按常规设计，BFF 适配而不反向修改领域契约。
4. **UI 体系**：统一 antd 6（与 PRS BOM R-012、dts-wiki 一致），借鉴 shadcn-admin 的布局与交互模式，不引入第二套组件库；存量 stack/PRS 页面经模块联邦或链接挂入，不重写。

## 验证
- [ ] ADR-013 状态"已定"，写入 Sprint README ADR 表；CLAUDE.md 铁律 #5 加注"解释见 ADR-013"
- [ ] `dts-studio/.rules/10-architecture/` 新增或修订 BFF 边界条款（与 BL-A/T20 规则修订合并提交）
- [ ] F6、BL-C 各 Task 的依赖与本 ADR 一致
