# F7 dtsctl W5–W6 证据（2026-09-29）

**代码**：`billyhotjava/dts-infra` 分支 `feat/W5-helm-executor`，提交 `5049c84`，叠在 W4 之上，尚未合入 main。
**设计**：F7 `design/01` §9。实现中把幂等键由 chart digest 改为 spec-hash，§9.2 已同步。

## 验证结果（开发机，envtest 使用 kube-apiserver/etcd 1.34）

```
$ make lint       -> 0 issues.
$ make test-race  -> api/v1alpha1 · internal/cli · pkg/audit · pkg/bom · pkg/deploy · pkg/issue · pkg/lease · pkg/orchestrator · pkg/preflight · pkg/profile 全部 ok，无 data race
$ make cover      -> pkg/ total 86.3%
```

| 场景 | 测试 | 结果 |
|------|------|------|
| 全新部署按依赖顺序执行，12 个组件 Ready，history/observedBom 写入 | `TestFreshDeployInstallsEverythingInDependencyOrder`（fake） | PASS |
| 同一 release 再执行不调用 Helm | `TestUnchangedComponentsDoNotCallHelm` | PASS |
| 升级只动变更组件（含只换镜像的 gateway），删除 cert-manager | `TestUpgradeAppliesOnlyChangedAndRemovesDropped` | PASS（先 RED：只比 chart digest 时漏掉 gateway，据此改为 spec-hash） |
| 组件失败：下游保持 Pending，上游不动，同层其余组件跑完，退出码 13 | `TestFailurePausesDownstreamAndLeavesUpstream`、`TestSiblingsInFailedLayerFinish` | PASS |
| profile 与现场 values 深合并；只改现场 values 也会触发升级 | `TestValuesMergeProfileAndSiteOverrides`、`TestSiteOverrideChangeUpgrades` | PASS |
| Helm release 处于 pending 状态时拒绝，并提示 `helm rollback` | `TestPendingHelmReleaseFailsWithRemediation` | PASS |
| 中途取消（记为 Aborted）后再次执行，结果与一次成功执行一致 | `TestResumeAfterCancelMatchesSingleRun` | PASS |
| **真实 Helm v4**：安装 → 重复执行（修订号不变）→ 升级 beta 到 1.1.0，并改 gamma 的 values | `TestExecutorWithHelmOnEnvtest` | PASS（修订号：alpha 1、beta 2、gamma 2） |
| Lease 互斥（退出码 12）、过期接管（报告前一持有者）、迟到的释放不影响他人、续约保活 | `pkg/lease` 3 个用例 | PASS |
| `pkg/deploy` 端到端：自装 CRD、存 BOM/profile、审计事件、锁冲突、升级被打断后 resume | `TestDeployUpgradeResumeAndLock` | PASS（resume 后修订号 alpha 1、beta 2、gamma 1） |
| CLI：kubeconfig → `dtsctl deploy --charts-dir` → `dtsctl status`（json/text），审计 journal 写入 | `TestDeployAndStatusCommands` | PASS |
| **Harbor 集成**：推送 chart 到 `10.20.0.50:18443/dts/charts/it-alpha:1.0.0`，按 digest 拉回；digest 不符时退出码 15 | `TestOCISourceAgainstHarbor`（`DTS_IT_HARBOR=1`） | PASS，digest `sha256:c3fab277348f9a6b7ff878c7b5deebc15dd12c42411131960bd24bd121375e6f` |

## 未覆盖（等集群环境）

- 真实工作负载的就绪等待（Deployment/StatefulSet 的 kstatus）、PVC、网络；envtest 没有节点，只验证了 ConfigMap 类资源；
- 断网安装；进程被 `kill -9` 后的 resume（envtest 用 context 取消模拟中断）；
- `--force-unlock-release`（处理 Helm pending 状态的 release）尚未实现。
