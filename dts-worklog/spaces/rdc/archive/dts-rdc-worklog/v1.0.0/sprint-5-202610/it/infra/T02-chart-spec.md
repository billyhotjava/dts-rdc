# F7/T02 chart 规范与连接契约规范：证据（2026-09-29）

**代码**：`billyhotjava/dts-infra` 分支 `feat/T02-chart-spec`，提交 `b68657b`，叠在 W5–W6 之上。
**产出**：
- `docs/chart-spec.md`（chart-spec v1）；
- `docs/contract-spec.md`（contract-spec v1）；
- `dtsctl chart check DIR...`，即设计要求的“可复用 CI 步骤”。它直接在 dtsctl 里实现，用 Helm SDK 渲染后按规则检查，不依赖外部 Kyverno CLI。

## RED / GREEN

| 夹具 | 预期 | 结果 |
|------|------|------|
| `testdata/charts/check/violations`（故意违规） | 除 CHART002 外的 13 条规则全部命中（CHART014 为 warn） | PASS（`TestViolationsTriggerEachRule`） |
| `testdata/charts/check/broken`（模板渲染失败） | CHART002 | PASS |
| `testdata/charts/check/prs-service-original`（PRS `sources/deploy/helm/prs-service` 原样） | 不通过 | PASS，6 个 error，见下 |
| `testdata/charts/check/prs-service-compliant`（同一骨架按规范改造） | 0 问题 | PASS |

`dtsctl chart check testdata/charts/check/prs-service-original`（退出码 10）：

```
FAIL prs-service 0.1.0 (chart-spec none)
  [error] CHART001 Chart.yaml: missing annotation infra.dts.yuzhicloud.com/chart-spec: v1
  [error] CHART003 deployment/prs-shadow/prs-shadow: image not pinned by digest: prs-shadow:1.0.0-SNAPSHOT
  [error] CHART005 deployment/prs-shadow/prs-shadow: not restricted: allowPrivilegeEscalation: false, capabilities.drop: [ALL], seccompProfile.type: RuntimeDefault, readOnlyRootFilesystem: true
  [error] CHART010: no ServiceMonitor or PodMonitor rendered with global.monitoring.enabled=true
  [error] CHART011 httproute/prs-shadow: HTTPRoute has no parentRefs
  [error] CHART013 deployment/prs-shadow/prs-shadow: image ignores global.imageRegistry: prs-shadow:1.0.0-SNAPSHOT
```

**CHART011 是 PRS 骨架里的真实缺陷**：`templates/httproute.yaml` 读的是 `.Values.parentRefs`，但 `values.yaml` 里写的是 `httproute.parentRefs`，所以渲染出的 HTTPRoute 不挂任何网关。PRS 改 chart 时按 `prs-service-compliant` 修正即可（需通知 PRS 负责人）。

## 实现中的设计决定

| 项 | 决定 | 依据 |
|----|------|------|
| 路由对象 | Gateway API `HTTPRoute`，挂到 `global.gateway`（默认 `dts-gateway/dts-gateway`）；forwardAuth 通过 `ExtensionRef` 引用 Traefik Middleware；禁止 `Ingress`、Traefik `IngressRoute`、`LoadBalancer`/`NodePort` | K8s 标准，Traefik v3 与云上托管网关都支持，PRS 已在用；设计 00 §7 ⑨ 已同步 |
| values 契约 | `global.imageRegistry`、`global.storageClass`、`global.monitoring.enabled`、`global.gateway.*`、`contracts.<capability>.secretName`、`ai.enabled` | 设计 00 §4.1（ACK 改写仓库）、§7 共性十项 |
| 检查方式 | 渲染两次：默认值（必须能渲染）＋哨兵值（规则在这一次上检查，用哨兵值判断 storageClass、仓库、网关是否真的取自 values） | 不需要集群，可在任意 CI 运行 |

## 仍待决定：O1 自有镜像的 base image

design/00 §10 O1（责任 T02）：自有镜像用单一 base，还是 Debian/openEuler 双轨。**建议**：自有镜像统一用 openEuler 24.03 LTS 的最小多架构镜像（国产、信创友好、单轨测试面最小），第三方上游镜像保持原样。这项需用户拍板，定稿后写入 chart-spec §1。
