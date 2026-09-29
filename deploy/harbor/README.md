# Harbor (HQ artifact registry, dev/validation)

Harbor v2.15.2 on `10.20.0.50`, installed from the offline installer (images loaded with
`docker load`; no `docker pull`, no dockerd restart). Serves as the HQ artifact center of
the dts-infra design (F7 design/00 §4.1): multi-arch images and OCI Helm charts.

| Item | Value |
|------|-------|
| URL | `https://10.20.0.50:18443` (HTTP `18082` redirects to HTTPS) |
| Registry host | `10.20.0.50:18443` |
| Admin | `admin`; password in `/data/harbor/deploy/.env` on the server (`HARBOR_ADMIN_PASSWORD`) |
| Project | `dts` (private) for DTS images and charts |
| Data | `/data/harbor/data`; logs `/data/harbor/log`; installer `/data/harbor/installer/harbor` |
| TLS | Internal CA `DTS Internal Root CA` (`ca.crt` in this directory); CA key stays on the server in `/data/harbor/deploy/certs/` |
| Trivy | Not installed (the server cannot reach ghcr.io); enable later with an offline DB |

## Install / reconfigure (on the server)

```bash
# copy this directory to /data/harbor/deploy, then:
./install.sh /data/harbor/dist/harbor-offline-installer-v2.15.2.tgz
```

`install.sh` creates `.env` with random secrets on first run, generates certificates if
missing, renders `harbor.yml` from `harbor.yml.tmpl` and runs Harbor's installer.

Certificate renewal: `./gen-certs.sh`, then in `/data/harbor/installer/harbor` run
`./prepare && docker compose down && docker compose up -d` (Harbor copies the certificate
during `prepare`; restarting nginx alone is not enough).

## Clients

```bash
# Docker (no daemon restart needed)
sudo mkdir -p /etc/docker/certs.d/10.20.0.50:18443
sudo cp ca.crt /etc/docker/certs.d/10.20.0.50:18443/ca.crt
docker login 10.20.0.50:18443

# Helm / oras / Go tools use the system trust store
sudo cp ca.crt /usr/local/share/ca-certificates/dts-internal-root-ca.crt && sudo update-ca-certificates
helm registry login 10.20.0.50:18443
```

RKE2 nodes reference the CA via `registries.yaml` (`configs."10.20.0.50:18443".tls.ca_file`).

## Known issue

The server clock of 10.20.0.50 runs 8 hours ahead and is not NTP-synchronised (found
2026-09-29). Certificates are therefore issued with a start date backdated by 2 days
(`BACKDATE_DAYS`). Fixing the clock affects Jira, Keycloak and the wiki on the same host
and needs an owner decision.
