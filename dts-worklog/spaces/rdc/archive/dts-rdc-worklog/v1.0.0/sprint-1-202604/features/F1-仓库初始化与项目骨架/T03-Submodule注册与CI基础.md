# T03: Submodule 注册与 CI 基础

**优先级**: P1
**状态**: READY
**依赖**: T01

## 目标
将 dts-infra 作为 git submodule 引入 rdc 仓库，并配置基础 CI pipeline

## 技术设计

1. 在 rdc 仓库注册 submodule：
   ```bash
   git submodule add git@github.com:billyhotjava/dts-infra.git dts-infra
   ```

2. GitHub Actions CI（`.github/workflows/ci-infra.yaml`）：
   - 触发: push/PR to dts-infra
   - Steps: checkout → Go setup → `make lint` → `make test` → `make build`
   - buf lint + buf generate 验证

3. `.gitignore` 配置（dts-infra 仓库内）

## 影响范围
- rdc 仓库: `.gitmodules` 更新
- dts-infra 仓库: `.github/workflows/ci-infra.yaml` 新建
- dts-infra 仓库: `.gitignore` 新建

## 验证
- [ ] `git submodule update --init dts-infra` 在 rdc 仓库可执行
- [ ] CI pipeline 在 GitHub 上触发并通过
- [ ] dts-infra 出现在 rdc 根目录下

## 完成标准
- [ ] submodule 注册成功
- [ ] CI 包含 lint/test/build 三个 stage
