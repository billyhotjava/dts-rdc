# Portainer CE

- 访问：`https://10.20.0.50:19443`（WireGuard 内网）
- 版本：2.45.1 LTS（按 R-012：取最新稳定版本线，首发满 30 天）
- 数据：外部卷 `portainer_data`；升级前备份到 `/data/backup/portainer_data-<日期>.tgz`

## 升级 / 回滚

```bash
# 开发机：拉取并传输镜像（.50 的 docker daemon 代理不可用）
docker pull portainer/portainer-ce:<ver>
docker save portainer/portainer-ce:<ver> | gzip | ssh root@10.20.0.50 'gunzip | docker load'

# .50：备份 → 改 compose.yml 的版本 → 启动
cd /data/portainer
docker compose stop
tar czf /data/backup/portainer_data-$(date +%Y%m%d%H%M).tgz -C /var/lib/docker/volumes/portainer_data _data
docker compose up -d

# 回滚：停容器 → 恢复备份 → compose.yml 改回旧版本（或 2.18.2-rollback 标签）→ up -d
```

## 账号
纯运维工具，不对外、不接入 Keycloak SSO，使用 Portainer 本地管理员账号。
