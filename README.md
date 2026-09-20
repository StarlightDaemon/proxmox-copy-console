# Proxmox Copy Console

[![Version](https://img.shields.io/badge/version-0.4.1-0969da)](https://github.com/StarlightDaemon/proxmox-copy-console/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-2da44e)](LICENSE)

Copy text from Proxmox node shells and LXC consoles with one native **Copy** button. This lightweight userscript captures retained scrollback, joins wrapped lines, and follows the console as you switch between nodes and containers.

**[Install the stable script](https://raw.githubusercontent.com/StarlightDaemon/proxmox-copy-console/main/proxmox-copy-console.user.js)** · [Release notes](https://github.com/StarlightDaemon/proxmox-copy-console/releases/latest)

## What it copies

- The full retained shell buffer, including output above the visible screen.
- The active alternate screen when using applications such as `top`, `nano`, or `less`.
- Plain text with wrapped lines joined and interior blank lines preserved.

Discarded scrollback cannot be recovered. Trailing ASCII spaces and blank rows at the end are trimmed.

One JavaScript file, with no build step or runtime dependencies. The script makes no network requests and stores no transcripts.

## Install

1. Install **Violentmonkey** or **Tampermonkey** in Firefox or Chrome.
2. Open the [stable script](https://raw.githubusercontent.com/StarlightDaemon/proxmox-copy-console/main/proxmox-copy-console.user.js) and install it through your manager. If no installation prompt appears, import the file or paste its contents into a new script.
3. **Replace** the supplied `https://*:8006/*` include rule with your trusted Proxmox host, for example `https://pve.example.net:8006/*`. Adding a narrow rule alongside the broad one does not restrict access.
4. Keep one copy enabled in one manager, reload Proxmox, and open a node **Shell** or LXC **Console**.

The script needs access to the Proxmox page and permission to write to the clipboard. Only enable it on hosts you trust. Copied scrollback may contain sensitive output; check it before sharing.

## Use

Click **Copy** beside the native Shell or Console control, then paste into your preferred editor. The button's icon and tooltip show the result:

| Feedback | Meaning |
| --- | --- |
| Check icon / `Copied …` | The clipboard API reported completion. |
| Information icon / `Sent …; clipboard unconfirmed` | The write returned without a completion signal; check the pasted text. |
| Warning icon | Copying failed, the buffer is unavailable, or confirmation timed out. Check the tooltip. |
| Disabled button | The console is unavailable or ambiguous, or another copy is pending. |

The script does not read the clipboard back or retry writes automatically. After a timeout, check the clipboard before retrying.

## Compatibility

Targets current stable **Proxmox VE** through its main HTTPS interface on port **8006**, using embedded node Shell and LXC xterm consoles.

Practical copy/paste and navigation tests passed in **Firefox and Chrome**, each with **Violentmonkey and Tampermonkey**. Firefox + Violentmonkey is the primary combination. See [test coverage](docs/TESTING.md) for versions and limits.

Standalone console windows, noVNC/SPICE, PDM remote consoles, and custom proxy ports are outside the supported scope. Other browsers and managers are outside the current testing focus; see [compatibility details](docs/COMPATIBILITY.md).

## Documentation

- [Testing and troubleshooting](docs/TESTING.md) — local checks, diagnostic probes, and live test results.
- [Design](docs/DESIGN.md) — console matching, text extraction, and clipboard handling.
- [Changelog](CHANGELOG.md) and [project history](docs/HISTORY.md) — releases and earlier behavior.
- [Decisions](DECISIONS.md) and [open loops](docs/OPEN-LOOPS.md) — scope, follow-ups, and contribution ideas.

[MIT License](LICENSE).
