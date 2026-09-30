# Pack runtime implementation contract

The first runtime change implements BL-A/T01–T07 and supplies the source/format used
by T08–T14. It builds on Studio commit 06a6a8c; existing Java packages remain stable.

- Pack files are untrusted, data-only archives. Validate bounded ZIP contents, canonical
  relative paths, hashes, version requirements, manifest/schema and ontology references.
  Never extract uploaded entries onto the filesystem or load executable classes/scripts.
- The registry is platform-wide for this version, as specified in T02. No tenant override
  is read. Management requires authenticated API access and the configured admin secret
  until verified gateway role propagation replaces that mechanism. Raw role headers do
  not grant management permission. Reject missing/default admin secrets.
- Install is immutable and checksum-idempotent. Activate/rollback serialize through the
  database generation row; asset-key/domain collisions across packs are rejected.
  State change, generation and audit-outbox insertion commit together.
- Reuse Spring JDBC and its shared transaction manager for the small registry rather
  than introducing duplicate JPA/JDBC models. PostgreSQL BIGSERIAL follows the baseline.
  The resolver reads a generation-consistent asset snapshot; publication is atomic.
- SemanticPackService consumes the resolver without changing semantic parsing. Legacy
  classpath fallback is explicitly configurable and remains transitional. A registry
  failure must not silently fall back; removal of an asset must not retain stale data.
- CLI and HTTP upload use one validator. The versioned protocol lives in studio/protocol
  and is packaged as a Maven resource, without maintaining a second schema copy.
- Validation includes real PostgreSQL state, concurrency, rollback, bad archives,
  authorization, generation refresh and the existing backend regression.

Broader product acceptance and the Stack data execution adapter remain separate from
Pack installation. This design does not grant Packs data-access privileges.

## Transitional choices verified on 2026-09-29

- The packaged engine remains 1.0.0-SNAPSHOT during the import; the new source Pack requires
  `>=1.0.0`. This is a new `dts.pack/v1` archive, not a renamed old PRS RPC/UI manifest.
- The explicit switch is `dts.studio.pack.fallback-classpath`, default true as planned for
  migration. It is tested false in the real runtime lane, and never masks registry failures
  or supplies removed assets once generation is positive.
- Historical six-file semantic loading resulted in five domains. The source Pack omits
  the shadowed field-operations definition and preserves the effective flowerbiz definition.
- Template migration uses exact content fingerprints instead of claiming every old row by
  code alone. This preserves edited/manual rows and rejects ownership collisions at activation.
- The single validator library addition is networknt 1.5.6 (Apache 2.0); Jackson YAML uses
  the existing Boot-pinned 2.18.3 family. Both run locally without schema network resolution.
