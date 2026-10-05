# Home WireGuard access diagnosis — 2026-10-02

## Confirmed observations

- Windows is on `192.168.0.132`, outside the home LAN, with active `aliyun` at
  `10.20.0.3`. Both VPN and home LAN subnets are routed through that tunnel.
- TCP SSH succeeds to public hub `39.106.43.56`, tunnel hub `10.20.0.1`, and
  `10.20.0.50`. Local `wg show` requires Windows privileges, but hub handshakes
  and these tests demonstrate a working client tunnel.
- Hub `wg0` has `10.20.0.1/24`, `ip_forward=1`, `rp_filter=0`, FORWARD policy
  ACCEPT and no inspected Docker rule blocking WireGuard peer forwarding.
- Linux routes the home prefix through `wg0`, but cryptographic routing assigns
  `192.168.1.0/24` to `dell-popos-dev`, address `10.20.0.5/32`. The latest handshake
  was about 1 day 15 hours old. No PVE/K8s peer was registered. `10.20.0.10` is a
  mobile peer, not PVE.
- TCP from Windows to PVE `.100:22`/`.100:8006`, expected VIP `.110:6443`, and
  nodes `.111-.113:22` timed out. Hub probes to PVE and node `.111` also timed out.
  Retired gateway SSH timed out from both locations.

## Finding and prepared recovery

There is no reachable registered home gateway. A working client/hub tunnel and
a Linux subnet route alone cannot reach the home LAN. This explains the observed
path failure but does not establish whether PVE/K8s are powered off or unhealthy.

Prepare PVE as outbound gateway `10.20.0.100`, preserve its LAN address `.100`,
enable startup/keepalive, and use scoped forwarding/LAN masquerading. Move the
hub's LAN prefix only after the new peer is registered, online and verified.

Runbook/bootstrap: `dts-infra/deploy/wireguard/`. Keys are generated only on PVE.
No remote config was changed. Local shell/boundary validation does not verify
home runtime connectivity. The user was asked which home console/access path
is available. Credentials/private keys were not copied into these records.

## Staged recovery artifact and local verification

A root-only bootstrap with external hub public information was staged at
`39.106.43.56:/root/dts-wireguard-recovery/bootstrap-home-20261002.sh`; it was not
executed. SHA-256:
`a55a28cd47d4641ed5fd1bc6a4d7c40418e92eb4d768758a442c80294a2311d4`.
No live/persistent WireGuard, routing or firewall configuration was changed.
Outer and embedded firewall Bash syntax checks passed, as did the boundary
guard (784 source/build files, 67 active Stack changelogs) and Infra whitespace
diff check. Home gateway registration, route migration and cluster health
verification remain pending a home access path/public key.

## Follow-up: workstation returned to the home LAN

The workstation now has Wi-Fi `192.168.1.9` and VPN `10.20.0.3`. Both interfaces
have a route for the home prefix. Read-only SSH explicitly used the Wi-Fi socket
interface without changing Windows routes. PVE `.100:22`/`.100:8006` and all three
node SSH ports were reachable over the LAN.

PVE inspection confirmed installed `wireguard-tools` version `1.0.20210914-3`,
no active WireGuard interface, an empty `/etc/wireguard`, and `ip_forward=0`.
The existing bridge address/default route and Wi-Fi failover address are intact.
Both firewall daemons run, but `pve-firewall status` reports `disabled/running`,
cluster/host firewall files are absent, and `nft list tables` is empty. Adjusted
the prepared source guard to inspect actual nftables tables rather than rejecting
an idle running daemon. The cloud-staged copy was refreshed with a private backup
of its previous version; its updated SHA-256 is
`b789ea208f89fad6739553e5f461c3a59e5d8a27b1c83b6fedb358ff6f331d4e`.
The refreshed script passed local/cloud shell syntax checks and has not been executed.

No remote network changes were performed in this follow-up. Direct LAN access
is now available for bootstrap; VPN registration, LAN route migration and remote
Kubernetes health verification are still pending.

## Rancher and public application access assessment

Read-only QEMU guest-agent commands on VM 111 confirmed all three RKE2 nodes
Ready, running `v1.35.9+rke2r1`, at LAN addresses `.111-.113`. The Traefik
DaemonSet has 3 desired/ready/available instances. All node HTTPS ports and the
expected API VIP `192.168.1.110:6443` accept LAN TCP connections. These port
checks do not prove public access or a Rancher application endpoint.

