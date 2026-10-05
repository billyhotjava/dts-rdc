# 导入静态验证（2026-09-26）

结论：**本地资产接收与静态校验通过；未执行应用构建、镜像拉取/构建、容器启动或业务验收。**

| 检查 | 方法 | 结果 |
|---|---|---|
| 来源一致性 | 对 source-manifest.json 的每个 path，分别读取原目录与目标目录并计算 bytes/SHA256 | 93/93 文件一致，共 278598 字节 |
| 文件解析 | Python ElementTree / json 解析导入文件 | 10 XML、1 JSON 通过 |
| 目录排除 | 清单核对 target、node_modules、.git、真实 .env | 0 个；原导入排除 68 个本机文件，保留 .env.example |
| 既有原型 | `git diff --name-only -- backend frontend pack` | 无变更，保留 fc3d0e7 内容 |
| Compose 解析 | 在 prs-stack 执行下方命令；仅摘录镜像与挂载结果 | exit 0 |
| 仓库指针 | RDC 与 app-stack 的 `git diff --raw --ignore-submodules=dirty` 中 gitlink 行 | 无指针变更 |
| 文档格式 | RDC、app-stack、prs-stack 各执行 `git diff --check` | exit 0 |

```sh
docker compose --env-file sources/deploy/.env.example   -f sources/deploy/docker-compose.dev.yml config --format json
```

配置展开只在本机内存中检查，没有把环境配置全文写入文档。结果为：

| 服务 | 声明镜像 |
|---|---|
| prs-pg | postgres:18.6 |
| prs-valkey | valkey/valkey:9.1.2 |
| prs-keycloak | quay.io/keycloak/keycloak:26.7.4 |
| prs-traefik | traefik:v3.7.13 |

PG 卷目标为 `/var/lib/postgresql`。这些是可解析的配置声明，未验证远端镜像可用性、实际版本或运行兼容性。

原目录未修改；`.env` 未导入；新增内容尚未提交。正式仓库交付见 RDC F1/T01/T02，新 BOM 复验见 F0/T03，身份和 RLS 差异见 PRS-G01～04。

复核来源可使用 [逐文件清单](source-manifest.json)；源根路径、目标基准提交及全部哈希均已记录，不依赖原目录具有 Git 历史。
