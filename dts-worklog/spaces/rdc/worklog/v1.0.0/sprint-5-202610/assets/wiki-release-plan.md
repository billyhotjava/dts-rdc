# Wiki runtime release and acceptance plan

Date: 2026-10-06. Owners: F2/T08, F4/T03, F5/T07, F5/T08 and F5/T10.
G3 remains GAP; G4 remains PENDING until actual target acceptance is recorded.

## Scope, migrations and compatibility

The application candidate remains the checksummed offline r2 bundle at source
`688d6b9`. WP13 adds acceptance tooling/CI at `452021b`, with no application API,
entity or migration changes. Ship its separate operator toolkit alongside r2;
never replace the application image under the existing release tag.

The target is only `/data/dts-wiki-v2`, port 18091. Current public probes report
`345083e-dirty`, UP health/readiness and anonymous API 401. This older runtime
is not acceptance of r2. Preserve existing Wiki 18090 and the company identity,
Jira, dockerd and public proxy runtimes.

The candidate preserves 33 historical changelogs and adds only 9006/9007/9008
for manifest, history/activity and collaboration. There is no contract/drop
phase or historical checksum regeneration. Consumers are the bundled React
client, authenticated REST clients, personal MCP and the content repository.
The pinned Common Pack 1.1.0 contract and inbound-only Git ownership remain.

Inspect actual database counts, Liquibase state, image IDs and storage before
choosing additive upgrade. A reset is not the default: require confirmed
acceptance-only contents, a verified backup/restore and explicit approval for
the exact v2 database. Abort on unexpected contents or migration state.

## Execution order and evidence

1. Establish authorized SSH. Record v2 images, page/version/attachment/migration
   counts and file ownership without printing `.env` or keys.
2. Resolve actual space membership/test identities and personal agent tokens.
   Reconcile through the owning Infra adapters when authorized; provision the
   one read-only content key and known-hosts file externally.
3. Run the existing backup and isolated restore helpers. Preserve previous
   Compose/image IDs. Use additive upgrade where compatible; any reset remains
   a separate explicit decision after successful restore verification.
4. Verify all r2 checksums; install only v2 using `deploy/release.sh --deploy`,
   `docker load` and `--pull never`. Require deployed commit `688d6b9`, readiness
   and the complete allowed/denied personal space matrix in the WP13 smoke tool.
5. Record real browser OIDC/PKCE, native edit/conflict, Git write rejection,
   versions/restore, diagrams, collaboration/revocation, MCP and optional SMTP.
6. Prove manifest import/history, unchanged-cycle idempotency and authorized
   content changes visible within one minute, with commits/counts/timestamps.
7. Measure the NFR budget on representative approved acceptance data: read/save
   API P95, browser rendering, DB commit timing/query plans and RSS. Do not reset
   or populate a business database for the benchmark's 10,000-page/50-worker gate.
8. Rehearse the previous binary against an isolated restored migrated database.
   Only then consider the separately approved proxy cutover window.

## Rollback, data and operational boundaries

Application rollback reinstalls previous Compose/image selections and executes
`docker compose up -d --pull never` in v2. The previous binary must actually pass
boot/login/read/write checks against an isolated copy of the migrated database
before this route receives PASS. Compatibility is currently unverified.

If compatibility fails, use the documented recovery path: stop only v2, restore
the verified backup into new database/attachment storage, check counts/digests,
switch v2 mounts and rerun acceptance. Keep previous storage. Post-backup writes
may be lost, so the exact recovery/data-loss window needs an incident owner
decision. Do not blindly downgrade or edit an applied Liquibase checksum.

Proxy rollback restores its captured previous upstream; proxy changes require
a specific approved window. Sent mail, external OAuth grants and immutable
acceptance history are not undone by image rollback. Keep these effects out of
early smoke until the actual configuration and scope are ready.

SSH authorization, memberships/tokens, the content key, real backup/migration
state, scale/compatibility measurements and cutover scheduling remain pending.
CI source is configured; Infra S2 Runner registration and the first real run are
pending. Local fixture PASS does not close these runtime gates.
