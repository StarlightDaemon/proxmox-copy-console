# Research and implementation strategy

Recorded 2026-09-18, updated for unreleased `0.4.0-dev.2`. This document links API evidence to implementation choices and identifies what live testing still needs to decide. The [compatibility policy and ten-app survey](COMPATIBILITY.md) add current stable Proxmox, Chrome, Firefox, and manager-specific primary sources.

## Upstream contracts inspected

| Source | Pinned revision / observation | Consequence |
| --- | --- | --- |
| [Proxmox ConsoleButton](https://github.com/proxmox/pve-manager/blob/49318c671b82f31e6b273b79447526161739b97a/www/manager6/button/ConsoleButton.js) | Native `pveConsoleButton` exposes type, node, and guest identity; labels are translated | Use component metadata instead of English label matching |
| [Node configuration](https://github.com/proxmox/pve-manager/blob/49318c671b82f31e6b273b79447526161739b97a/www/manager6/node/Config.js) and [LXC configuration](https://github.com/proxmox/pve-manager/blob/49318c671b82f31e6b273b79447526161739b97a/www/manager6/lxc/Config.js) | Native console buttons live in configuration toolbars; console panels belong to those views | Search the toolbar owner's frame descendants and compare identity |
| [Proxmox VNCConsole](https://github.com/proxmox/pve-manager/blob/49318c671b82f31e6b273b79447526161739b97a/www/manager6/VNCConsole.js) | Embedded frame URLs carry `console`, `node`, `vmid`, and `xtermjs=1`; the iframe is reused | Parse exact fields and inspect the loaded URL after navigation |
| [Proxmox xterm integration](https://github.com/proxmox/pve-xtermjs/blob/89075b05773a2b6c380175dde3f8a4472a5ab506/xterm.js/src/main.js) and [settings](https://github.com/proxmox/pve-xtermjs/blob/89075b05773a2b6c380175dde3f8a4472a5ab506/xterm.js/src/util.js) | A page-global `term` is created from settings; reconnect paths may reload or dispose it; remote-console variants exist | Resolve per click, tolerate disposal, preserve wrapped-object access, and exclude remote contexts from this scope |
| [Proxmox xterm changelog](https://github.com/proxmox/pve-xtermjs/blob/89075b05773a2b6c380175dde3f8a4472a5ab506/xterm.js/debian/changelog) | The pinned bundle is xterm 6.0.0; reflow options can vary | Test the real parser without claiming every installed Proxmox version uses this bundle |
| [Tampermonkey clipboard API](https://www.tampermonkey.net/documentation.php?locale=en&q=GM_setClipboard) | Legacy API supports a completion callback | Use callback confirmation only for an identified compatible manager |
| [Violentmonkey clipboard implementation](https://github.com/violentmonkey/violentmonkey/blob/1fed91eabe35c9724e2c7858f2b24ad6844de7d5/src/injected/web/gm-api.js) | Legacy `GM_setClipboard` posts a bridge message without returning completion | Report dispatch as unconfirmed; do not hang waiting for an unsupported callback |

These are source/API observations, not proof of Firefox sandbox behavior or compatibility with a specific installed Proxmox release. The structural association remains the main live-test risk. A read-only [probe](../tools/probe-console.js) makes that risk inspectable before adding fallback logic.

## Real-parser experiment

The Proxmox bundle was obtained through the GitHub connector, placed in ignored `.cache/xterm.cjs`, and verified against Git blob `e47e2ddd2c3d71e006008a9a948aacf64cade1d6` at the pinned revision above. The reproducible downloader verifies the same content before execution. Nothing from that bundle is shipped in the userscript.

At five columns, writing synthetic `abcd界` produces an empty final cell in the first physical row and a width-two glyph at the start of the wrapped second row. String-only concatenation would yield `abcd 界`. The development extractor distinguishes the empty cell from an actual space, producing `abcd界`; tests also preserve literal spaces before wide characters.

Other fixtures exercise Unicode whitespace, emoji, combining text, retained scrollback, completed-line resize/reflow, alternate-screen entry/exit, ANSI styling, and the actual Copy handler. These experiments use public xterm APIs without enabling proposed APIs or creating a DOM renderer. They validate the pinned parser, not all Unicode-width configurations or terminal rendering implementations.

## Implemented versus deferred

| Review item | Current state | Remaining evidence |
| --- | --- | --- |
| R1 console association / R4 localization | Implemented with owner containment, exact identity, and ambiguity rejection | Actual ExtJS containment and iframe exposure on the target installation |
| R2 error boundaries | Implemented; partial buttons disposed; warnings throttled | Live teardown behavior and manager-specific failures |
| R3 text fidelity | ASCII-only cleanup plus verified wide-wrap correction | Target terminal width/reflow options and representative real output |
| R5 clipboard completion | Callback/promise/void/timeout paths implemented and mocked | Real extension and OS clipboard outcomes; fallback MIME remains unspecified |
| R6 feedback lifecycle | One replaceable timer and pending-write guard | Native visual and keyboard behavior |
| R7 idle work | Hidden-page early exit, narrow query, no idle buffer reads | Browser profiling before any quantified CPU claim |
| Scope feedback / unavailable state / focus return | Implemented with conservative focus guards | Native ExtJS focus behavior and actual user workflow |
| Host restriction | Portable include glob plus actual HTTPS/8006/top-frame guard; broad distributed include disclosed | Verify each installation's effective manager rules |
| Cross-manager APIs and Firefox sharing | Legacy/modern clipboard selection and conditional `cloneInto` sharing implemented; sandbox capability probe added | Nine live browser/manager combinations remain pending |
| Viewport-only copy | Uncommitted idea; outside the current implementation plan | Demonstrated recurring workflow need before considering semantics or implementation |

## Next decisions after live evidence

Track ownership, status, and completion criteria in [Open loops](OPEN-LOOPS.md). The points below explain the technical rationale rather than a second task queue.

1. If the structure probe matches the expected ownership, keep the current strict resolver. If it fails, add only the smallest fallback justified by actual version-specific evidence, with a regression fixture. Do not restore global first-visible-frame copying.
2. Test current stable Firefox first for the daily homelab workflow, then Chrome for compatibility, beginning with Tampermonkey and Violentmonkey as specified in the matrix. Both browsers remain in the general-release gate. The shared adapter now covers both GM API styles. Add manager-specific variants only for observed incompatibilities. Do not add a second write API as an automatic retry; a delayed original write could overwrite newer clipboard contents.
3. Evaluate the guarded focus return with actual keyboard use. If it disrupts navigation, remove that convenience or narrow its condition before release.
4. Keep the 500 ms interval unless traces show a meaningful cost. Do not substitute a terminal-output observer or permanent terminal cache without measurements.
5. Finish acceptance and simplify any unnecessary code before considering optional features. Revisit viewport-only copying only if daily use demonstrates a recurring need and it meets the scope policy in Decisions; passing acceptance alone is not a reason to expand the feature set.

## Size and maintenance budget

The baseline source is 12,846 Git bytes; `0.4.0-dev.1` was 15,956 bytes. The current runtime retains a 20 KiB check budget and remains one dependency-free file; [Testing](TESTING.md) records its measured size/hash. No minification, transpilation, npm packages, or build artifacts are needed to install it. Tests and research tools are development-only; their purpose is to make future changes cheap to verify. Keep runtime growth tied to observable reliability or user value.

This is an unreleased development snapshot. Publishing its source does not establish live acceptance or create a stable release. The next engineering step is Firefox-first live acceptance once the target environment is available, followed by Chrome compatibility checks.
