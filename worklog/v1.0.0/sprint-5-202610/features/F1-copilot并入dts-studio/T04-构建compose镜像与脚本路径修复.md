# T04: 构建、compose、镜像与脚本路径修复

**原编号**: Sprint-5 F3/T04（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: DRAFT
**依赖**: T03

## 目标
engine 在新位置能用正式入口完成"构建 → 镜像 → compose 启动 → 健康检查"，镜像名切换到 studio 命名，同时保证旧名可用一个版本周期。

## 技术设计
- **需要修改的内容**（原路径 → 新路径，见账本#21）：
  1. `engine/build.sh`、`engine/dev.sh`、`engine/start.sh`、`engine/smoke-test.sh`、`engine/scripts/*.sh`：修正相对路径（模块目录改名后的影响）；
  2. `engine/docker-compose.yml`：
     - `build.context` 指向新目录；
     - 镜像：`${IMAGE_STUDIO_ENGINE_AI:-dts-studio-engine-ai:${TAG}}`，同时 `docker tag` 旧名 `dts-copilot-ai:${TAG}` 用于兼容；
     - 新旧部署使用不同 compose project、容器名、端口及数据卷；原容器名保留给旧部署。兼容网络别名限于各自网络，禁止同一网络内歧义解析，在 `assets/rename-debt.md` 登记切换映射；
  3. `imgversion.conf`：新增 studio 镜像键，旧键保留并注明 deprecated；
  4. 前端 `webapp/vite.config.ts` 的代理和 `nginx` 配置（`webappNginx.test.ts` 有测试，需要跑通）；
  5. `.github/` CI（如果 copilot 仓库有）迁到 studio 根目录的 `.github/workflows/engine.yml`，路径过滤 `engine/**`；
  6. GitNexus：`npx gitnexus analyze` 在 studio 上重建索引（copilot 原有 `.gitnexus/`）。
- **错误路径**：外部系统（例如老 rs-gateway 路由，见 copilot README "与园林管理平台对接"）通过容器名访问 → 保持旧部署的入口，通过明确路由切换到新部署；不能让新容器复用全局旧名造成并行启动冲突。

## 验证
- [ ] `./build.sh` 成功，`docker compose up -d` 之后 `curl :8091/actuator/health` 与 `:8092/api/health` 返回 UP
- [ ] webapp 可以打开工作台（截图）

## Definition of Done
- [ ] 证据进入 `it/IT-02-studio-build.md`
