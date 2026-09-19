# Testing

## Candidate: 0.4.1-dev.1

Branch `codex/firemonkey-compat` starts at `0413765bcf1cd0aa09db4e60667bf9e034071ce6`. The candidate uses local discovery loops and separate function exports to address the live FireMonkey failures recorded below. Stable 0.4.0 remains on main. This candidate has not yet passed live testing.

Local verification on 2026-09-19: `node tools/check.cjs`, `node tools/fetch-xterm.cjs` (cached pinned fixture verified), `node --test --test-isolation=none tests/*.test.cjs` (**88 passed, zero failures/skips**), and `git diff --check` passed. The three new compatibility regressions cover rejected page-array callbacks, explicit function exports with no privileged return values, and contained export failure. Candidate source is **18,224 bytes**, SHA-256 `d170fb0e7156ede5120ece560404891d9fb3180eba57e7600b1d6d708457b6ff`. Mocks check our contracts, not native Firefox compartments or real clipboard behavior.

Next live check: disable the temporary probe, replace the original script in FireMonkey with the candidate, retain trusted-host restrictions, and reload. Check one Copy button and actual pasted text on node Shell and LXC Console, then navigation and repeated copying. Recheck Firefox + Violentmonkey before promotion, with only one manager enabled at a time. Test Tampermonkey as a regression check, then the planned Chrome combinations. Chromium derivatives remain expected-compatible but unverified, without a routine broad test matrix.

