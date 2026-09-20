# Testing and compatibility

## Current status

Stable **0.4.1** preserves the runtime of tested candidate `0.4.1-dev.1` at `6d803b0946af66c021bc9999cfdce292de750120`; promotion changed metadata only. [0.4.1](https://github.com/StarlightDaemon/proxmox-copy-console/releases/tag/v0.4.1) and [0.4.0](https://github.com/StarlightDaemon/proxmox-copy-console/releases/tag/v0.4.0) are published stable releases.

Target current stable Proxmox VE through its main HTTPS interface on port 8006, with embedded node Shell and LXC xterm consoles. Firefox + Violentmonkey is the primary combination; Chrome represents Chromium testing. Other Chromium browsers are unverified unless exercised. Additional-manager testing is deferred. Standalone windows, noVNC/SPICE, PDM remote consoles, and custom ports remain outside established support.

| Combination | Recorded practical result on 0.4.1-dev.1 |
| --- | --- |
| Firefox + Violentmonkey | Copying from shells and containers, including dynamic navigation, reported working. |
| Firefox + Tampermonkey | Final candidate follow-up reports all requested tests passed without issues. |
| Chrome + Violentmonkey | All requested workflow tests reported working without issues. |
| Chrome + Tampermonkey | Copy button, menu navigation, and leaving/returning to the site reported working. |

These are user-reported practical passes, not independently observed OS clipboard tests or complete per-scenario qualification. The earlier Firefox round established Firefox 156.0 (64-bit), Proxmox VE 9.2.3, Violentmonkey 2.49.0, and Tampermonkey 5.5.0; final candidate runs did not restate every version. Chrome was described as the latest official public-channel build; numeric browser/manager versions remain unrecorded.

FireMonkey 3.8 and Greasemonkey 4.14 have reported candidate copying success, with fuller qualification deferred. Preserve their diagnostic context in the [test history](historicals/TESTING.md); the [archived manager survey](historicals/COMPATIBILITY.md) is not an active test queue.

At 0.4.1 preparation, **88 local tests passed with zero failures/skips**. Syntax, metadata, version, size, links, and whitespace checks passed. [Promotion CI also passed](https://github.com/StarlightDaemon/proxmox-copy-console/actions/runs/35490151762). Stable source: 18,210 bytes; SHA-256 `16dd12bbdf8a33e4336caee17f86ff1146bf183f57370abcd4632da553757b11`. These are recorded release checks, not a claim of a new run whenever this document changes.

The [original evidence record](historicals/TESTING.md) retains exact commits, earlier counts/hashes, 0.4.0 acceptance limits, logs, and the promotion decisions. The historical 0.3.0 baseline remains at `27a83d2ac836ef35c2f7e6644b6e448355631be0`.

## Local checks

Use Node.js 24 from the repository root. No npm install or build step is needed.

```sh
node tools/check.cjs
node --test --test-isolation=none tests/console.test.cjs tests/compatibility.test.cjs tests/baseline.test.cjs tests/probe.test.cjs
node tools/fetch-xterm.cjs
node --test --test-isolation=none tests/*.test.cjs
```

The first two commands work offline. The downloader fetches a pinned, integrity-checked Proxmox xterm bundle into ignored `.cache/` if missing. The full suite fails for a missing/corrupt fixture rather than skipping parser coverage.

Mocks exercise targeting, clipboard contracts, errors, lifecycle, focus, and sandbox-adapter behavior. The real xterm fixture exercises its parser and public buffer APIs without a browser renderer. Neither proves native Firefox compartment behavior, extension permissions, real clipboard contents, or live Proxmox compatibility.

## Live regression check

Use one enabled manager/script, trusted-host restrictions, harmless synthetic output, and a scratch text editor.

1. Open a node Shell and LXC Console. Confirm one native Copy button beside the correct control.
2. Copy output with scrollback, blank lines, a wrapped line, and Unicode text; paste and compare the actual text.
3. Switch nodes/containers, reconnect, reload, leave the browser tab, and return. Confirm the intended current console is copied without duplicate buttons.
4. Enter/exit an alternate-screen application such as `less` with harmless content; verify the active buffer is copied.
5. Repeat Copy, change focus, and navigate away during a write. Check feedback and that focus is not stolen.

For complete edge-case qualification, also test resizing, wide-character wrap boundaries, localization, hidden/ambiguous consoles, teardown, and denied/late clipboard completion. The [detailed scenario checklist](historicals/TESTING.md#remaining-live-acceptance-plan) preserves the original exercises; its wider nine-combination campaign is superseded by the four primary targets above. No new probes or repeated acceptance campaign are required without a failure or relevant change.

Record date, script version/hash, browser/manager versions, Proxmox and `pve-xtermjs` versions, effective host rules, scenario, expected/actual pasted text, and limitations. Keep synthetic text only; do not publish credentials or real console transcripts. A success icon alone does not prove the pasted content.

## Troubleshooting and optional probes

If the button is missing, first confirm the script is saved/enabled in the intended manager, its host rules match, the page has been reloaded, and the view is a supported embedded console. See [installation](../README.md#install), including the custom-port limitation.

Use probes only when a failure needs investigation:

- [Manager probe](../tools/probe-manager.user.js): install as a separate temporary userscript in the same manager with the same trusted-host restrictions. Reload Proxmox with a console open; inspect the immediate API report and delayed integration report in browser developer tools, then disable/remove the probe. Do not paste it into page devtools: that loses the manager sandbox. Revision 2 deliberately exercises old callback paths, so failed callback checks alone do not demonstrate a regression in 0.4.1.
- [Console structure probe](../tools/probe-console.js): inspect it, then paste into developer tools with the top Proxmox page selected. A supported active console should show one anchor, one eligible same-origin frame, readable terminal access, and one Copy button when enabled.

Both probes avoid transcript extraction, clipboard writes, and network requests. Page-level discovery cannot prove manager-sandbox access.

For an unconfirmed write or timeout, paste into a scratch editor before retrying; a late extension write may still complete. For recurring UI errors, compare identical navigation in a clean profile before attributing them to the userscript. Earlier Firefox `fireFn/timerId` and `loadTags` errors also appeared in a scripts-disabled profile with other extensions present; no root cause was established. Chrome form/unload notices and Firefox font restrictions do not, by themselves, demonstrate a copying defect. Do not suppress them or patch unrelated Proxmox behavior here.
