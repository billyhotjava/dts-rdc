# DTS Wiki 部署

站点源码在 `wiki/`，内容来自 `docs/` 与 `worklog/`。

```
浏览器 → wiki.yuzhicloud.com → 阿里云 nginx(TLS) ──WireGuard──► 10.20.0.50:18090
  wiki-auth  oauth2-proxy：Keycloak(realm yuzhicloud) 登录，要求 dts-wiki:reader
  wiki-web   nginx：/ 门户；/p/<产品>/ 产品站点，每个请求经 wiki-api /api/authz 校验 dts-wiki:space-<产品>
  wiki-api   编辑/上传（dts-wiki:editor + 该产品空间权限）→ 本地 git commit → 重建发布
             每 SYNC_INTERVAL 秒：fetch → rebase → push GitHub
```

站点组成（`wiki/scripts/build.mjs`）：门户 1 个 + 每个产品 1 个独立 VitePress 站点。产品站点只含自己的侧边栏、
页面分片与搜索索引，互不泄露；搜索页只合并当前用户有权限的产品索引。

## 服务器目录（10.20.0.50:/data/dts-wiki）

| 路径 | 说明 |
|------|------|
| `compose.yml`、`nginx.conf`、`.env` | 本目录拷贝过去；`.env` 由 `.env.example` 生成 |
| `secrets/deploy_key`、`known_hosts` | GitHub deploy key，**需要写权限**（不入库） |
| `repo/` | dts-rdc 工作仓库（wiki 编辑的主工作区；本地提交定时推送到 GitHub） |
| `site/releases/<sha>`、`site/current`、`site/status.json` | 发布目录；保留最近 `KEEP_RELEASES` 个 |
| `cache/` | npm 缓存、按 package-lock 缓存的 node_modules、构建工作目录 |

## 常用操作

```bash
cd /data/dts-wiki
docker compose ps
docker logs -f dts-wiki-api              # 编辑、同步、构建日志
cat site/status.json                     # 构建与同步状态（页面：/status）
touch site/.rebuild && docker restart dts-wiki-api   # 强制重建
# 回滚到某个旧版本
ln -sfn releases/<sha>@<时间戳> site/current.tmp && mv -Tf site/current.tmp site/current
```

## 镜像

10.20.0.50 的 docker daemon 代理不可用，镜像在开发机构建后传输：

```bash
docker build -t dts-wiki-api:1 -f deploy/wiki/Dockerfile.api wiki/server
docker save dts-wiki-api:1 | gzip | ssh root@10.20.0.50 'gunzip | docker load'
```

只有 `wiki/server/*.mjs` 变更时需要重建镜像；站点代码（`wiki/`）和内容随 git 更新。

## 权限（Keycloak realm `yuzhicloud`，client `dts-wiki`）
| client 角色 | 能力 | 默认授予 |
|------|------|------|
| `dts-wiki:reader` | 登录后阅读 | realm 默认角色，所有用户 |
| `dts-wiki:editor` | 编辑、新建页面、上传图片 | 组"研发部"、"管理员" |
| `dts-wiki:admin` | 手动重建站点、新建产品、访问全部产品空间 | 组"管理员" |
| `dts-wiki:space-<产品>` | 访问该产品空间（文档 + 工作日志） | 组"产品-<产品名>" |

产品空间的角色与组由 `deploy/sso/apps/wiki-spaces.sh` 按 products.json 生成（幂等）。

新人：在 Keycloak 建用户并加入对应组即可，不需要逐个应用授权。

## 待办（安全阶段）
- SSH 改密钥登录；.50 端口绑定收紧到 WireGuard 地址
- Keycloak 管理员启用 OTP；realm 密码策略
