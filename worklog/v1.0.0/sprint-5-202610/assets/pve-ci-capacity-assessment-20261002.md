# PVE capacity and CI/CD build-chain assessment — 2026-10-02

## Decision

For the current small-data, end-to-end development stage, the existing PVE host can
support a local Harbor VM and a single-job CI build VM while retaining all three
K8s VMs at their requested 32 GiB configuration. New hardware is not an immediate
prerequisite. This is a capacity estimate from read-only inspection, not a measured
full-load CI benchmark or a completed installation.

Recommended initial additions: Harbor 4 vCPU / 8 GiB RAM, CI runner 4 vCPU / 12 GiB
RAM, with one active build job across the DTS repositories. CPU/build concurrency
and storage cache growth must be bounded. If the requirement is parallel Java/image
builds while running substantial Spark/Flink/Trino jobs, add a separate physical
build host rather than relying on present idle memory as permanent spare capacity.

No VM allocation, cluster membership, CI registration or service configuration was
changed by this assessment. Harbor and CI VMs have not yet been created.

## Verified host

Read-only SSH to PVE `192.168.1.100` confirmed:

| Resource | Observation |
|---|---|
| CPU | Intel Xeon W-10885M, 8 physical cores, SMT 2, 16 logical threads |
| Memory | 125.4 GiB OS-usable; approximately 36 GiB currently used |
| Available memory | Approximately 89 GiB at inspection; swap usage zero |
| Load | Load average roughly 0.21 / 0.51 / 0.87 |
| Short CPU sample | Approximately 93–96% idle, roughly 1% I/O wait |
| Guests | Three running K8s VMs, IDs 111/112/113 |
| Guest allocation | Each 16 vCPU, 32 GiB RAM, 1 TiB logical disk; ballooning disabled |
| Guest host memory | Approximately 9.7, 11.5 and 11.1 GiB in the current sample |
| SSDs | Samsung 970 EVO 1 TB, SK Hynix 1 TB and Micron 2300 256 GB; all NVMe, non-rotating |
| VM data pool | Approximately 1.86 TiB physical; 6.77% used; about 1.70 TiB currently free |
| PVE system SSD pool | `local-lvm` approximately 141 GiB free |
| PVE system filesystem | Approximately 58 GiB free; not intended for large build caches |
| PVE topology | One standalone physical node; no existing Corosync cluster |

The current 89 GiB available-memory figure does not cancel the configured 96 GiB
maximum across existing guests. Guest pages not currently used by their workloads
may become resident later. Similarly, 48 allocated guest vCPUs do not provide 48
physical cores: the entire host has 8 physical cores and 16 schedulable threads.
CPU oversubscription is acceptable for light development but not a guarantee of
simultaneous full-speed compilation and data processing. This short idle sample
must not be generalized into a sustained-load guarantee.

## Memory budget

| Allocation | GiB |
|---|---:|
| K8s node 111 | 32 |
| K8s node 112 | 32 |
| K8s node 113 | 32 |
| Harbor | 8 |
| CI runner | 12 |
| Total configured guest RAM | 116 |
| Remaining from 125.4 GiB usable | About 9.4 |
| Suggested host/QEMU/cache reserve within that remainder | About 8 |

The approximately 8 GiB host reserve is an engineering budget, not an official PVE
minimum. This plan fits the current maximum guest allocations but leaves little
room for further fixed-memory VMs. Giving CI 16 GiB would leave only about 5.4 GiB
for host overhead/cache; a 32 GiB CI guest would exceed usable physical memory when
the other guests reach their allocations. Do not justify those larger allocations
only by the current low guest usage. No change to the user's requested K8s RAM is
included in this plan.

## Initial VM/storage plan

| VM | CPU / RAM | OS disk | Persistent data |
|---|---|---|---|
| Harbor | 4 vCPU / 8 GiB | 32 GiB on `local-lvm` | 200 GiB on `vm-data` |
| CI build runner | 4 vCPU / 12 GiB | 32 GiB on `local-lvm` | 200 GiB on `vm-data` for workspaces, dependencies and BuildKit cache |