There are no Ingress objects, no Rancher deployment among the enumerated cluster
Deployments, and no Pods/Services in `cattle-system`. Rancher is not presently
deployed on this inspected cluster. The Traefik Service is ClusterIP, but its
node ingress HTTPS ports are reachable; do not proxy cloud traffic directly to
the internal Service CIDR or assume the API VIP is a configured ingress VIP.

The inspected Aliyun gateway has 2 logical CPUs and approximately 1.6 GiB RAM,
with about 287 MiB available and no swap. Adding a Rancher management cluster
there is outside the current capacity plan. A larger cloud disk does not add RAM.

Recommended development topology: existing Aliyun WireGuard hub and Nginx,
one PVE home gateway, current RKE2/Traefik, and a Rancher deployment inside the
existing cluster as a development compromise. Separate the management cluster
for a production design. No extra WireGuard peer is required on each node when
the home gateway already routes/NATs cloud traffic to node LAN addresses.
Nginx upstream addresses may be `192.168.1.111-113:443` reached through the VPN;
they are not required to belong to `10.20.0.0/24`.

Proposed DNS names `rancher.yuzhicloud.com` and `dts.yuzhicloud.com` both point
to the public Aliyun address. Nginx forwards to distinct host-based ingress
routes: Rancher manages Kubernetes; DTS serves application users. Preserve Host,
TLS/SNI/certificate verification, forwarded scheme/address headers, and long-lived
WebSocket support. Deploying Rancher still requires matching the current RKE2
version to a supported release and checking Traefik ingress-class configuration.

An alternative cloud-hosted Rancher can use downstream agents' outbound tunnels
for management of an imported cluster, but does not create a public DTS ingress
path. That alternative also needs a separate cloud compute/memory budget.
All commands in this assessment were read-only; no Rancher, DNS, Nginx or VPN
configuration was installed or changed.

Primary references:

