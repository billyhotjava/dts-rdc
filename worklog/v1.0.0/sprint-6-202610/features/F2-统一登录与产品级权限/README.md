# F2: 统一登录与产品级权限

**优先级**: P0 · **状态**: DRAFT

## 目标
用现有 Keycloak（realm `yuzhicloud`）登录；权限只到空间（产品）一级，沿用现网角色与组，**切换时用户无感**。

## 契约
| 类型 | 契约 |
|------|------|
| OIDC | client `dts-wiki`：新增 redirect `https://wiki.yuzhicloud.com/login/oauth2/code/keycloak`（切换前另加 `wiki2` 域名） |
| 角色 | `dts-wiki:space-<slug>` 读该空间；`dts-wiki:editor` + 空间读权限 = 可写；`dts-wiki:admin` 全部空间 + 管理功能 |
| API | 所有 `/api/spaces/{slug}/**` 与 `/api/pages/{id}/**` 经 `SpaceAccessPolicy` 校验；无权 → 403 `SPACE_FORBIDDEN`（不泄露页面是否存在：未知 id 与无权同样返回 404） |

## Task 列表
| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | 应用内 OIDC 登录与会话 | P0 | DRAFT | F1/T01 |
| T02 | 空间访问策略与测试矩阵 | P0 | DRAFT | T01、F1/T02 |
| T03 | 新建空间时自动创建 Keycloak 角色与组 | P1 | DRAFT | T02 |
