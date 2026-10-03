# Rancher Keycloak OIDC implementation — 2026-10-03

**Current status:** native Keycloak OIDC is enabled and runtime acceptance passed.
The preparation and retained-administrator sections below record earlier states;
the activation follow-up supersedes their pending status.

## Status and scope

The user authorized implementation after the assessment. Client provisioning, scoped
RBAC and native Rancher activation tooling are implemented and deployed. **External
authentication is not enabled yet.** The selected human SSO administrator is pending
user input: existing `xiezm` is enabled, while `billy` is disabled. No staff password,
enabled flag or group membership was changed. Do not infer administrator ownership
from a username or reuse the corporate administrator group for cluster administration.

Owners are Infra operational SSO/Rancher adapters. Existing Wiki/Jira clients and
business modules were preserved. T11's general connection-contract engine and T19's
Keycloak Operator/customer realm/API-server OIDC delivery remain pending; this work
does not claim to complete those broader tasks.

## Runtime changes and evidence

- Keycloak `26.7.4` runs on `10.20.0.50`; the public realm discovery endpoint responds
  successfully with issuer `https://sso.yuzhicloud.com/realms/yuzhicloud`.
- Provisioned dedicated confidential client `dts-rancher`, exact login redirect
  `https://k8s.yuzhicloud.com/verify-auth`, authorization code flow and service account.
  Implicit and resource-owner password flows are disabled for this client.
- Added client-owned group/name/path and audience mappers. ID-token and userinfo
  group claims are included. Keycloak normalizes additional mapper defaults; the
  reconciliation compares owned fields and preserves server-added settings.
- Created empty top-level groups `rancher-admins`, `rancher-devs`, `rancher-viewers`.
  No existing staff was granted membership while the administrator selection is pending.
- The dedicated service account received only the three realm-management directory
  query roles. Client-credential probes against user and group APIs passed; ordinary
  staff received no directory management role.
- Existing `local:p-wb45c` (`Default`) is the development project. Added four global
  bindings (three `user-base`, one administrator-group `admin`) and two project
  bindings (`project-member` for developers, `read-only` for viewers). Existing
  explicit grants and the `System` project were preserved; no namespace was moved.
- Changed the new-user global default from `user` to `user-base`.
- Native Rancher `configureTest` accepted the external OIDC contract, explicit
  discovery endpoints, group whitelist and PKCE S256 and returned an authorization
  URL. This is preparation evidence, not successful OIDC authentication.
- Final live readback: `keycloakoidc.enabled=false`, default global role `user-base`.
  All three RKE2 nodes are Ready, Rancher deployment is 3/3 Available.
- Repeated final Keycloak reconciliation and Rancher RBAC reconciliation each
  returned an empty changes list. Existing client secret was reused rather than rotated.

Private pre-change auth/users/roles/bindings backup and the OIDC contract remain on
VM 111 under `/root/dts-rancher/`, mode `0600`. The old bootstrap login attempt returned
HTTP 401; the existing administrator password was not reset. An explicitly temporary,
expiring deployment token for the existing local administrator was used through
authorized node-root access, and is revoked at the end of this preparation turn.
Prepared PKCE session files are removed; regenerate a fresh session for activation.
No browser or IdP impersonation session was created in this preparation turn.

## Local verification

- Seven offline Python tests passed. Coverage includes preservation of unrelated
  grants, scoped viewer permissions, idempotent RBAC, rejecting ambiguous/System
  projects before writes, activation failure recovery, validation-token cleanup,
  session origin validation and Keycloak mapper normalization.
- Python syntax checks passed.
- `python3 scripts/check-boundaries.py`: PASS, 784 source/build files and 67 active
  Stack changelogs; historical migration seeds preserved.
- Infra tracked diff whitespace check passed; new adapter/runbook files checked
  for trailing whitespace. No application/Stack/Common source changes or business
  database test access occurred.

## Remaining acceptance

Select the enabled human SSO administrator, grant that user the dedicated admin group,
prepare a fresh PKCE session and complete Rancher's `testAndApply` as that identity.
Then validate authorized administrator/developer/viewer login, unauthorized-group
denial, viewer mutation denial, logout and the retained local administrator entrance.
Temporary verification users, tokens and any provisioning-only IdP sessions must be
removed after that validation. Browser password/MFA acceptance must be distinguished
from administrator-assisted authorization-code provisioning.

Formal instructions are in `dts-infra/deploy/rancher/oidc.md`. Secrets, authorization
codes, JWTs and PKCE verifier values are excluded from source and this evidence.

## Follow-up: retained installation administrator

