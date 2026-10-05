# Studio Pack runtime — implementation checkpoint

Date: 2026-09-29. Branch: `feature/studio/engine-import`, based on Studio `06a6a8c`.
This checkpoint implements the independently executable BL-A runtime slice. The complete
Studio product refactor is not declared done; cross-Feature items remain listed below.

## Code delivered

- One shared offline validator for HTTP installation and `pack-cli`, using the versioned
  schemas in `dts-studio/protocol`. ZIP/resource/checksum/version/reference limits are enforced.
- PostgreSQL Pack/version/asset/generation tables and durable audit outbox. Install is
  immutable and checksum-idempotent. Activation/rollback, template projection and audit
  commit together; concurrent activations produce one active version.
- Pack administration requires authenticated API key plus a configured non-default admin
  secret. Forged role/user headers do not authorize it. This is the documented interim
  contract, not completed gateway role/tenant propagation.
- `PackAssetResolver` uses repeatable-read snapshots and a ten-second refresh interval.
  Cached semantic/governance readers rebuild on generation changes and fail closed on
  loading errors. All historical direct resource reads now pass through the shared reader;
  schema loading is the separate offline protocol-resource use.
- PRS owns `pack/studio/`: 30 assets including five effective domains, 19 governance/evaluation
  documents, four prompts, one response catalog and 57 final query templates. The original
  RPC/UI `pack-manifest.json` is preserved as a separate, explicitly incompatible contract.
- The template exporter replays 19 original changesets in order. Migration 002 recognizes
  untouched historical seeds by content fingerprint and preserves edited/manual rows.
  Pack activation and rollback update only owned templates; template caches track generation.
- Added the PRS build wrapper, Studio CI workflow, runtime guide, tests and mapping evidence.
  CI definition is source code only; a remote CI execution or artifact publication is not claimed.

See [resource mapping](resource-to-asset-map.md),
[design decisions](../design/01-pack-runtime.md), and
[machine-readable verification](pack-runtime-verification-20260929.json).

## Findings resolved during implementation

1. The six old semantic files represented five domains. `field-operations.json` was
   overwritten by `flowerbiz.json` under the same domain key. The Pack carries the
   historically effective definition and rejects duplicate domains, instead of inventing
   a sixth domain or changing routing silently.
2. PostgreSQL cannot infer the type of nullable standalone parameters in `? IS NULL`.
   Optional registry filters now use explicit text casts.
3. Returning an empty governance registry after parse/load failure could bypass rules.
   Managed reads now reject the operation; negative tests assert the error and diagnostic.
4. The template transfer must preserve later changesets and manual edits. Ordered replay,
   content fingerprints and conditional upsert cover these cases. An audit failure rolls
   back template content together with activation status and generation.
5. Action schema now uses the planned `target.serviceRef` contract and requires HITL plus
   a role for high-risk actions. This validates a contract; generic action execution is T12.

## Verification

All builds/tests ran in `/data/dts-studio`, synchronized from the source feature branch.
No business environment file, business database, production service or original Copilot
source was modified.

- Full reactor: **657 tests**, zero failures/errors/skips; AI 514 and Analytics 143.
- Follow-up: **18 archive/action schema tests** and **1 full-runtime test** passed. One
  action-schema test was new after the reactor, so current backend reports cover 658
  distinct unit/integration tests; repeated runs are not added to that count.
- Full-runtime test starts the actual Spring Boot application with isolated pgvector PG17,
  complete Liquibase migrations and the real JPA transaction manager. It tests the HTTP
  filter chain, unauthorized access, multipart upload, checksum-idempotent retry, activation,
  audit persistence and registry refresh with classpath fallback disabled.
- All five effective semantic models equal the historical baseline. **106 template sample
  questions** retain the same selected template and resolved SQL after activation.
  This is template/contract equivalence, not a live LLM or business-data accuracy claim.
- CLI strict validation: 30 assets, zero warnings. Archive build and PRS wrapper both pass.
- Isolated migration tests cover two-instance refresh, competing activation, rollback,
  audit failure, template ownership, edited seeds, schema rollback and reapplication.
- `git diff --check` passes. GitNexus's old Copilot index was incomplete and Studio was
  unindexed; no graph result was treated as complete impact evidence. Current source,
  typed-reader comparisons, PostgreSQL tests and full regression supplied the proof.

Raw logs are under `/data/dts-studio-migration-20260929/`; the verification JSON records
specific log paths and archive checksum. Test PostgreSQL containers are disposable.

## Remaining work — do not collapse into DONE

- T01/T08/T20: ADR-012 acceptance and final legacy RPC/UI protocol convergence.
- T04: persist structured Pack provenance in chat/SSE contracts and expose it in Console.
- T06/T14: a fresh release profile that omits historical domain seeds, and eventual removal
  of transitional classpath/domain resources. Existing Liquibase checksums are preserved.
- T11: garden tools require BL-S/T08's governed QueryGateway. They were not replaced with
  an ungoverned JDBC execution path.
- T12: generic service-bound actions, verified initiator identity and durable action audit.
- T13: remote PRS CI validator distribution and versioned artifact publication.
- T15–T19/T21/T22: DAP/schema/skills consumers, cross-repo docs and Wiki/RAG follow-up.
- BL-S/BL-D/BL-C/BL-E: identity/data policy, domain-code separation, Console/BFF and real
  PRS joint acceptance remain their original Features.
- F1 image/chart delivery, source freeze, branch/main promotion and runtime golden baseline
  remain tracked by F1/F0/F7. This checkpoint does not authorize production deployment.

Task statuses are IN_PROGRESS wherever these acceptance/dependency items remain. The
backlog total is 11 IN_PROGRESS and 11 DRAFT; no whole-Feature completion is asserted.

## Subsequent action-service slice

The source Pack is now **prs-flower 0.1.1 / 31 assets**. The original 0.1.0 archive above
remains immutable evidence. The new revision extracts the existing action into a standalone
asset and changes its service identity to a deployment-bound reference. Its object, parameters,
permission, draft/commit paths and human-confirmation behavior are preserved.

The action client/executor no longer hardcode a legacy service. Local HTTP tests cover
actor/correlation headers, bound destinations, redirects, encoded path escapes, oversized
responses, missing identity and unknown outcomes. Real Pack HTTP/JPA integration passed again,
and all 106 template questions remain equivalent. Semantic comparison accounts explicitly
for the intended service-reference change. Other Finance/planner legacy references remain BL-D.

The latest task count is **12 IN_PROGRESS / 10 DRAFT**. T12 remains IN_PROGRESS for verified
identity, action audit delivery and downstream business acceptance. This supersedes only the
source-asset version and current count, not the earlier immutable test/archive evidence.

Final action verification: clean AI regression **516 tests** passed; the unaffected Analytics
regression remains **143 tests** (659 distinct backend tests in total). The real 0.1.1 Pack
runtime test and final six action HTTP/approval tests also passed. Outbound identity names
follow the ADR-008 candidate contract; its trust chain is not declared accepted or deployed.
Source and build trees match across 1,904 files; the verification JSON records the digest.

A targeted read of the existing Stack candidate found that
`source/dts-platform/.../internal/AnalysisDatasetContractResource` restricts runtime contracts
to `service:dts-analytics`. This is not a Studio query grant. ADR-009's Studio adapter and
ADR-008's verified identity contract must be aligned with Stack before T11 can use it;
no Analytics service impersonation or direct business JDBC fallback was introduced.
