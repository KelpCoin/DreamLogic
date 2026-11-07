# GitHub Actions emergency cost shield

Owner's KelpCoin account has exhausted the 2,000 included Actions minutes for its billing period (alert at 2,001, reset 2026-12-01). On 2026-11-08 the 7 active YAML workflow files in KelpCoin/DreamLogic were preserved under `.github/workflows-paused/` with their original blob SHAs and removed from `.github/workflows/`. See `ops/cost-shield/actions-cost-shield-manifest.json`.

This is a **reversible account-cost containment change**, not a passing CI result. Scheduled automation, on-push and PR GitHub CI, and workflow-based deployments in this repository are paused; other hosting providers and existing deployments are not touched or verified. Do not claim autonomous progress or production release on the strength of this change.

Restoration requires review, explicit owner approval, GitHub Actions US$0 overage blocking budget confirmation, and a **selective** low-cadence CI plan. Restore individual source files from the paused directory to the active directory. Never restore all schedules blindly.

For local tests use the existing source-level unit tests, with proof outputs to D: first, and never substitute absent CI for required security and release authorization. The primary DreamLedger repo includes a local Gauntlet cost shield verifier.

**Billing cap is not set by this commit.** Owner must set/check the Actions spending budget at https://github.com/settings/billing/budgets .
