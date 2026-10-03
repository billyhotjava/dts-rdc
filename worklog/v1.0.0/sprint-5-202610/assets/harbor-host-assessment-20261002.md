# Harbor host assessment — 2026-10-02

## Recommendation

Reuse and repair the existing Harbor 2.15.2 installation on `10.20.0.50` as the
DTS development image/OCI chart registry. There is no need for another installation
or another registry data directory. Expand the shared host to 16 GiB RAM, or place
Harbor on a separate host with a dedicated memory budget. Current resources permit
small-scale testing, but not a comfortable shared long-term setup.

This was a read-only remote assessment authorized by the user. No remote service,
container, configuration, clock or data was changed. Findings belong to the current
Sprint 5 Infra workstream and do not mark its delivery tasks complete.

## Observed host and resources

| Item | Observation |
|---|---|
| Host | `jira`, VMware VM, RHEL 8.10, x86_64 |
| CPU | 4 vCPU; load average approximately 0.21 / 0.12 / 0.13 |
| Memory | 7.5 GiB usable, 5.0 GiB used, 2.2 GiB available |
| Swap | 7.9 GiB total; approximately 3.3 GiB used |
| Storage | XFS root filesystem 970 GiB; approximately 934 GiB free |
| Storage layout | `/data` and Docker share the root filesystem; no dedicated Harbor disk |
| Container runtime | Docker 26.1.3, Compose 2.27.0 |
| Existing workloads | Jira/PostgreSQL, Wiki v1/v2, Keycloak/PostgreSQL and Portainer |
| Jira container memory | Approximately 3.9 GiB at inspection |
| Harbor storage | Approximately 70 MiB data, 12 MiB logs and 697 MiB installer distribution |

Harbor's official prerequisites list 2 CPU / 4 GB RAM / 40 GB disk minimum and
4 CPU / 8 GB RAM / 160 GB disk recommended. The current host's CPU/disk are adequate,
but its whole 8 GB memory budget is already shared with other applications. The
16 GiB recommendation is an engineering allowance for those workloads, not an
additional official Harbor minimum. Swap use alone does not prove active thrashing;
it does show that available physical memory should not be treated as a dedicated
Harbor allocation. No recent kernel OOM entries were found in the inspected window.

