# DTS Wiki 部署

站点源码在 `wiki/`，内容来自 `docs/` 与 `worklog/`。

```
push → GitHub ──(ssh, deploy key)──► 10.20.0.50 dts-wiki-builder 每 INTERVAL 秒 fetch
                                      └─ 有新提交：npm ci + build → site/releases/<sha>@<时间戳> → 原子切换 site/current
浏览器 → wiki.yuzhicloud.com → 阿里云 nginx(10.20.0.1) ──WireGuard──► 10.20.0.50:18090 dts-wiki-web(nginx 静态)
```

## 服务器目录（10.20.0.50:/data/dts-wiki）

| 路径 | 说明 |
|------|------|
| `compose.yml`、`nginx.conf`、`.env` | 本目录拷贝过去；`.env` 由 `.env.example` 生成 |
| `secrets/deploy_key`、`known_hosts` | GitHub 只读 deploy key（不入库） |
| `repo/` | dts-rdc clone |
| `site/releases/<sha>`、`site/current`、`site/status.json` | 发布目录；保留最近 `KEEP_RELEASES` 个 |
| `cache/` | npm 缓存 |

## 常用操作

```bash
cd /data/dts-wiki
docker compose ps
docker logs -f dts-wiki-builder          # 构建日志
curl -s localhost:18090/_status.json     # 最近一次构建状态（ok/building/failed/stale）
touch site/.rebuild                      # 强制下一轮重建
# 回滚到某个旧版本
ln -sfn releases/<sha>@<时间戳> site/current.tmp && mv -Tf site/current.tmp site/current
```

## 镜像

10.20.0.50 的 docker daemon 代理不可用，镜像在开发机构建后传输：

```bash
docker build -t dts-wiki-builder:1 -f deploy/wiki/Dockerfile.builder deploy/wiki
docker save dts-wiki-builder:1 nginx:1.28-alpine | gzip | ssh root@10.20.0.50 'gunzip | docker load'
```

构建器镜像只在修改 `Dockerfile.builder` / `build-loop.sh` 时需要重新传输；站点内容更新不需要。

## 待办（安全阶段）
- 阿里云 vhost 加访问控制（可复用 dev.yuzhicloud.com 的登录会话模块）
- SSH 改密钥登录，端口绑定收紧到 WireGuard 地址
