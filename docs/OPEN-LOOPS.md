# Open loops and agent handoff

Updated 2026-09-18. This is the follow-up register; [Decisions](../DECISIONS.md) governs scope, [Testing](TESTING.md) governs evidence, and [Compatibility](COMPATIBILITY.md) defines the browser/manager matrix. An entry is not permission to expand the product or publish changes.

## Starting point

Implementation checkpoint: [`68c0f50`](https://github.com/StarlightDaemon/proxmox-copy-console/commit/68c0f502df0d12b04b4c9a3ace780ac54fd22e8e), unreleased `0.4.0-dev.2`. All 82 local tests passed and [GitHub Actions passed](https://github.com/StarlightDaemon/proxmox-copy-console/actions/runs/35424235814). The script is 17,327 bytes, dependency-free, and directly installable. No live Proxmox/browser/manager acceptance has been recorded. These results belong to that checkpoint; verify the actual checkout before continuing.

The original R1-R7 implementation work is complete pending live validation: console ownership/localization, error containment, text fidelity, clipboard status, feedback lifecycle, and idle-scan improvements. Scope feedback, conservative focus return, unavailable-button state, repository conventions, probes, and CI are also implemented. Do not recreate them from the historical review's proposal list.

## Follow-up register

All items are initially unassigned. Claim one ID with an agent/task reference and starting commit before editing. Keep status and evidence with that ID; mark it done only when its completion criterion is met. Conditional items and ideas are not queued implementation work. Record failures and unavailable environments honestly.

| ID | Priority / state | Follow-up and completion criterion |
| --- | --- | --- |
| OL-01 | Next / ready | Independent, bounded review of `pageOptions`, `writeClipboard`, and their callback/lifecycle interaction in the userscript. Inspect the existing compatibility tests. Return a reproducible finding and minimal fix if justified, or a concise no-change report identifying remaining browser-only uncertainty. Use the handoff below. This is an additional review, not a known defect. |
| OL-02 | Required / needs environment | Firefox-first live acceptance on the maintainer's Proxmox host. Obtain the actual installed manager/browser and `pve-manager`/`pve-xtermjs` versions. Run both probes and every applicable Testing scenario on node Shell and LXC. Record synthetic pasted output, native layout, focus, navigation/reconnect, hidden-page return, localized controls, and clipboard failure/timeout behavior. Complete both primary Firefox manager rows before closing. No credentials or access are supplied by this document. |
| OL-03 | Required / needs environment | Chrome compatibility after initial Firefox validation. Complete both primary Chrome manager rows using the same source and acceptance sequence. Record real clipboard contents and exact versions. Firefox results cannot substitute for Chrome results. |
| OL-04 | Extended / needs environment | Evaluate Greasemonkey, FireMonkey, ScriptCat, and OrangeMonkey in the remaining matrix rows. Record each result separately. Add an adapter or generated metadata variant only for a demonstrated incompatibility with a regression case; otherwise keep the shared script. Generic injectors and Safari remain outside the implementation plan. |
| OL-05 | Validation / needs package evidence | Compare the installed console package/API with the pinned xterm fixture. Record package versions during OL-02; investigate observed extraction/reflow differences with benign strings. Refresh or add a pinned fixture only when the installed package warrants it. Close with the comparison and any relevant regression evidence; do not silently fetch a floating latest bundle. |
| OL-06 | Conditional / needs measurements | Profile idle discovery and copy latency if daily use shows a cost or performance claims are proposed. Include hidden/visible tabs and representative retained-buffer sizes. Keep the 500 ms interval unless measurements justify a change. No permanent terminal cache, output observer, or asynchronous extraction without evidence. A measured no-change conclusion is valid. |
| OL-07 | Conditional / needs workflow evidence | Reconsider installation defaults only if trusted-host setup proves confusing. The broad include is disclosed and runtime protocol/port checks exist. Verify effective manager rules during acceptance; consider requiring explicit host configuration only with an agreed usability rationale. Do not broaden ports or add a settings system speculatively. |
| OL-08 | Idea / not planned | Optional explicit viewport-only copy. Revisit only for a demonstrated recurring need. Before coding, define scrolled-viewport semantics, wrapped-edge clipping, accessible activation, and code/UI cost against the simplicity policy. No hidden modifier-only gesture or additional copy modes by default. |
| OL-09 | Required / awaiting OL-02 and OL-03 | Prepare a release-readiness review: resolve blockers, verify all four primary browser/manager rows, reconcile evidence and support claims, and rerun appropriate checks. Extended rows may remain explicitly unverified. This item prepares a decision; tagging, releasing, merging, and publication remain separate authority boundaries under AGENTS.md. |

## Copy-ready first assignment: OL-01

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
