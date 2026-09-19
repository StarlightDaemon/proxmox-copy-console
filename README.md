# Proxmox Copy Console

[![Version](https://img.shields.io/badge/version-0.4.1--dev.1-0969da)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-2da44e)](LICENSE)

A lightweight userscript that adds a native **Copy** button to embedded Proxmox node Shell and LXC xterm consoles. It copies the **full retained terminal buffer**, including scrollback, with wrapped rows reconstructed into logical lines.

> **Version 0.4.0** promotes the unchanged runtime from `0.4.0-dev.2` following the maintainer's successful live copy/paste tests across multiple nodes and LXC consoles. See [Testing](docs/TESTING.md#maintainer-live-acceptance--2026-09-18) for the report and its limits; wider browser/manager qualification remains open.
> The historical 0.3.0 baseline is preserved at [commit 27a83d2](https://github.com/StarlightDaemon/proxmox-copy-console/blob/27a83d2ac836ef35c2f7e6644b6e448355631be0/proxmox-copy-console.user.js).

## What it does

This branch contains **0.4.1-dev.1**, an unreleased FireMonkey compatibility candidate. It replaces page-array callbacks with local loops and exports callbacks separately when Firefox's `exportFunction` is available. Live acceptance is pending; [main's stable 0.4.0 source](https://github.com/StarlightDaemon/proxmox-copy-console/blob/main/proxmox-copy-console.user.js) remains unchanged. Firefox + Violentmonkey is the primary daily-use combination and must be rechecked before promotion.

- Places one genuine ExtJS **Copy** button after the native Shell or Console control; Proxmox owns its appearance and layout.
- Copies retained normal-buffer scrollback, or the active alternate screen used by applications such as `top`, `nano`, and `less`.
- Preserves interior blank lines, wrapped spacing, and Unicode whitespace; handles wide-character wrap placeholders. Trims completed-line ASCII padding and trailing blank rows.
- Rediscovers the terminal after navigation and reconnects. Matches the native console's owner, node, type, and guest identity, without depending on English labels.
- Keeps button text stable. Icons/tooltips show buffer scope, failure, confirmed completion, or unconfirmed clipboard dispatch.
- Runs as one directly installable JavaScript file: no runtime dependencies, build step, network requests, or transcript storage.

This is a snapshot of retained rendered terminal text, not a lossless session recording. Discarded scrollback cannot be recovered. Meaningful trailing ASCII spaces are not preserved by the cleanup policy.

## Installation and trust

1. For this development test, open the [0.4.1-dev.1 candidate](proxmox-copy-console.user.js). For daily use, retain [stable 0.4.0](https://github.com/StarlightDaemon/proxmox-copy-console/blob/main/proxmox-copy-console.user.js). The historical [0.3.0 baseline](https://github.com/StarlightDaemon/proxmox-copy-console/blob/27a83d2ac836ef35c2f7e6644b6e448355631be0/proxmox-copy-console.user.js) remains available.
2. Import or paste it into your userscript manager. Keep only one version enabled.
3. **Restrict its include rules to your trusted Proxmox hosts.** The supplied `https://*:8006/*` glob covers every HTTPS host on port 8006; the script also checks the actual protocol and port. Replace that broad rule, or disable it in your manager's overrides; adding a narrow rule alongside it does not narrow access. For example, use `https://pve.example.net:8006/*` or `https://192.0.2.10:8006/*`, replacing the example with your own host. Verify the manager's effective rules. The historical 0.3.0 source uses a regex include instead.
4. Enable the script, open `https://<your-host>:8006/`, and enter a node Shell or LXC Console.

Grants are `GM_setClipboard` / `GM.setClipboard` (alternative clipboard API styles), `GM_info` / `GM.info` (manager identification), and `unsafeWindow` (page integration). Only one clipboard API is invoked per activation. The page and userscript manager must be trusted: a page-controlled ExtJS handler is not a security boundary enforcing human clicks. Copy includes offscreen retained output, which may contain sensitive information; inspect it before sharing.

The target is the **main Proxmox UI with embedded same-origin xterm frames**. Standalone console windows, reverse proxies on other ports, PDM remote consoles, noVNC/SPICE, and other guest console types are outside the established scope.

Target **current stable Proxmox VE, with Firefox as the primary browser and Chrome as the secondary compatibility target**. Tampermonkey and Violentmonkey are the primary manager targets; Greasemonkey, FireMonkey, ScriptCat, and OrangeMonkey are additional candidates. The shared script includes legacy/modern clipboard APIs and a Firefox object-sharing adapter. See the [ten-app survey and compatibility matrix](docs/COMPATIBILITY.md) for sources, installation notes, and qualification status. Promotion follows the maintainer's reported workflow acceptance, not completion of every matrix row. No separate manager-specific source forks are currently needed.

## Usage

Click **Copy** after the native Shell or Console control. The script uses these feedback states:

| Feedback | Meaning |
| --- | --- |
| Check icon / `Copied …` | The clipboard API reported completion; the script does not read the OS clipboard back |
| Information icon / `Sent …; clipboard unconfirmed` | The manager's write call returned without a completion signal |
| Warning icon | Empty/unavailable buffer, extraction failure, clipboard error, or unconfirmed timeout |
| Disabled Copy button | Its console is unavailable/ambiguous, or another Copy control has a pending write |

Tampermonkey's legacy completion callback is used when the manager identifies itself as Tampermonkey. Returned promises are awaited. A void return from either API style is reported as unconfirmed dispatch; modern `GM.setClipboard` does not necessarily return a promise. A five-second timeout is uncertainty, not proof of failure; inspect the clipboard before retrying. Requests are never retried automatically.

Feedback lasts 1.5 seconds without changing the Copy label. After a completed dispatch, focus returns only if it is still on that same button and the same terminal is active. While pending, the initiating button remains focusable and repeated activations are ignored. Console discovery runs every 500 ms while the page is visible and immediately when visibility returns; idle discovery does not extract buffer rows.

## Local checks and probes

Use Node.js 24; no npm install is needed:

```sh
node tools/check.cjs
node --test --test-isolation=none tests/console.test.cjs tests/compatibility.test.cjs tests/baseline.test.cjs tests/probe.test.cjs
node tools/fetch-xterm.cjs
node --test --test-isolation=none tests/*.test.cjs
```

The last two commands download a pinned, integrity-checked Proxmox xterm bundle into ignored `.cache/` and exercise its actual parser/buffer in Node. This is a development fixture only; it is never loaded by the userscript.

[Testing](docs/TESTING.md) records executed checks, remaining evidence gaps, and the live acceptance plan. The read-only [console probe](tools/probe-console.js) can diagnose integration structure without collecting transcript text or writing the clipboard.

## Project documents

- [Design](docs/DESIGN.md): current behavior and the historical 0.3.0 baseline.
- [Decisions](DECISIONS.md): accepted baseline rationale and development choices.
- [History](docs/HISTORY.md): the earlier selection-to-copy pivot.
- [Review](docs/REVIEW-2026-09-18.md): findings that motivated this iteration.
- [Research and next steps](docs/RESEARCH.md): upstream contracts, evidence, and remaining decisions.
- [Compatibility](docs/COMPATIBILITY.md): current stable platform policy, manager survey, and sandbox probe.
- [Open loops and agent handoff](docs/OPEN-LOOPS.md): remaining validation, conditional ideas, and a scoped follow-up assignment.
- [Changelog](CHANGELOG.md): version status.
- [AGENTS.md](AGENTS.md): repository mutation and evidence boundaries.

The project stays focused on one job: accurately copy the intended console through one native button. Additions must solve a demonstrated copying-workflow problem at low complexity and maintenance cost. Optional viewport copying is an idea to revisit only if daily use warrants it; see the scope policy in [Decisions](DECISIONS.md#product-scope-and-simplicity).

Released under the [MIT License](LICENSE).
