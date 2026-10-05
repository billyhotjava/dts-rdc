# T08: 本地开发环境与 CI

**原编号**: Sprint-6 F1/T04（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1 · **状态**: IN_PROGRESS（2026-09-26：dev 手动联调通（backend :8080 + vite :5173 + PG dts-wiki-db）；W3 部署/登录已补入 `it/wiki/baseline.md`；剩余开发编排、dev client 与 CI 自动化分别核对，不再把已记录的 W3 基线列待做） · **依赖**: T05–T07

## 技术设计
- `deploy/compose.dev.yml`：postgres:18（+ 检索扩展，见 T03）、Keycloak 用 .50 现网实例（开发 client `dts-wiki-dev`，redirect `http://localhost:5173/*`）。
- GitHub Actions：后端 `./mvnw verify`，前端 `pnpm lint && pnpm test && pnpm build`；PR 必须绿。
- 发布脚本 `deploy/release.sh`：本机构建两个镜像（tag = git sha）→ 传输 .50 → `docker compose up -d`（账本 #7）。
