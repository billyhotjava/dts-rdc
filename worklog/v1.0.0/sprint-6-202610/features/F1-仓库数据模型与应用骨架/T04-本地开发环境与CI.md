# T04: 本地开发环境与 CI

**优先级**: P1 · **状态**: DRAFT · **依赖**: T01–T03

## 技术设计
- `deploy/compose.dev.yml`：postgres:18（+ 检索扩展，见 F0/T03）、Keycloak 用 .50 现网实例（开发 client `dts-wiki-dev`，redirect `http://localhost:5173/*`）。
- GitHub Actions：后端 `./mvnw verify`，前端 `pnpm lint && pnpm test && pnpm build`；PR 必须绿。
- 发布脚本 `deploy/release.sh`：本机构建两个镜像（tag = git sha）→ 传输 .50 → `docker compose up -d`（账本 #7）。
