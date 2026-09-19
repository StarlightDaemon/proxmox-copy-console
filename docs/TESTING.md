# Testing

## Current evidence: 0.4.0-dev.2 (unreleased)

The source is an unreleased development snapshot and remains unaccepted on a live Proxmox installation. The documented 0.3.0 baseline is at commit `27a83d2ac836ef35c2f7e6644b6e448355631be0`. Source inspection, mock execution, real parser execution, and live clipboard/browser acceptance are separate evidence classes.

| Date | Surface | Environment | Evidence |
| --- | --- | --- | --- |
| 2026-09-18 | Original baseline review | Node 24.18.0 / Windows | Syntax and 22 ad hoc assertions reproduced baseline behavior and limitations; see the historical review |
| 2026-09-18 | Historical output fixtures | Exact 0.3.0 Git blob | Five buffer output fixtures checked against the baseline source; one records the intentional Unicode-whitespace difference |
| 2026-09-18 | Development integration | Node 24.18.0 / mocked DOM, ExtJS, manager, clipboard, timers | Regression suite exercises installed handlers, targeting, errors, lifecycle, clipboard status, and focus guards |
| 2026-09-18 | Actual xterm parser/buffer | Proxmox xterm 6.0.0 bundle, pinned revision in `tools/fetch-xterm.cjs`, Node without DOM renderer | Wrapping, wide glyphs, literal spaces, Unicode whitespace, emoji/combining text, scrollback, resize, alternate screen, and handler integration |
| 2026-09-18 | Diagnostic probe | Mocked Proxmox page | Confirms structural reporting without reading buffer rows or emitting transcript/identity strings |
| Pending | Live node Shell / LXC Console | Proxmox, browser, and userscript-manager versions to be recorded | No live execution or OS clipboard writes performed |
| 2026-09-18 | GitHub Actions | Fresh Ubuntu / Node 24, commit `68c0f50` | [Checks passed](https://github.com/StarlightDaemon/proxmox-copy-console/actions/runs/35424235814), including fresh fixture download and the full test suite |

The tests do not emulate Firefox compartments, browser same-origin enforcement, native ExtJS focus/layout, or extension clipboard permissions. The real xterm fixture executes its public parser and buffer API without `open()` or a renderer; it does not run Proxmox's websocket/termproxy code.

Earlier `0.4.0-dev.1` local run on 2026-09-18: **65 tests passed, zero failures/skips** (44 mocked integration cases, five baseline comparisons, one diagnostic case, 15 actual-parser cases). Its source was 15,956 bytes; SHA-256: `32597f0c5cdb370247f10c7c7cd0f1abf34608b46cf84748a5371050d003b93f`. This is historical evidence, not the current source hash.

Version `0.4.0-dev.2` final local run before publication on 2026-09-18: **82 tests passed, zero failures/skips** (44 integration cases, 16 compatibility cases, five baseline comparisons, two probe cases, 15 actual-parser cases). It adds modern clipboard, explicit Firefox sharing, page exposure, and runtime URL-guard coverage. The sharing tests check our adapter's contracts; they cannot reproduce Firefox's native compartment enforcement. Syntax/metadata/version/size checks and 33 local Markdown links passed, as did `git diff --check`. Current source: **17,327 bytes**, SHA-256 `3982b2afc13b10ad798434070ee6f4b3760771fdacc81591ed607101230239e8`. This is 1,371 bytes over dev.1 and remains below the 20 KiB budget. These checks ran on local Windows / Node 24.18.0. Live browser/clipboard acceptance remains pending; remote CI is recorded independently on each GitHub commit.

## Reproduce local checks

Use Node.js 24. There is no npm install or build step.

```sh
node tools/check.cjs
node --test --test-isolation=none tests/console.test.cjs tests/compatibility.test.cjs tests/baseline.test.cjs tests/probe.test.cjs
node tools/fetch-xterm.cjs
node --test --test-isolation=none tests/*.test.cjs
```

The first two commands are offline. The fixture downloader requires network access only when `.cache/xterm.cjs` is missing. The fixture is pinned by upstream commit and verified against its exact Git blob hash before execution. The full suite intentionally fails if the fixture is absent/corrupt rather than silently skipping parser coverage. Initial tests used bytes obtained through the GitHub connector and exercised the downloader's cached-integrity path. Publication preflight also fetched the pinned raw URL afresh and verified all 488,663 bytes with the same integrity checker.

`tools/check.cjs` validates JavaScript syntax, local Markdown links, userscript grants/version, matching manager-probe grants/injection metadata, absence of an implicit runtime dependency/update channel, and the 20 KiB runtime size budget. The test runner uses in-process isolation to work in environments that restrict spawning child processes. Mocks are fresh for each test.

To independently recheck historical fixture values, from a shell that preserves native command redirection bytes (including PowerShell 7.4+):

```sh
git show 27a83d2ac836ef35c2f7e6644b6e448355631be0:proxmox-copy-console.user.js > .cache/baseline-0.3.0.user.js
node tools/check-baseline.cjs .cache/baseline-0.3.0.user.js
```

The helper verifies the historical source blob before running the fixtures. The ordinary regression suite uses recorded expectations, so CI does not need the full Git history.

## Read-only live structure probe

Open an embedded node Shell or LXC Console, select the **top Proxmox page** in browser developer tools, inspect [probe-console.js](../tools/probe-console.js), then paste that script into the developer console. It prints a JSON report and returns it. Run it once for node Shell and once for LXC.

For the active supported console, expect `topPage`, `pageVisible`, and `proxmoxGlobal` to be true. Its anchor should have identity and an owner element, one toolbar anchor, and exactly one eligible frame. That frame should be same-origin, identity-matched, and have a readable buffer through the direct or wrapped path. `copyButtons` should be one with the development script enabled.

The probe does not read buffer rows, change focus, create controls, invoke clipboard APIs, or make network requests. It omits host names, guest IDs, full URLs, and transcripts. Devtools sees page globals, so this result alone cannot establish that the userscript manager exposes the same objects to its sandbox. Record the manager version from its own UI.

## Live acceptance plan (not yet run)

Use the current stable Proxmox/browser policy and the nine combinations in [Compatibility](COMPATIBILITY.md#live-test-priority-and-evidence). Run the separate temporary [manager probe](../tools/probe-manager.user.js) inside each userscript manager before the top-page structure probe; do not confuse page devtools with the manager sandbox. All combinations remain pending.

Use benign synthetic output, a scratch plain-text destination, and one enabled script version. Record script SHA-256 (`node tools/check.cjs`), Proxmox/pve-xtermjs package versions, browser/manager versions, language, date, and actual results. Use the pinned 0.3.0 source as a rollback point; no server file changes are needed.

| Step | Exercise | Expected result |
| --- | --- | --- |
| 1 | Confirm the manager's effective host restrictions; open node Shell then LXC Console | Exactly one native Copy button immediately after the correct control; no split button or layout shift |
| 2 | Generate more lines than the visible viewport, with interior blank lines | All retained output is copied in order; interior blanks remain; trailing empty viewport rows disappear |
| 3 | Include a long wrapped line with interior spaces, `abcd界` at a five-column edge, NBSP/em-space, emoji, and combining accents | No artificial wrapped newline or wide-wrap placeholder space; Unicode whitespace survives; compare actual strings |
| 4 | Resize narrower/wider after completed output and while the cursor is on the long line | Copied output matches the terminal's retained current-width representation; record any reflow-dependent loss rather than promising a session transcript |
| 5 | Enter/exit `top`, `nano`, or `less` using harmless content | Active alternate buffer is copied and identified in feedback; normal scrollback returns after exit |
| 6 | Navigate node/guest views, reconnect, and reload the iframe | Current terminal is resolved; unavailable controls disable; no duplicates or old-console copy |
| 7 | Exercise another UI language, hidden retained views, and any available multiple-console layout | Component discovery remains language-independent; unrelated/ambiguous frames do not get selected |
| 8 | Switch away from the browser tab and return | Discovery resumes promptly; no buffer extraction occurs during idle scans |
| 9 | Click repeatedly, move focus to another field/tab while copying, and navigate away | One pending write at a time; feedback resets after the latest result; no focus theft or stale UI updates |
| 10 | Paste each copy into a scratch text destination | Actual text matches expectations. A success icon alone is not clipboard-content evidence |
| 11 | Exercise a denied/failed clipboard operation where the manager permits it | Useful failure or uncertainty feedback; no automatic retry. Void-returning managers report unconfirmed dispatch |
| 12 | Exercise empty/disposed consoles and toolbar recreation | Empty/unavailable/extraction feedback is appropriate; clipboard remains unchanged when extraction cannot produce text |

For repeatable output, choose benign text with a known expected string and terminal width. Do not paste untrusted commands to generate fixtures. For advanced edge cases, the real-parser test file contains the exact synthetic strings and escape sequences used locally.

A clipboard timeout cannot cancel a manager operation. If encountered, inspect clipboard contents before retrying and record whether a late write occurred. The prototype intentionally leaves broad manager support unclaimed until actual combinations are tested.

## Evidence record template

| Field | Value |
| --- | --- |
| Date and tester | Pending |
| Source version / SHA-256 | Pending |
| Proxmox / pve-xtermjs | Pending |
| Browser / userscript manager | Pending |
| Manager sandbox probe / effective host rules | Pending |
| UI language / node or LXC | Pending |
| Structure probe summary | Pending |
| Scenario / expected / actual clipboard text | Pending; use synthetic data only |
| Focus, layout, completion behavior | Pending |
| Result / limitations | Pending |

## Release gate

Before labeling 0.4.0 accepted for general release, pass local checks and all four primary browser/manager rows in [Compatibility](COMPATIBILITY.md#live-test-priority-and-evidence): Firefox and Chrome, each with Tampermonkey and Violentmonkey. Each combination must cover node Shell, LXC, text fidelity, alternate screens, navigation, focus, and clipboard completion semantics. Record exact observed compatibility, including limitations; extended managers may remain explicitly unverified. CI, mocks, and downloaded source are not manual Proxmox acceptance.
