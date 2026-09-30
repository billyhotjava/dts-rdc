# Resource-to-asset mapping

Date: 2026-09-29. Asset keys retain the full legacy resource name. Runtime lookup is centralized in `PackResourceReader.kind`.

| Resource / key | Kind | Pack path |
|---|---|---|
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

`field-operations.json` is excluded from the runtime archive: it declares `flowerbiz` and was overwritten by the later `flowerbiz.json` in the old loader. Five domains preserve the effective six-file baseline.

## Reader evidence

| Reader | Source expression |
|---|---|
| `BusinessDirectResponseCatalogService:40` | `try (InputStream is = openPackResource(RESOURCE_PATH)) {` |
| `CaliberCrossSourceRegressionService:36` | `try (InputStream is = openPackResource(DEFAULT_SPEC_RESOURCE)) {` |
| `CaliberGuardrailSyncService:122` | `JsonNode rules = semanticPackService.getDocument(domain).path("generatedGuardrails").path("rules");` |
| `CaliberRuleRegistry:62` | `try (InputStream is = openPackResource(RULE_RESOURCE)) {` |
| `FinanceAmountColumnAlignmentRegistry:37` | `try (InputStream is = openPackResource(REGISTRY_RESOURCE)) {` |
| `FinanceAnswerAuditTrailRegistry:39` | `try (InputStream is = openPackResource(REGISTRY_RESOURCE)) {` |
| `FinanceApplicationMysqlAuthorityRegistry:49` | `InputStream is = openPackResource(resource);` |
| `FinanceApplicationMysqlAuthorityRegistry:52` | `is = openPackResource(resource);` |
| `FinanceAuthorityRegistry:40` | `InputStream is = openPackResource(resource);` |
| `FinanceAuthorityRegistry:43` | `is = openPackResource(resource);` |
| `FinanceDetailReconciliationSampleRegistry:42` | `try (InputStream is = openPackResource(REGISTRY_RESOURCE)) {` |
| `FinanceDifferentialGridRegistry:42` | `try (InputStream is = openPackResource(REGISTRY_RESOURCE)) {` |
| `FinanceInvariantRegistry:40` | `try (InputStream is = openPackResource(INVARIANT_RESOURCE)) {` |
| `FinanceInvariantRegressionService:44` | `try (InputStream is = openPackResource(REGRESSION_GRID_RESOURCE)) {` |
| `FinanceReconciliationScorecardRegistry:38` | `try (InputStream is = openPackResource(REGISTRY_RESOURCE)) {` |
| `FinanceSignoffBaselineRegistry:37` | `try (InputStream is = openPackResource(REGISTRY_RESOURCE)) {` |
| `FinanceSummaryDualReconciliationRegistry:42` | `try (InputStream is = openPackResource(REGISTRY_RESOURCE)) {` |
| `FinanceVoucherSubjectTieoutRegistry:42` | `try (InputStream is = openPackResource(REGISTRY_RESOURCE)) {` |
| `FinanceWeakPathReconciliationCandidateRegistry:37` | `try (InputStream is = openPackResource(REGISTRY_RESOURCE)) {` |
| `Nl2SqlAccuracyGoldenSetRegistry:38` | `try (InputStream is = openPackResource(REGISTRY_RESOURCE)) {` |
| `Nl2SqlService:204` | `try (InputStream is = openPackResource("/prompts/settlement-few-shots.txt")) {` |
| `SemanticPackService:66` | `try (InputStream stream = openPackResource(file)) {` |
| `VoucherLedgerTieoutRegistry:40` | `try (InputStream is = openPackResource(REGISTRY_RESOURCE)) {` |
