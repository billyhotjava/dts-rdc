# Resource-to-asset mapping

Date: 2026-09-29. Asset keys retain the full legacy resource name. Runtime lookup is centralized in `PackResourceReader.kind`.

| Resource / key | Kind | Pack path |
|---|---|---|
| `semantic-packs/field-operations.json` | `ontology` | `dts-app-stack/prs-stack/pack/studio/semantic-packs/field-operations.json` |
| `semantic-packs/finance.json` | `ontology` | `dts-app-stack/prs-stack/pack/studio/semantic-packs/finance.json` |
| `semantic-packs/flowerbiz.json` | `ontology` | `dts-app-stack/prs-stack/pack/studio/semantic-packs/flowerbiz.json` |
| `semantic-packs/procurement.json` | `ontology` | `dts-app-stack/prs-stack/pack/studio/semantic-packs/procurement.json` |
| `semantic-packs/project-fulfillment.json` | `ontology` | `dts-app-stack/prs-stack/pack/studio/semantic-packs/project-fulfillment.json` |
| `semantic-packs/warehouse.json` | `ontology` | `dts-app-stack/prs-stack/pack/studio/semantic-packs/warehouse.json` |
| `governance/caliber-cross-source-regression.v1.json` | `evaluations` | `dts-app-stack/prs-stack/pack/studio/governance/caliber-cross-source-regression.v1.json` |
| `governance/caliber-rules.v1.json` | `guardrails` | `dts-app-stack/prs-stack/pack/studio/governance/caliber-rules.v1.json` |
| `governance/finance-amount-column-alignment.v1.json` | `quality_rules` | `dts-app-stack/prs-stack/pack/studio/governance/finance-amount-column-alignment.v1.json` |
| `governance/finance-answer-audit-trail.v1.json` | `quality_rules` | `dts-app-stack/prs-stack/pack/studio/governance/finance-answer-audit-trail.v1.json` |
| `governance/finance-application-mysql-authority-sql.v1.json` | `quality_rules` | `dts-app-stack/prs-stack/pack/studio/governance/finance-application-mysql-authority-sql.v1.json` |
| `governance/finance-application-mysql-oracle-sql.v1.json` | `quality_rules` | `dts-app-stack/prs-stack/pack/studio/governance/finance-application-mysql-oracle-sql.v1.json` |
| `governance/finance-authority-registry.v1.json` | `quality_rules` | `dts-app-stack/prs-stack/pack/studio/governance/finance-authority-registry.v1.json` |
| `governance/finance-detail-reconciliation-samples.v1.json` | `evaluations` | `dts-app-stack/prs-stack/pack/studio/governance/finance-detail-reconciliation-samples.v1.json` |
| `governance/finance-differential-grid-cases.v1.json` | `evaluations` | `dts-app-stack/prs-stack/pack/studio/governance/finance-differential-grid-cases.v1.json` |
| `governance/finance-invariant-regression-grid.v1.json` | `evaluations` | `dts-app-stack/prs-stack/pack/studio/governance/finance-invariant-regression-grid.v1.json` |
| `governance/finance-invariants.v1.json` | `quality_rules` | `dts-app-stack/prs-stack/pack/studio/governance/finance-invariants.v1.json` |
| `governance/finance-oracle-registry.v1.json` | `quality_rules` | `dts-app-stack/prs-stack/pack/studio/governance/finance-oracle-registry.v1.json` |
| `governance/finance-reconciliation-scorecard.v1.json` | `quality_rules` | `dts-app-stack/prs-stack/pack/studio/governance/finance-reconciliation-scorecard.v1.json` |
| `governance/finance-signoff-baseline.v1.json` | `quality_rules` | `dts-app-stack/prs-stack/pack/studio/governance/finance-signoff-baseline.v1.json` |
| `governance/finance-summary-dual-reconciliation-cases.v1.json` | `evaluations` | `dts-app-stack/prs-stack/pack/studio/governance/finance-summary-dual-reconciliation-cases.v1.json` |
| `governance/finance-voucher-subject-tieout.v1.json` | `quality_rules` | `dts-app-stack/prs-stack/pack/studio/governance/finance-voucher-subject-tieout.v1.json` |
| `governance/finance-weak-path-reconciliation-candidates.v1.json` | `quality_rules` | `dts-app-stack/prs-stack/pack/studio/governance/finance-weak-path-reconciliation-candidates.v1.json` |
| `governance/nl2sql-accuracy-golden-set.v1.json` | `evaluations` | `dts-app-stack/prs-stack/pack/studio/governance/nl2sql-accuracy-golden-set.v1.json` |
| `governance/voucher-ledger-tieout-mapping.v1.json` | `quality_rules` | `dts-app-stack/prs-stack/pack/studio/governance/voucher-ledger-tieout-mapping.v1.json` |
| `planner/business-direct-responses.json` | `persona` | `dts-app-stack/prs-stack/pack/studio/planner/business-direct-responses.json` |
| `prompts/flowerbiz-constraints.txt` | `prompts` | `dts-app-stack/prs-stack/pack/studio/prompts/flowerbiz-constraints.txt` |
| `prompts/flowerbiz-few-shots.txt` | `prompts` | `dts-app-stack/prs-stack/pack/studio/prompts/flowerbiz-few-shots.txt` |
| `prompts/settlement-constraints.txt` | `prompts` | `dts-app-stack/prs-stack/pack/studio/prompts/settlement-constraints.txt` |
| `prompts/settlement-few-shots.txt` | `prompts` | `dts-app-stack/prs-stack/pack/studio/prompts/settlement-few-shots.txt` |

The legacy RPC/UI manifest remains `pack/pack-manifest.json`; it is not a `dts.pack/v1` archive.
