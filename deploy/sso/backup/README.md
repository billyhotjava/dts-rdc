# Keycloak 数据库备份

- 每日 03:10（systemd timer，`Persistent=true` 错过会补跑）对 `dts-sso-db` 执行 `pg_dump -Fc`
- 输出：`/data/backup/keycloak/keycloak-<时间>.dump`，保留最近 14 份，校验 `pg_restore --list`

## 安装（10.20.0.50）
```bash
cp keycloak-backup.sh /data/dts-sso/backup/ && chmod 700 /data/dts-sso/backup/keycloak-backup.sh
cp keycloak-backup.service keycloak-backup.timer /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now keycloak-backup.timer
```

## 查看
```bash
systemctl list-timers keycloak-backup.timer
journalctl -u keycloak-backup.service -n 20
ls -lh /data/backup/keycloak/
```

## 恢复
```bash
cd /data/dts-sso && docker compose stop keycloak
docker exec dts-sso-db dropdb -U keycloak keycloak
docker exec dts-sso-db createdb -U keycloak keycloak
docker exec -i dts-sso-db pg_restore -U keycloak -d keycloak --no-owner < /data/backup/keycloak/keycloak-<时间>.dump
docker compose start keycloak
```