- [Rancher installation and ingress](https://ranchermanager.docs.rancher.com/getting-started/installation-and-upgrade/install-upgrade-on-a-kubernetes-cluster)
- [Management cluster separation](https://ranchermanager.docs.rancher.com/reference-guides/rancher-manager-architecture/architecture-recommendations)
- [Rancher proxy headers and WebSockets](https://ranchermanager.docs.rancher.com/v2.14/getting-started/installation-and-upgrade/installation-references/helm-chart-options)
- [Downstream agent tunnels](https://ranchermanager.docs.rancher.com/reference-guides/rancher-manager-architecture/communicating-with-downstream-user-clusters)

## Authorized deployment and final internal acceptance

The user approved the gateway/edge/Rancher topology and subsequently changed the
management hostname to **`k8s.yuzhicloud.com`**. Earlier `rancher.yuzhicloud.com`
references above are historical assessment evidence, not the deployed hostname.

### Home gateway and routing

- Installed `wg-dts` on PVE at `10.20.0.100/32`, with hub endpoint
  `39.106.43.56:51820`, MTU 1420 and keepalive 25 seconds. The service is active
  and enabled. Private keys remain only in root's remote configuration.
- Added persistent IPv4 forwarding and scoped INPUT/FORWARD/MASQUERADE rules
  for the hub `10.20.0.1` and workstation `10.20.0.3`. LAN node replies return
  through PVE without altering node default gateways.
- Registered the home gateway on the hub, verified a fresh handshake and PVE
  management access, then moved `192.168.1.0/24` from retired peer `.5` to `.100`
  in both the live and persistent configuration. Other peers/keys were preserved;
  `.5` retains only its standalone `/32`. The hub interface was not restarted.
- Private hub backups are under `/root/dts-wireguard-recovery/`, including
  `wg0.before-home-peer-20261002T112318Z.conf` and
  `wg0.before-lan-migration-20261002T113333Z.conf`.
- Cloud TCP tests passed for PVE `.100:8006`, all three nodes' SSH/HTTPS ports,
  and API `.110:6443`. Workstation VPN SSH to `10.20.0.100` succeeded. The hub
  route to `.111` uses `wg0` with source `10.20.0.1`.
- Restarted only the owned PVE gateway service: tunnel recovery, three successful
  hub ping replies and edge Rancher health all passed. Physical reboot, cable
  disconnection and wireless underlay recovery were not exercised.

### Rancher installation

Pinned Rancher Community `2.15.2` and Helm `3.20.0`; the current RKE2 minor version
is within the release support matrix. Helm's published SHA-256 was checked. Saved
etcd snapshot `pre-rancher-20261002-k8s-01-1790940915` before deployment.

The Rancher Helm release is deployed at revision 2 after the hostname update.
It has three replicas with required node anti-affinity, 500m/1Gi requests and
2CPU/4Gi limits per replica. Ingress uses class `traefik`, HTTP entrypoint `web`,
and host `k8s.yuzhicloud.com`. TLS terminates on the cloud edge; agent TLS uses
the system trust store. The management `server-url` setting is
`https://k8s.yuzhicloud.com`.

Created the owning RKE2 Traefik HelmChartConfig manifest. Both entrypoints trust
forwarded headers only from PVE's NAT source `192.168.1.100/32`; the reconciled
DaemonSet arguments were inspected. No global insecure header trust was enabled.

Node Docker Hub lookups returned unreachable addresses and image pulls timed out.
Used the workstation's existing Docker proxy to pull official, pinned images and
preloaded their original `docker.io/` names into all three nodes' RKE2 containerd
`k8s.io` namespace. Each transferred archive was SHA-256 checked on PVE and nodes.
The exact eight runtime images are recorded in Infra's `deploy/rancher/images.txt`.
No permanent dependency on the workstation proxy was added to node services.

Archive verification evidence:

| Archive | SHA-256 |
| --- | --- |
| Rancher server | `ae341d4447d066248cba4cab7538cca9fbc30593035bfbb2f7f6d0c64fc290b7` |
| Rancher shell | `2fe8aaf82aea5414ada63d30bc5c9de6e4df82c7ce3b6eef033d38125c769640` |
| Fleet/webhook | `e231611be38ec49df5acc688caef29cf2818fd2066bc9a0838a28f84c7fe6770` |
| Fleet agent/upgrade/Turtles | `b8e9835a87a7b96513ece7fe4d7c63173f0aed1a3a3f51a6e3f00287194726cf` |
| CAPI controller | `0f209c77c819bcdaadc30666d253fc8f7199b1727ca848d26d541e3e88fbadc2` |

Stopped the temporary PVE image HTTP server after all imports completed. Retained
private recovery archives. Removed only five failed, deployment-created Helm
operation Pods whose Helm containers had already exited; current system releases
are deployed. No lakehouse or application resources were deleted.

Final authenticated API acceptance:

- All three RKE2 nodes Ready, unchanged at `v1.35.9+rke2r1`.
- Rancher Deployment 3/3 available, one server on each node; webhook and system
  upgrade controller 1/1 available.
- Fleet controller, Gitjob, Helmops, local Fleet agent, Turtles and CAPI controller
  all Running/Ready. Fleet's local bundle reports 1/1 ready.
- Admin bootstrap authentication succeeds; Rancher API reports the `local` cluster
  **active**, with three nodes. An authenticated internal subscribe WebSocket
  returns **101 Switching Protocols**. This does not prove the pending public TLS
  WebSocket path.
- Lakekeeper, its PostgreSQL and SeaweedFS remain Running/Ready, with no restarts.
  The existing public SSO endpoint still returns its expected 302 response.

The bootstrap password was saved privately on VM 111 at
`/root/dts-rancher/bootstrap-password`, mode 600. It was not printed or copied into
source/worklog. Initial user login/password change remains a user action.

### Cloud edge and remaining DNS prerequisite

Inspected the existing cloud Nginx vhosts before adding a separate
`/etc/nginx/conf.d/k8s.yuzhicloud.com.conf`. Existing PRS, Wiki, SSO, Jira, WWW and
BI vhosts were preserved. The obsolete preparation vhost for the former proposed
Rancher hostname was privately retired.

The active preparation vhost serves ACME challenges and proxies only `/healthz`.
Full HTTPS/Host/forwarded-header/WebSocket configuration is prepared at
`/data/dts-rancher/k8s.yuzhicloud.com.conf.pending`, with upstreams
`192.168.1.111-113:80` reached through WireGuard. Nginx syntax tests passed and
the active preparation vhost was gracefully reloaded. The full candidate's earlier
syntax-only test used an existing certificate solely as a parser fixture; it was
never installed as the new domain's certificate.

All three cloud-to-node health requests returned 200 `ok`. The public-edge probe
from the workstation, explicitly bypassing its local HTTP proxy and supplying
Host `k8s.yuzhicloud.com`, also returned 200 `ok`. The workstation's generic HTTP
proxy returned 404 for the IP-address probe; direct requests and cloud loopback/
public-address probes succeeded.

At final verification, `getent ahostsv4 k8s.yuzhicloud.com` still returned no record.
No DNS API credentials were found in the inspected cloud DNS configuration paths.
The user was asked to add **A `k8s` -> `39.106.43.56`**, replacing the earlier
request for the abandoned Rancher hostname. No DNS record was changed by this
deployment and no certificate issuance was attempted against unresolved DNS.

Root-only `/data/dts-rancher/finish-public-edge.sh` is staged and passes Bash syntax
validation. After DNS is ready it checks the target address, uses the existing
production ACME account, obtains the certificate, backs up/replaces/tests/reloads
the vhost, installs a certificate-scoped Nginx renewal hook and checks public
HTTPS health. Public certificate, browser login, public WebSocket and renewal
dry-run validation remain pending DNS; this deployment is **not yet complete for
public domain access**.

Formal runbooks and credential-free deployment assets belong to
`dts-infra/deploy/{wireguard,rancher}`. Local boundary validation passed
(784 source/build files; 67 active Stack changelogs); Infra whitespace checking
passed. These operational checks do not claim application build/test execution.

## Follow-up: public HTTPS completed after DNS registration

On 2026-10-02 the user confirmed DNS registration and authorized certificate
issuance and the remaining public access work. Both workstation and cloud DNS
resolved `k8s.yuzhicloud.com` to `39.106.43.56`; no AAAA record was returned in the
workstation query. The staged script and HTTPS candidate hashes matched the
owning Infra source before execution.

Obtained the production Let's Encrypt certificate using the existing ACME account
and HTTP webroot validation. Certificate SAN/CN is `k8s.yuzhicloud.com`, issuer
`Let's Encrypt YE2`; expiry is **2026-12-31 19:57:11 Asia/Shanghai**. Private keys
remain on the edge. Backed up the preparation vhost privately, activated the full
HTTPS Nginx vhost and gracefully reloaded Nginx. The active vhost SHA-256 is
`b84319ca877f92f8d53de46d12f8e538891a0e63e0c352580cf7a7b2c690bec5`.

An immediate post-reload health probe failed hostname validation; subsequent
strict public/loopback/workstation probes passed without any certificate
validation bypass. Updated the finishing script with a bounded strict retry to
accommodate graceful vhost activation, and explicit proxy bypass for this direct
edge probe. The updated root-only remote copy passed Bash syntax validation.

Final public acceptance evidence:

- Workstation direct HTTPS `/healthz`: 200 `ok`, valid hostname/trust chain,
  negotiated TLS 1.3.
- Cloud public and loopback HTTPS `/healthz`: 200 `ok`, with certificate
  verification enabled. Nginx syntax test passed.
- `/dashboard/` and `/dashboard/auth/login`: 200 with HTML dashboard documents.
  A browser User-Agent at the domain root redirects to `/dashboard/` normally;
  programmatic API User-Agents retain Rancher's native JSON root behavior.
- Authenticated **public HTTPS** admin login succeeded using the remotely stored
  bootstrap password. The public Rancher API reports `local` **active**, three
  nodes. No password or session token was printed or copied into source.
- Authenticated public WSS subscribe through Nginx, WireGuard and Traefik:
  **101 Switching Protocols**, matching `Sec-WebSocket-Accept`, TLS 1.3.
- All three RKE2 nodes Ready, Rancher 3/3, webhook/upgrade controllers available,
  and the existing lakehouse Pods Running/Ready with no restarts.

Enabled the certificate-scoped Nginx deploy hook and verified the existing
`certbot.timer` is enabled/active. Ran only this certificate's renewal simulation:
`certbot renew --cert-name k8s.yuzhicloud.com --dry-run --run-deploy-hooks
--non-interactive --no-random-sleep-on-renew`. It returned exit 0 and successful
simulated renewal; the deploy hook's Nginx syntax/reload checks succeeded.

Public infrastructure acceptance is complete. The user can log in with `admin`
and privately retrieve the initial password from VM 111's root-only recovery copy;
first-login selection of a new administrator password remains a user action.
Physical host/cable failover and application business acceptance were not part
of this public TLS verification. Existing vhosts and application resources were
preserved; no changes were made to the K8s node default gateways or RKE2 version.