Both use Ubuntu Server 24.04 and the existing LAN bridge. Actual addresses need
normal duplicate-address/DHCP checks during provisioning. The 64 GiB combined OS
disks fit the system SSD thin pool. Put growing Maven/npm/Go/container caches on
CI's data disk, not the PVE host root filesystem. All three SSDs are NVMe, so no
mechanical-disk bottleneck was identified.

The pool is shared by existing K8s disks, the proposed registry and build cache.
Logical disk sizes are limits, not additional physical storage. The three existing
1 TiB guest disks already exceed physical pool capacity if all become full. Keep
registry retention/quota and bounded CI cache cleanup; monitor the physical thin
pool and its metadata. Adding another machine's disks does not automatically extend
this local pool.

## Complete pipeline at modest resource cost

The repositories already use GitHub and contain GitHub Actions workflow definitions.
Use GitHub Actions as the initial controller and a dedicated local Linux self-hosted
runner for trusted DTS build jobs. The runner requires outbound HTTPS access to
GitHub; CI controls and logs can remain there without allocating another local
controller VM. Running the actual builds locally keeps Harbor and cluster traffic
on the LAN. This controller choice is a recommendation, not a newly registered runner.

Proposed pipeline:

1. Check out the owning repository and run module boundary/static checks.
2. Resolve pinned dependencies and released shared artifacts.
3. Compile and run unit/API/PostgreSQL integration tests in disposable containers.
4. Build the service image, scan it, record a commit/release tag and digest, and push
   it with a scoped registry account to the local Harbor project.
5. Publish shared Java libraries to a Maven-compatible artifact registry. Harbor
   handles OCI artifacts, not the existing Maven coordinate/repository protocol.
6. Update versioned environment manifests/chart values to the tested image digest.
7. Synchronize a development namespace through a GitOps controller, then check
   rollout/health and run a smoke test. A rollback restores a previously tested
   manifest/image version; database changes need their own reviewed migration plan.
8. Retain logs/test reports/release metadata and clean ephemeral workspaces/caches.

Argo CD can run in the existing K8s cluster for the deployment step, inside the
existing K8s memory budgets. Use its minimal development deployment initially;
its exact footprint and permissions need validation during setup. CI writes the
versioned deployment reference and a separate scoped CD identity applies changes.
There is no need to run compilation inside the business Kubernetes workloads.

The chain needs isolated build environments for Java 21 (Common/Studio/Stack),
Java 25 (Wiki/PRS), Node 24 (Wiki frontend) and the existing Go BOM (Infra). Preserve
module versions rather than forcing one global Java toolchain. Start with one job
and conservative test/build thread counts; multi-repository parallel builds are
not included in the initial 12 GiB allocation. Previous Common/Studio/Stack tests
passed locally but were not a benchmark of this uncreated CI VM.

GitHub Packages is a Maven-compatible option that avoids another local Nexus VM
at this stage. Registry access/token permissions need setup for the separate consumer
repositories. If local-only source control, artifacts, Jenkins/GitLab, SonarQube or
several independent CI runners are requirements, re-budget their controllers and
services explicitly; the current small plan does not silently include all of them.

Official references:

