# T03: k8s-ready 自检与 Helm chart 骨架
类型：开发/自检。负责人：待确认；状态：DRAFT；估算：2 点（假设）。
设计/需求依据：R-011；`assets/多租户与云原生演进.md` §3.3（清单）、§3.4（需调整的点）；F2/T01 ⑨⑩。
输入依赖：T01 基线服务；输出消费方：Sprint-2 各域服务（直接复用 chart）、R-011 阶段 1。

## 目标和范围
① 对基线服务逐项执行 k8s-ready 清单，给出通过/不通过/不适用及证据；
② 在 `deploy/helm/prs-service/` 按 Helm 4.2.4 建 chart 骨架，目标 Kubernetes 1.36（版本基线 §4），HTTPRoute 使用 Gateway API 标准资源：Deployment（非 root、资源 requests/limits、存活/就绪探针、
   优雅停机与 `terminationGracePeriodSeconds`）、Service、ConfigMap/Secret 引用（不含真实密钥）、
   HTTPRoute（Gateway API，与 F4 路由表 v0.1 对应）、values 区分 dev 与私有化。
排除：k8s 集群搭建与部署、operator 选型落地（R-011 阶段 1）。

## 工作内容
清单自检（配置外部化、无本地写盘、探针分离、优雅停机、stdout JSON 日志、OTel、镜像构建与非 root、ShedLock、迁移加锁）→
不通过项回写 F2 规范或建缺陷 Task → 编写 chart → `helm lint` 与 `helm template` 渲染结果留档 →
把 compose 与 chart 的配置项对照表写入 chart README，避免两份部署描述漂移。

## Ready 与完成标准
Ready：T01 基线服务可运行；F2/T01 ⑩ 草案可读（未出则按 §3.3 清单执行）。
完成：清单逐项有结论和证据；`helm lint` 通过；渲染结果与 compose 配置对照一致；结论记入 `it/baseline.md` 附注。

## 实际结果
未执行。
