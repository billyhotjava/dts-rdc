# 交付基线（G0）

**状态**: PENDING（由 F0/T03 填写）

按 F0/T03 规定的 6 个章节填写：端口冲突矩阵、启动顺序与健康检查、Keycloak 登录、prs 租户接口、copilot 问数 smoke、资源占用。

## Studio F1 build baseline (2026-09-29)

P7 PASS: Java 21/Maven and the designated `/data/dts-studio` build tree verified; isolated PostgreSQL test harness available; 610 backend tests passed. Source/build SHA and evidence are in [IT-02](IT-02-studio-build.md). P1–P5/P8 runtime, login, deployed schema, real data and live AI acceptance remain PENDING; P6 is outside this backend import slice. Overall runtime G0 is not PASS. This allows migration rehearsal/build verification, not production promotion or business-acceptance claims.
