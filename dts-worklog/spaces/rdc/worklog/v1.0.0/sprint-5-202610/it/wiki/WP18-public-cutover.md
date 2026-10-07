---
type: evidence
id: S5/Wiki/WP18-public-cutover
covers: [S5/F5/T09, S5/F5/T07]
result: PASS
title: wiki.yuzhicloud.com switched to the new Wiki; legacy Wiki removed
date: 2026-10-07
---
# WP18 公网切换：wiki.yuzhicloud.com 切到新 Wiki，删除旧 Wiki

## 授权与范围

用户于 2026-10-07 确认：当前为研发阶段，wiki 没有在用用户，可以直接切换，旧 wiki 可以直接删除。因此没有安排并行运行期和切换窗口。

本次只改动 dts-e1（10.20.0.50）上的两个 wiki 实例，没有改动阿里云边缘 Nginx、Jira、Harbor、公司 Keycloak、dockerd 和主机时钟。

## 做法

公网 TLS 在阿里云边缘终止，边缘经 WireGuard 转发到 `10.20.0.50:18090`，这个端口原来是旧 wiki 的 oauth2-proxy。所以切换不需要改边缘配置：旧 wiki 删掉后，让新 wiki 同时发布 `18090` 和 `18091` 两个端口。

| 步骤 | 结果 |
|---|---|
| 备份旧 wiki | `/data/backups/dts-wiki-legacy-20261007`，权限 700/600：`repo.bundle` 包含全部 ref，其中有 7 个未推送的“练习区”提交，HEAD 为 `c7557b2`；另有 `config.tgz`（compose、nginx、secrets、README）、容器清单和 `SHA256SUMS`。在仓库内执行 bundle verify 通过，并实际 clone 恢复验证 |
| 删除旧 wiki | `docker compose down` 删除 `dts-wiki-auth`、`dts-wiki-web`、`dts-wiki-api`。`dts-wiki-api` 一度有僵尸进程无法停止，等它自行退出后删除，没有重启 dockerd。随后删除 `/data/dts-wiki`，以及专属镜像 `dts-wiki-api:1` 和 `oauth2-proxy:v7.15.4` |
| 配置新 wiki | 先备份 `.env` 和 `compose.override.yml`（`*.bak-<时间戳>`）；设置 `WIKI_PUBLIC_URL=https://wiki.yuzhicloud.com`；在 override 中加入 `18090:8080`（`18091` 保留）；然后只重建 `wiki-app`，数据库容器不变 |
| 运行状态 | readiness 200；两个端口的 `/management/info` 都返回 `0f287e7`；重启次数 0 |

## 公网验收（不登录真实账号）

| 检查 | 结果 |
|---|---|
| `GET https://wiki.yuzhicloud.com/` | 200，`<title>DTS Wiki</title>`（新 wiki） |
| 匿名访问 `GET /api/wiki/spaces` | 401 |
| 发起登录 `/oauth2/authorization/oidc` | 302 到 `sso.yuzhicloud.com`，`client_id=dts-wiki`，`redirect_uri=https://wiki.yuzhicloud.com/login/oauth2/code/oidc`，说明边缘传来的转发头被正确识别 |
| Keycloak 授权页 | 返回登录表单（`kc-form-login`），没有出现回调地址无效的错误 |
| 其他服务 | Harbor、公司 SSO、Jira 容器没有变化 |

真实账号的浏览器登录和空间权限，WP17 已经在 18091 上用临时账号验证过，覆盖 10 项检查；本次没有重复执行。建议用户用自己的公司账号在公网域名上登录确认一次。

## 有意不做的事项与后续

| 项 | 处理 |
|---|---|
| 旧链接 `/p/<空间>/...html` | 不做映射：旧链接以 `.html` 结尾，而 resolver 只按仓库路径解析；目前没有用户，价值很低。将来发现有人在用，再配置 alias 并支持 `.html` |
| Keycloak `dts-wiki` client 中的旧回调 `https://wiki.yuzhicloud.com/oauth2/callback` | 暂时保留，不影响运行；等确认公网登录正常后再清理 |
| .50 时钟快 8 小时（NTP 未同步，RHEL 8.10 未安装 chrony；本机与 .50 看到的外部 HTTPS `Date` 都是 05:32 GMT，而 .50 系统时间为 13:32 UTC） | 会让 wiki 中的版本和评论时间偏差 8 小时，也影响同机的 Jira、Harbor 和 Keycloak。需要用户确认后再修正（安装并启用 chrony，回拨时钟） |
| Git 内容同步 | 继续通过开发机的中转 `10.20.0.6:10819`（WP17）进行，开发机是这一路径的依赖 |
