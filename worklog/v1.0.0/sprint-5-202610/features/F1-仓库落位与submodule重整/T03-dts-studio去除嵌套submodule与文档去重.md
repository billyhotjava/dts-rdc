# T03: dts-studio 去除嵌套 submodule，evolution 文档去重

**优先级**: P0
**状态**: READY
**依赖**: 无

## 目标
消除 `dts-studio` 内对 `dts-stack`、`app-stack` 的循环嵌套（账本#5），删除与 RDC 重复的 evolution 产品文档（账本#6），
为 F3 把 copilot 引擎并入 studio 腾出干净的根目录。

## 技术设计
- **步骤**：
  1. `cd RDC/dts-studio`；`git submodule deinit -f dts-stack app-stack`；`git rm -f dts-stack app-stack`；删除 `.git/modules/{dts-stack,app-stack}`（位于 RDC 的 `.git/modules/dts-studio/modules/`）。
  2. 删除 `.gitmodules`（删除后为空文件则直接删掉）。
  3. evolution 去重：以 `RDC/worklog/v1.0.0/evolution/` 为唯一位置；逐个 `sha256sum` 比对 `dts-studio/worklog/v1.0.0/evolution/*`，完全一致的 `git rm`；
     不一致的文件**不删**，列出差异交给用户决定。
  4. `dts-studio/worklog/v1.0.0/README.md` 改为一行指针："studio 相关规划见 dts-rdc/worklog"。
  5. 更新 `dts-studio/README.md` 中的"Three Pillars"表和目录树：去掉 dts-stack/app-stack 子目录描述，
     新增 `engine/`（占位，由 F3 填充）；技术栈表的 AI Core 行加注"待 ADR-5 定稿"。
  6. 提交：`chore(F1/T03): remove nested submodules and duplicated evolution docs`。
- **错误路径**：`git submodule deinit` 报找不到 → 直接编辑 `.gitmodules` 并执行 `git rm --cached`。

## 影响范围
`dts-studio/.gitmodules`、`dts-studio/{dts-stack,app-stack}`、`dts-studio/worklog/v1.0.0/evolution/*`、`dts-studio/README.md`。

## 验证
- [ ] `git -C dts-studio submodule status` 输出为空
- [ ] `sha256sum` 比对记录附在提交说明中

## Definition of Done
- [ ] studio 推送成功，RDC 更新 studio gitlink
