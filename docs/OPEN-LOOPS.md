# Open loops and agent handoff

Updated 2026-09-19. This is the follow-up register; [Decisions](../DECISIONS.md) governs scope, [Testing](TESTING.md) governs evidence, and [Compatibility](COMPATIBILITY.md) defines the browser/manager matrix. An entry is not permission to expand the product or publish changes.

## Starting point

Historical implementation checkpoint: [`68c0f50`](https://github.com/StarlightDaemon/proxmox-copy-console/commit/68c0f502df0d12b04b4c9a3ace780ac54fd22e8e), unreleased `0.4.0-dev.2`. All 82 local tests passed and [GitHub Actions passed](https://github.com/StarlightDaemon/proxmox-copy-console/actions/runs/35424235814). That script was 17,327 bytes, dependency-free, and directly installable. No live acceptance had been recorded at that checkpoint. Subsequently the maintainer reported successful node/LXC copy-paste and requested promotion to 0.4.0 with unchanged runtime; see [Testing](TESTING.md#maintainer-live-acceptance--2026-09-18). Verify the actual checkout and remaining qualification work before continuing.

The original R1-R7 implementation work is complete pending live validation: console ownership/localization, error containment, text fidelity, clipboard status, feedback lifecycle, and idle-scan improvements. Scope feedback, conservative focus return, unavailable-button state, repository conventions, probes, and CI are also implemented. Do not recreate them from the historical review's proposal list.

## Follow-up register

Items are unassigned unless an owner is recorded below. Claim one ID with an agent/task reference and starting commit before editing. Keep status and evidence with that ID; mark it done only when its completion criterion is met. Conditional items and ideas are not queued implementation work. Record failures and unavailable environments honestly.

| ID | Priority / state | Follow-up and completion criterion |
| --- | --- | --- |
| OL-01 | Done / reviewed 2026-09-18 | Agent `ol01_review` completed the scoped review from `c9219895b259c91f934dcdc350f4a08db66ebae9`; originating reviewer accepted the no-runtime-change result after independent code inspection and rerunning all 82 tests. See closure evidence below. Live acceptance rows remain open. |
| OL-02 | Partial / Firefox + Violentmonkey workflow passed | Maintainer reports successful dev.2 copying across several nodes and LXC consoles with correct current-console targeting and expected pasted detail. Screenshots confirm Firefox 156.0 (64-bit), Violentmonkey 2.49.0, and Proxmox VE 9.2.3. Obtain `pve-xtermjs` version and finish the remaining Firefox matrix/scenario evidence in Testing. This supports 0.4.0 promotion but does not close full Firefox qualification. |
| OL-03 | Deferred / maintainer preference 2026-09-19 | Chrome compatibility remains a target, but the maintainer wants the current practical test round limited to Firefox managers. Resume when requested; complete both primary Chrome rows using the same source and acceptance sequence, with real clipboard contents and exact versions. Firefox results cannot substitute for Chrome results. |
| OL-04 | Extended / Firefox testing next | After Firefox + Tampermonkey, evaluate Firefox + Greasemonkey, FireMonkey, and ScriptCat using the short workflow checklist in Compatibility. Record each result separately. Chrome/OrangeMonkey checks are deferred for this round. Add an adapter or generated metadata variant only for a demonstrated incompatibility with a regression case; otherwise keep the shared script. Generic injectors and Safari remain outside the implementation plan. |
| OL-05 | Validation / needs package evidence | Compare the installed console package/API with the pinned xterm fixture. Record package versions during OL-02; investigate observed extraction/reflow differences with benign strings. Refresh or add a pinned fixture only when the installed package warrants it. Close with the comparison and any relevant regression evidence; do not silently fetch a floating latest bundle. |
| OL-06 | Conditional / needs measurements | Profile idle discovery and copy latency if daily use shows a cost or performance claims are proposed. Include hidden/visible tabs and representative retained-buffer sizes. Keep the 500 ms interval unless measurements justify a change. No permanent terminal cache, output observer, or asynchronous extraction without evidence. A measured no-change conclusion is valid. |
| OL-07 | Conditional / needs workflow evidence | Reconsider installation defaults only if trusted-host setup proves confusing. The broad include is disclosed and runtime protocol/port checks exist. Verify effective manager rules during acceptance; consider requiring explicit host configuration only with an agreed usability rationale. Do not broaden ports or add a settings system speculatively. |
| OL-08 | Idea / not planned | Optional explicit viewport-only copy. Revisit only for a demonstrated recurring need. Before coding, define scrolled-viewport semantics, wrapped-edge clipping, accessible activation, and code/UI cost against the simplicity policy. No hidden modifier-only gesture or additional copy modes by default. |
| OL-09 | Done / 0.4.0 readiness reviewed | Maintainer approved source promotion after the live Firefox/node/LXC report. Runtime body is identical to tested dev.2; all 82 tests and metadata/documentation checks passed. The tested combination is Firefox 156.0 (64-bit), Violentmonkey 2.49.0, and Proxmox VE 9.2.3. Broader qualification remains in OL-02/OL-03. Source is promoted on main; tag/release publication awaits explicit authorization after automatic approval review rejected that separate operation. |

## OL-01 closure evidence

- Delegate: `ol01_review`, using `gpt-5.6-terra`, in isolated branch `codex/ol-01-review` at `c9219895b259c91f934dcdc350f4a08db66ebae9`. No files changed in that checkout; no delegate commit or remote operation.
- Scope: `pageOptions`, `writeClipboard`, Copy/feedback/destruction/focus interactions, and existing compatibility/console tests. No reproducible defect identified within this scope. Existing tests exercise callback/promise/void results, failures, timeout/late completion, no retry, cloned callback returns, teardown, and focus guards. This is a bounded code review, not a security certification.
- Delegate validation: `node tools/check.cjs`; focused compatibility and console tests (60 passed); `node tools/fetch-xterm.cjs` (cached pinned fixture verified); `node --test --test-isolation=none tests/*.test.cjs` (82 passed); `git diff --check` (passed).
- Originating reviewer: independently inspected the adapter, operation/lifecycle code, relevant tests, and clean delegate diff; reran syntax/metadata/size checks and the full suite (82 passed, zero failures/skips). Accepted the no-change conclusion. Source remains 17,327 bytes with the dev.2 SHA-256 recorded in Testing.
- Residual evidence belongs to OL-02/OL-03: native Firefox compartment enforcement, extension callback delivery and teardown timing, and actual OS clipboard contents. No live compatibility row was advanced by this review.

## Handoff used for OL-01 (completed; reference)

A lighter coding model is suitable for this narrow code/test review. Bring any uncertain Firefox compartment or clipboard-contract conclusion back for review here. Do not give an agent the whole register as an instruction to implement everything.

```text
Work on StarlightDaemon/proxmox-copy-console, open loop OL-01.

Verify repository, branch, HEAD, and worktree state. Read AGENTS.md,
DECISIONS.md, docs/OPEN-LOOPS.md, and the relevant sections of DESIGN,
TESTING, and COMPATIBILITY. Start from the current main in an isolated
checkout/branch named with the codex/ prefix; record the exact starting
commit. Checkpoint 68c0f502df0d12b04b4c9a3ace780ac54fd22e8e is context,
not an instruction to reset or discard newer work.

Review only pageOptions, writeClipboard, and their callback/lifecycle
interaction in proxmox-copy-console.user.js. Read tests/compatibility.test.cjs,
tests/console.test.cjs, and tests/helpers.cjs. Look for concrete failure,
late-completion, or cross-compartment boundary errors, not style changes.
Add a regression only for a meaningful uncovered behavior or reproducible
bug. If a bug is established, make the smallest fix and preserve existing
behavior. A no-change report is a successful outcome when justified.

Keep one native Copy button and one dependency-free userscript, below the
existing size ceiling. No speculative API fallbacks, clipboard reads,
automatic retries, new permissions, manager forks, features, or frameworks.
Do not claim that mocks prove Firefox compartment or OS clipboard behavior.
If documentation is needed for a contract claim, use primary sources and
record the source. Do not access live homelab systems without supplied access
and authorization. If the decision needs live evidence, report the exact
missing observation instead of guessing or weakening the implementation.

Run node tools/check.cjs and the relevant Node tests. If runtime code changes,
run node tools/fetch-xterm.cjs, then
node --test --test-isolation=none tests/*.test.cjs and git diff --check.
The full suite requires the pinned fixture; missing network/cache is a
reported limitation, not a passed or silently skipped check. Follow the
documented unreleased-version and evidence conventions if code changes.

Return: starting/ending commit or working-diff status; findings with exact
file/line references and a reproduction; changed files and rationale;
commands actually run and results; source size/hash; limitations and the
OL-01 status recommendation. Make the patch available in the agreed checkout
or as a patch artifact for review in the originating task. Do not push, merge,
tag, release, or modify shared main under this handoff. Commit/PR authority,
if needed for transport, must be supplied by the dispatching task.
```

## Review and continuation

The originating reviewer checks the reproduction and diff, reruns affected checks, and accepts, revises, or rejects the patch. Update the loop's evidence and status after review. Keep implementation, mock execution, actual-parser execution, GitHub CI, and live acceptance distinct. OL-01 does not close any browser acceptance row. The next environment-dependent assignment is OL-02, with the existing Testing evidence template; never include homelab credentials or real terminal transcripts in a handoff.