- [Self-hosted runner requirements and network access](https://docs.github.com/en/actions/reference/runners/self-hosted-runners)
- [GitHub Maven registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-apache-maven-registry)

## When to expand

A second physical machine is recommended when any of these requirements becomes
routine: two or more heavy build jobs at once, frequent integration suites alongside
large data-processing jobs, additional local CI/artifact controllers, or separating
the build workload from cluster/registry recovery. Watch sustained CPU use, active
swap, available-memory reserve, build queue times and physical pool use. Thresholds
such as CPU above 70% for 15 minutes or queues above five minutes are initial local
operational heuristics, not official platform limits.

For a dedicated development build host, a practical budget is 8–12 physical cores,
32 GiB RAM minimum (64 GiB recommended for Harbor plus parallel build jobs), and
1–2 TB NVMe with wired LAN. These are engineering sizing recommendations, not a
hardware model or purchase-price comparison. Start one runner, then measure peak
RAM and job duration before enabling more concurrency. Native ARM64 builds may
later require a separate ARM64 runner; x86 emulation is not native platform validation.

The second machine may run the Linux runner directly, or run PVE with a CI VM and
be managed as a second PVE node. A PVE cluster provides shared management/migration;
a single VM still executes on one node, and CPU/RAM are not fused across servers.
For two nodes, plan an independent quorum device if quorum availability matters,
plus compatible guest CPU/storage arrangements for migration. Cluster membership
alone does not provide shared local disks or high availability. The current three
K8s VMs are all on one physical host and do not tolerate losing that host.

Reference: [Proxmox cluster requirements and quorum](https://github.com/proxmox/pve-docs/blob/master/pvecm.adoc).

## Next planning gate

The preferred development baseline is existing GitHub control plane, local Harbor
and one local runner with the above limits. Confirm whether externally hosted CI
control/artifact services are acceptable and how many heavy builds must run
simultaneously before installing the chain or purchasing hardware. No additional
purchase is required to start a single-job pipeline on the inspected host.

## Orca development workload addition

The user added Orca as a requirement for the build/development server. A full
Pop!_OS desktop is not required. The project's headless Linux guide explicitly
supports Ubuntu 24.04: `orca serve` needs Electron shared libraries and Xvfb, but
does not need a logged-in desktop session. Verify the selected release against
these requirements before provisioning; this assessment has not tested a runtime.

Two deployment modes are relevant:

| Mode | UI location | Server responsibility |
|---|---|---|
| SSH worktrees | Existing Windows desktop | Remote worktrees, agent processes and build tools, with Orca's SSH relay |
| Remote Orca Server | Existing Windows client | Full persistent Orca runtime, worktrees and agents under `orca serve` |

Prefer the second mode when server-owned sessions and automation are required.
The official remote-server documentation labels that feature beta. Use the
existing LAN/WireGuard route for client pairing. Install and authenticate agent
CLIs on the server: client authentication does not automatically transfer there.
An SSH-worktree pilot is also possible without deploying a full server runtime.

Orca is the agent development environment; the CI runner still performs repeatable
pipeline builds. Keep their OS accounts, source checkouts and credentials separate.
Respect each DTS repository's ownership and toolchain conventions in agent
worktrees as well as in CI. A shared VM is an initial capacity compromise, not
isolation between independent machines.

The previous 4 vCPU / 12 GiB CI proposal covered one build job. It is not a capacity
guarantee for that job plus simultaneous agent-driven builds. For an initial
Ubuntu Server pilot, keep one heavy compilation/test/image-build workload active
across both CI and agents, and measure peak memory before raising concurrency.
Several agents editing code do not imply several heavy builds must run at once.
Do not spend the limited host reserve on a desktop solely to satisfy Orca.

For routine concurrent agent builds plus CI and K8s data workloads, the separate
physical build/development host recommendation becomes stronger. A 32–64 GiB
development/build budget is an engineering starting point, not an Orca minimum.
The inspected PVE has only about 9.4 GiB left after the proposed 116 GiB guest
allocations; assigning a larger build VM needs a new memory plan or additional
physical capacity. No VM or Orca installation was performed in this follow-up.

Official references checked on 2026-10-02:

- [Headless Linux server requirements](https://github.com/stablyai/orca/blob/main/docs/reference/headless-linux-server.md)
- [SSH worktrees](https://www.onorca.dev/docs/ssh)
- [Remote Orca Servers](https://www.onorca.dev/docs/remote-servers)
- [Ways to run Orca](https://www.onorca.dev/docs/ways-to-run)