Source: [Harbor prerequisites](https://goharbor.io/docs/edge/install-config/installation-prereqs/).

## Network and current outage

The user's Windows WireGuard interface has `10.20.0.3`. TCP SSH to `10.20.0.50:22`
was confirmed with that source address. Portainer `19443` is reachable. Harbor
`18443` and `18082` refuse connections; a server-local health request also fails.
The host's WireGuard address is `10.20.0.50/32`, with `10.20.0.0/24` routed through
its gateway peer. Individual Kubernetes-node reachability was not tested.

Harbor 2.15.2 images and installation directories are already present. Database,
Valkey and log containers are healthy. Core, jobservice, portal, registry and
registryctl exited with status 128. Harbor nginx repeatedly restarts because its
`core:8080` upstream is absent. Their recorded startup error is:

```text
failed to initialize logging driver: dial tcp [::1]:1514: connect: connection refused
```

The generated Compose configuration points to `tcp://localhost:1514`; this host
resolves `localhost` to `::1`. The log container publishes only
`127.0.0.1:1514:10514`. An IPv4 connection to that port succeeds; the IPv6 loopback
connection fails. This address mismatch is directly verified. Reboot/startup order
also needs hardening: there is no Harbor-specific systemd unit, and simple
`restart: always` did not recover these failed container starts after the last boot.

Recovery should use the existing data and configuration. Normalize Harbor's logging
endpoint to explicit IPv4, provide a verified startup dependency on the log service,
then recreate/start only Harbor's affected services. Make the normalization part of
the Infra installation workflow so a later `prepare` does not restore the mismatch.
A whole Docker-daemon restart or registry-data deletion is not a required recovery
step. Verify all Harbor health components, HTTPS and a push/pull round trip afterward.

Related upstream report: [Harbor logging connection failure](https://github.com/goharbor/harbor/issues/20949).

## Clock and TLS

The host's UTC clock is approximately eight hours ahead of the inspection client's
UTC clock. NTP is disabled and `chronyd` is inactive. Plan clock synchronization with
owners of the existing Jira/Wiki/SSO workloads; a backward clock step can affect
in-flight authentication/session checks. The exact external reference was the
client's UTC clock, not a separate NTP measurement.

The existing certificate covers IP `10.20.0.50` and DNS `harbor.dts.internal`; its
validity is 2026-09-27 to 2029-01-01. The public CA in
`/data/harbor/deploy/certs/ca.crt` matches the repository's public CA byte hash.
A server-root deployment CA file was absent; client instructions should use the
verified certificate path. No private key or password was read into this report.

Continue initially with `10.20.0.50:18443` and distribute that public CA to build
clients and RKE2 nodes. A future `harbor.yuzhicloud.com` name needs DNS and a matching
certificate SAN; it is not covered by the current certificate. Keep registry access
on the WireGuard network for this phase.

## Development integration

1. Repair the existing Harbor instance and verify restart behavior.
2. Increase the shared host's RAM to 16 GiB before routine team/CI use.
3. Keep a private `dts` project with component repositories such as `dts-studio`,
   `dts-stack`, `dts-wiki` and `prs-stack`. Use release/commit tags and recorded
   digests. Build clients get scoped push robot accounts; cluster consumers get
   scoped pull accounts. Project membership and existing artifacts still need
   authenticated API verification after recovery.
4. Configure public CA trust and private-registry authentication on every RKE2 node
   that pulls images. `registries.yaml` changes take effect at RKE2 startup and
   require planned node service restarts. Windows Docker trust does not configure
   the cluster's containerd automatically.
5. Validate one small image push from development, pull from each relevant node,
   and deployment of a test workload. WireGuard connectivity from this PC does not
   establish connectivity from all cluster nodes.
6. Set project quota, tag retention, garbage collection and backups before image
   accumulation. The registry shares the host root filesystem, so quotas protect
   other services as well. An initial 100–200 GiB project budget is a practical
   development allocation to revise based on usage. Enable Trivy when its offline
   database/update path is available; the current deployment omitted the adapter.

Harbor manages container images, Helm charts and OCI-packaged artifacts. The extracted
`dts-common-pack:1.0.0` ordinary Maven dependency still needs a Maven-compatible
repository (or local installation). Harbor alone does not provide Maven repository
semantics for the existing Studio build; storing a JAR as OCI does not change that.

Sources:

- [RKE2 private registries](https://docs.rke2.io/install/private_registry)
- [Harbor OCI artifacts](https://goharbor.io/docs/2.10.0/working-with-oci/)

## Complexity and acceptance boundary

Existing-instance recovery is low-to-moderate complexity with a verified startup
failure and retained images/data. Cluster integration is moderate complexity because
all nodes need working routes, CA trust, credentials and coordinated restarts.
External DNS/public publication and high availability are unnecessary for the current
small development scenario and are not included in this recommendation.

The assessment does not certify an operational registry: HTTPS health, authenticated
project inspection, push/pull, cluster deployment and reboot recovery remain acceptance
checks after the approved recovery work is performed.

## Local PVE alternative (verified 2026-10-02)

The user's RKE2 nodes are on the same LAN as PVE `192.168.1.100`. A dedicated
Harbor VM on this PVE host is the preferred primary development registry: node
pulls use the LAN rather than a VPN path through the external gateway. Harbor
should run outside the application Kubernetes cluster so cluster recovery does
not depend on first starting its own image registry inside the same cluster.

PVE inspection confirmed 16 host CPUs, approximately 125 GiB usable RAM and three
running VMs (`111`, `112`, `113`), each configured for 32 GiB. Current host memory
use is approximately 36 GiB; this is an observation of present load, not a promise
that all guest allocations can grow without limit. A new 8 GiB Harbor allocation
would bring configured guest RAM to 104 GiB, leaving about 21 GiB for host overhead
and reserve at the current maximum guest allocations.

Recommended initial VM:

| Setting | Proposal |
|---|---|
| OS | Ubuntu Server 24.04 LTS |
| CPU | 4 vCPU; no dedicated-core reservation |
| Memory | 8 GiB, expandable after observing use |
| OS disk | 32 GiB on `local-lvm` (approximately 141 GiB currently free) |
| Registry data disk | 200 GiB thin-provisioned on `vm-data` |
| Network | Existing `vmbr0`, static LAN address after conflict/DHCP checks |
| Runtime | Docker Compose; Harbor with external persistent data directory |
| Remote access | WireGuard access if needed; local Kubernetes pulls use the LAN |

`vm-data` has about 1.86 TiB physical capacity and is currently 6.77% allocated.
The existing three 1 TiB virtual disks are thin-provisioned, not 3 TiB of physical
storage. The proposed Harbor disk is also a logical limit: monitor actual pool
usage and configure retention/quota/garbage collection. This new registry shares
the PVE host's failure domain with the development cluster; it is not HA.

A local primary also avoids increasing memory on the current 8 GiB shared
Jira/Wiki/SSO server before starting development. The existing `.50` Harbor can
later be recovered and considered for replication/backup. Placement was presented
to the user as a target choice before provisioning or changing either server.