The user asked how to handle the installation `admin`. Keep it as an independent
local recovery account, with its existing password and direct administrator grant.
Native `testAndApply` links the IdP identity to the current bearer-token user, so
activation must use an isolated initialization identity, not this retained account.
The adapter now looks up the token user and rejects activation as `admin` before
any activation write. After successful activation, the resulting SSO user retains
its IdP principal while temporary initialization grants/credentials/tokens are removed;
normal SSO administration then follows the dedicated group binding.

Eight offline tests pass, including rejection of OIDC activation as the default local
administrator without consuming recovery inputs. No runtime account binding or
password change was made; staff administrator selection remains pending.

## Follow-up: activation and runtime acceptance

The user reported that the Keycloak entrance was missing and supplied the intended
staff username `xiezm` in the Rancher login screenshot. The native provider was still
disabled. Added that existing enabled staff identity to the dedicated `rancher-admins`
group and completed native PKCE S256 authorization-code activation. Keycloak Admin API
impersonation was used only for provisioning and verification; no staff password, MFA,
enabled flag or unrelated group/client was changed. Password/MFA browser acceptance
remains a user sign-in step, distinct from the verified authorization-code exchange.

The installation `admin` (`user-c4pg4`) remains a separate local account, with only its
original `local://user-c4pg4` principal. Activation used a disposable initialization
user. Rancher's admission webhook rejects ordinary changes to `username` and
`principalIds`; the initial conversion attempt was therefore abandoned without
bypassing the webhook. The recorded initialization binding/user/token/password Secret
were removed through their owning APIs. A fresh OIDC login created the permanent SSO
identity `u-zpas54ns6a`, named `xiezm`. It has no local username/password Secret and only
a direct `user-base` grant; administration is provided by the `rancher-admins` group.
Rancher's generated `local://` principal on an external user is normal platform behavior.

The first preparation URL omitted the `openid` scope in Rancher's native response.
The Infra adapter now explicitly preserves the PKCE/state parameters and requests
`openid profile email`. A new offline test covers this actual integration failure.
Rancher 2.15.2's public login response omits `userId`; verification resolves the token's
user through the node API without printing token material. Native session logout uses
the collection `logout` action; direct DELETE of a login token is rejected by Rancher.

| Runtime check | Observed result |
|---|---|
| Public provider discovery | `local` and `keycloakoidc` advertised |
| Browser entrance | **Log in with OIDC**, plus **Use a local user** |
| Browser redirect | Keycloak **Sign in to Yuzhicloud** at the public issuer |
| Fresh `xiezm` SSO session | Server settings read succeeded through group administration |
| Native directory search | All three dedicated group principals returned |
| Staff outside allowed groups | Login denied, HTTP 401 |
| Viewer | Default project/resources readable; write and System project access denied, HTTP 403 |
| Developer | Default ConfigMap create/delete succeeded; System project denied, HTTP 403 |
| Native logout | Further authenticated request denied, HTTP 401 |
| Provider readback | Enabled, required group whitelist, client-authenticated search, PKCE S256 |
| Global default | `user-base`; unrelated explicit grants retained |
| Idempotence | Keycloak and Rancher RBAC both returned empty changes lists |
| Cluster health | Three nodes Ready; Rancher 3/3 ready and available |

Temporary positive/negative verification users were removed from both Rancher and
Keycloak; the remaining Rancher users are the permanent SSO identity and original local
administrator. Verification ConfigMaps are absent. The recorded temporary IdP sessions
were terminated. Three earlier failed-verification tokens were identified by exact
IDs, owner, provider and creation timestamps and revoked; subsequent native sessions
were logged out or removed during cleanup. Deployment/master-administrator credential
cleanup is recorded separately below. No unrelated user sessions were terminated.

Nine offline tests pass. The boundary check still passes for 784 source/build files
and 67 active Stack changelogs; Infra tracked whitespace checks pass. The operational
runbook now documents disposable-user cleanup, native logout and the actual login
button name. Existing unrelated repository/submodule changes remain preserved.

### Final credential cleanup

The exact temporary local-administrator deployment token was revoked and a subsequent
request using it returned HTTP 401. Removed its private token file and the temporary
Keycloak master-administrator credential file. Node readback found zero owned deployment
tokens and zero labeled verification tokens. The dedicated OIDC contract and private
pre-change backup remain outside the repository with mode `0600`.

The actual browser entrance is captured in `rancher-oidc-login-20261003.jpg` alongside
this evidence. Clicking the OIDC button was also observed to open the Keycloak login
form with the expected client, callback, scopes and PKCE S256 parameters.