[GitHub Actions passed for candidate commit 6d803b0](https://github.com/StarlightDaemon/proxmox-copy-console/actions/runs/35427181257). This is automated validation, not live acceptance.

### Follow-up requiring an isolated run

After receiving the candidate link, the maintainer supplied a log with the revision-2 manager probe still active and uncaught ExtJS/Proxmox errors: `timerId` accessed through an undefined `fireFn`, and `loadTags` called when `getController()` is null. The log does not establish the installed main script version or whether its Copy button worked. Its repeated `cloneCallback`, `anchorFilter`, and `buttonSome` failures come from the diagnostic probe, which intentionally exercises the old callback paths; they are not candidate regression results.

The maintainer then responded to the candidate-only reload request with a log containing no probe reports and explicitly stated **Copy worked**. Both `fireFn`/`timerId` and null-controller `loadTags` exceptions still recur. Record this as maintainer-reported copying success in the candidate-only test, with unresolved UI errors; the report does not itemize copy/paste fidelity or separate node/LXC outcomes. It rules out an actively running probe as the sole explanation for the repeated errors, but does not establish their cause.

Hold promotion pending a baseline comparison: disable the Copy Console candidate too, keep the probe and other managers disabled, clear console output, fully reload, and repeat the same node/LXC navigation. Record whether either exception recurs. Do not attribute them to the candidate, FireMonkey, or Proxmox without that comparison. Source review and passing mocks cannot exclude an interaction with native ExtJS event handling. No further runtime change is made from these logs; stable main remains 0.4.0. Firefox + Violentmonkey regression acceptance is still outstanding.

## Current evidence: 0.4.0

Version 0.4.0 promotes the unchanged runtime from 0.4.0-dev.2 following maintainer-reported live acceptance below. The historical 0.3.0 baseline is at commit `27a83d2ac836ef35c2f7e6644b6e448355631be0`. Source inspection, mock execution, real parser execution, CI, and user-reported live results are separate evidence classes.

| Date | Surface | Environment | Evidence |
| --- | --- | --- | --- |
| 2026-09-18 | Original baseline review | Node 24.18.0 / Windows | Syntax and 22 ad hoc assertions reproduced baseline behavior and limitations; see the historical review |
| 2026-09-18 | Historical output fixtures | Exact 0.3.0 Git blob | Five buffer output fixtures checked against the baseline source; one records the intentional Unicode-whitespace difference |
| 2026-09-18 | Development integration | Node 24.18.0 / mocked DOM, ExtJS, manager, clipboard, timers | Regression suite exercises installed handlers, targeting, errors, lifecycle, clipboard status, and focus guards |
| 2026-09-18 | Actual xterm parser/buffer | Proxmox xterm 6.0.0 bundle, pinned revision in `tools/fetch-xterm.cjs`, Node without DOM renderer | Wrapping, wide glyphs, literal spaces, Unicode whitespace, emoji/combining text, scrollback, resize, alternate screen, and handler integration |
| 2026-09-18 | Diagnostic probe | Mocked Proxmox page | Confirms structural reporting without reading buffer rows or emitting transcript/identity strings |
| 2026-09-18; versions supplied 2026-09-19 | Maintainer-reported live node Shell / LXC Console | Firefox 156.0 (64-bit), Violentmonkey 2.49.0, Proxmox VE 9.2.3 | Successful full copy/paste with expected detail and correct current-console targeting on dev.2; version screenshots supplied, copying not independently observed by the coding agent |
| 2026-09-19 | Maintainer-reported Tampermonkey follow-up | Tampermonkey 5.5.0, script 0.4.0-dev.2; continuing the Firefox 156.0 (64-bit) / Proxmox VE 9.2.3 test round | Maintainer reports fully tested and working, with no issues; screenshot confirms manager/script versions and enabled script |
| 2026-09-18 | GitHub Actions | Fresh Ubuntu / Node 24, commit `68c0f50` | [Checks passed](https://github.com/StarlightDaemon/proxmox-copy-console/actions/runs/35424235814), including fresh fixture download and the full test suite |

The tests do not emulate Firefox compartments, browser same-origin enforcement, native ExtJS focus/layout, or extension clipboard permissions. The real xterm fixture executes its public parser and buffer API without `open()` or a renderer; it does not run Proxmox's websocket/termproxy code.

Earlier `0.4.0-dev.1` local run on 2026-09-18: **65 tests passed, zero failures/skips** (44 mocked integration cases, five baseline comparisons, one diagnostic case, 15 actual-parser cases). Its source was 15,956 bytes; SHA-256: `32597f0c5cdb370247f10c7c7cd0f1abf34608b46cf84748a5371050d003b93f`. This is historical evidence, not the current source hash.

Version `0.4.0-dev.2` final local run before publication on 2026-09-18: **82 tests passed, zero failures/skips** (44 integration cases, 16 compatibility cases, five baseline comparisons, two probe cases, 15 actual-parser cases). It added modern clipboard, explicit Firefox sharing, page exposure, and runtime URL-guard coverage. The sharing tests check our adapter's contracts; they cannot reproduce Firefox's native compartment enforcement. Syntax/metadata/version/size checks and 33 local Markdown links passed, as did `git diff --check`. Checkpoint source: **17,327 bytes**, SHA-256 `3982b2afc13b10ad798434070ee6f4b3760771fdacc81591ed607101230239e8`. This was 1,371 bytes over dev.1 and below the 20 KiB budget. These checks ran on local Windows / Node 24.18.0 before the live report below; remote CI is recorded independently on each GitHub commit.

Promotion verification for `0.4.0` on 2026-09-19: **82 tests passed, zero failures/skips**. Direct comparison with the live-tested source at `d560ded` confirms that the userscript body after the metadata header is identical. Current source: **17,291 bytes**, SHA-256 `d6fc203571daffcc740c3355db80c78595462ed2e927aa48ae1b3228e421ef1d`. Syntax, metadata, version, size, local links, and whitespace checks passed. Only the version and release description changed in the production userscript.

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

For the active supported console, expect `topPage`, `pageVisible`, and `proxmoxGlobal` to be true. Its anchor should have identity and an owner element, one toolbar anchor, and exactly one eligible frame. That frame should be same-origin, identity-matched, and have a readable buffer through the direct or wrapped path. `copyButtons` should be one with the script enabled.

The probe does not read buffer rows, change focus, create controls, invoke clipboard APIs, or make network requests. It omits host names, guest IDs, full URLs, and transcripts. Devtools sees page globals, so this result alone cannot establish that the userscript manager exposes the same objects to its sandbox. Record the manager version from its own UI.

## Maintainer live acceptance — 2026-09-18

The maintainer tested the pinned `0.4.0-dev.2` userscript at commit `d560ded96ffcdb06da494249715bb148e54470f3`, SHA-256 `3982b2afc13b10ad798434070ee6f4b3760771fdacc81591ed607101230239e8`, obtained from the reviewed raw-script link. They reported successful use across several nodes and several container consoles, full copy/paste with the expected detail, and text taken from the correct current console. They requested promotion on that evidence.

On 2026-09-19 the maintainer supplied screenshots showing **Firefox 156.0 (64-bit)**, **Violentmonkey 2.49.0**, and **Proxmox VE 9.2.3** for the tested environment. The installed `pve-xtermjs` package version remains unrecorded. Only relevant version facts are transcribed here; the screenshots' host addresses, node/guest identities, and terminal content are not published.

No sanitized probe report, exact text comparison, or individual edge-case results were supplied. This report establishes observed Firefox user-workflow success, not completion of the full scenario checklist or manager matrix; Chrome and other unreported configurations remain unverified. Version 0.4.0 changes the userscript metadata only, preserving the tested runtime.

### Tampermonkey follow-up — 2026-09-19

Continuing the Firefox-only test round, the maintainer reported that the script was fully tested and working under Tampermonkey, with no issues to report. The supplied dashboard screenshot confirms **Tampermonkey 5.5.0**, **Proxmox Copy Console 0.4.0-dev.2**, and an enabled script. Firefox 156.0 (64-bit) and Proxmox VE 9.2.3 are carried forward from the previously supplied environment screenshots; they are not independently visible in this dashboard image.

Record this as a successful maintainer-reported Tampermonkey test, alongside the Violentmonkey workflow pass. The coding agent did not operate the browser or independently observe this run. Individual scenario results and probe output were not supplied, so no additional per-scenario observations are inferred. Chrome remains untested; subsequent manager attempts are recorded separately below.

### FireMonkey attempt — 2026-09-19

The maintainer reports that FireMonkey does not seem to work, while noting uncertainty about manager setup. The supplied changelog identifies version **3.8**; the popup screenshot does not independently show the manager or installed script version. It shows Proxmox Copy Console under **Other Scripts**, with **Tab Scripts** empty. The maintainer subsequently confirmed testing on both a node Shell and a container Console: **the Copy button never appeared**. Record a failed workflow attempt on both supported views, with cause unresolved. The earlier suggestion that testing may have occurred only on a manager dashboard is superseded by this clarification. Clipboard behavior was not reached.

Source investigation found a separate popup-matching issue in [FireMonkey 3.8 match.js](https://github.com/erosman/firemonkey/blob/e91aa324284a495e0d819b1efe6203e48c868369/src/content/match.js): `cleanUrl` removes the port before the popup checks include globs. Local Node execution of that upstream class (only its unused App import removed) passed three assertions: the project's `https://*:8006/*` glob matches synthetic `https://pve.example:8006/`, fails after port removal, and the popup's `get` method returns no match. This explains how Other Scripts can appear on the correct tab. It does not reproduce Firefox injection or establish the cause of the missing button: [registration uses the original includeGlobs](https://github.com/erosman/firemonkey/blob/e91aa324284a495e0d819b1efe6203e48c868369/src/content/userscript.js), through a separate browser API path.

Follow-up evidence: the maintainer fully disabled Tampermonkey and Violentmonkey. Their Proxmox screenshot shows the original script's fixed integration warning and a disabled manager probe. After enabling the probe, they supplied JSON identifying FireMonkey, with `legacyClipboard`, `modernClipboard`, `cloneInto`, `proxmoxGlobal`, `extQuery`, and `extCreate` all true and `pagePath: unsafeWindow`. The original script still logs `Console integration unavailable; retrying automatically`. This establishes startup and API/global availability in the manager sandbox; it does not establish successful API invocation, cloning, component discovery, or clipboard writes. Host addresses and unrelated terminal/browser output are omitted from this record.

Revision-2 live result supplied by the maintainer: `clonePlain`, `query`, `iterate`, and `inspect` passed. For one supported anchor, identity, toolbar membership, and owner/frame checks passed; `anchorFilter` and `buttonSome` each failed with `Error`. `cloneCallback` failed with `TypeError`; that combined check covers both cloning and invocation, so its exact internal failure point is not established. These results demonstrate callback-boundary failures and motivate the candidate above. Explicit `exportFunction` behavior, actual button creation, and clipboard copying in FireMonkey still require live acceptance. Popup categorization alone cannot establish injection failure.

Revision-2 local validation: all five probe tests passed, covering delayed discovery, callback/clone failure isolation, inaccessible exception properties, and absence of terminal/identity leakage, clipboard calls, or UI creation in the mocks. Syntax, metadata, size, local links, and whitespace checks passed. These tests do not reproduce native Firefox compartments. Production 0.4.0 remains unchanged; no fix is claimed before live diagnostic evidence.

[FireMonkey's help](https://erosman.github.io/firemonkey/src/content/help.html) describes Tab Scripts as the active-tab list and provides registration errors in script Information. Its manual Run action does not process userscript metadata or supply GM APIs; use normal saved-script activation for this test. The latest live callback failures justify the candidate above, while a separate manager edition has not been needed.

## Remaining live acceptance plan

Use the current stable Proxmox/browser policy and the nine combinations in [Compatibility](COMPATIBILITY.md#live-test-priority-and-evidence). The two primary Firefox managers now have successful maintainer reports. Further qualification can record individual scenario results and run the separate temporary [manager probe](../tools/probe-manager.user.js) inside each userscript manager before the top-page structure probe; do not confuse page devtools with the manager sandbox. Preserve the reported passes while keeping unrecorded scenario details distinct.

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

## Promotion decision and broader qualification

The earlier plan gated promotion on four complete primary browser/manager rows. On 2026-09-18 the maintainer requested promotion after the reported node/LXC workflow tests. Version 0.4.0 follows that decision with the tested runtime unchanged and the narrower evidence stated explicitly. This does not mark the broader qualification plan complete.

Before claiming full primary browser/manager qualification, pass all four primary rows in [Compatibility](COMPATIBILITY.md#live-test-priority-and-evidence): Firefox and Chrome, each with Tampermonkey and Violentmonkey. Each combination must cover node Shell, LXC, text fidelity, alternate screens, navigation, focus, and clipboard completion semantics. Record exact observed compatibility, including limitations; extended managers may remain explicitly unverified. CI, mocks, and downloaded source are not manual Proxmox acceptance.
