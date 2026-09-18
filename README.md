# Proxmox Copy Console

[![Version](https://img.shields.io/badge/version-0.3.0-0969da)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-2da44e)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-userscript-f7df1e)](proxmox-copy-console.user.js)

A lightweight userscript that adds a native-looking **Copy** button to Proxmox xterm consoles and copies the **full retained terminal buffer**—including scrollback—not just the visible viewport.

> **Current baseline:** 0.3.0 (pre-1.0).  
> **Next version:** 0.4.0 is planned and unreleased.

## Highlights

- **Native Proxmox integration** — inserts a real ExtJS `Copy` button into the existing console toolbar.
- **Node Shell support** — places **Copy** immediately after the visible **Shell** control.
- **LXC Console support** — places **Copy** immediately after the visible **Console** control.
- **Full retained-buffer copy** — ordinary shell copies include retained normal-buffer scrollback.
- **Alternate-screen awareness** — active `top`, `nano`, `less`, and similar alternate-screen content is copied from the active alternate buffer.
- **Wrapped-line reconstruction** — xterm physical rows marked as wrapped are reassembled into logical text lines.
- **Navigation/reconnect resilience** — the active xterm instance is rediscovered instead of keeping a stale terminal reference.
- **Firefox/userscript compatibility path** — terminal discovery checks both direct iframe globals and `wrappedJSObject` exposure.
- **Stable toolbar layout** — button text stays **Copy**; success/error feedback uses the icon and tooltip instead of resizing the control.
- **No split-button behavior** — the control is a standard ExtJS button.

## What problem does it solve?

The project originally explored selection-driven copying. That approach was dropped because browser/Firefox selection behavior did not integrate cleanly with xterm selection for this use case, and a probe showed xterm `getSelection()` was already populated before `onSelectionChange()` ran.

Version 0.3.0 instead uses an explicit **Copy** action:

1. discover the currently visible xterm terminal;
2. choose the appropriate xterm buffer;
3. rebuild wrapped physical rows into logical lines;
4. remove only trailing empty viewport rows;
5. write the resulting text to the clipboard with `GM_setClipboard`.

See [Project History](docs/HISTORY.md) and [Design](docs/DESIGN.md) for the recorded rationale and implementation details.

## Supported baseline

| Surface | 0.3.0 status |
| --- | --- |
| Proxmox node **Shell** | Documented |
| LXC **Console** | Documented |
| Normal xterm buffer + scrollback | Documented |
| Active alternate xterm buffer | Documented |
| Other Proxmox console types | Not established by the current baseline |

The userscript targets the main Proxmox web UI at HTTPS port `8006` and operates on accessible xterm-backed console iframes.

## Installation

Use a userscript manager that supports the permissions used by the script:

- `GM_setClipboard` — writes the extracted console text to the clipboard.
- `unsafeWindow` — accesses Proxmox page globals such as ExtJS/xterm objects.

Then:

1. Open [`proxmox-copy-console.user.js`](proxmox-copy-console.user.js).
2. Import or paste the script into your userscript manager.
3. Save and enable it.
4. Open your Proxmox web interface at `https://<host>:8006/`.
5. Open a supported **Shell** or **Console** view.

> Specific Proxmox, browser, and userscript-manager version combinations have **not** yet been established by runtime acceptance in this repository.

## Usage

1. Open a node **Shell** or LXC **Console** backed by xterm.
2. Look for the **Copy** button immediately after the native **Shell** or **Console** control.
3. Click **Copy**.
4. The retained terminal content is written to the clipboard.
5. The icon/tooltip briefly reports success or failure while the button text remains stable.

### Buffer behavior

For ordinary shell operation, the script prefers the **normal buffer** so retained scrollback is included.

When an alternate-screen application is active, the script copies the **active alternate buffer**, which represents the content currently displayed by applications such as `top`, `nano`, or `less`.

## How it integrates with Proxmox

The script runs from the main Proxmox UI and periodically performs a lightweight rediscovery pass:

- find a visible xterm iframe;
- prefer console-looking iframe URLs, with a visible-frame fallback;
- find the visible ExtJS **Shell** or **Console** toolbar control;
- insert one genuine `Ext.button.Button` after that control;
- avoid duplicate injected buttons in the same toolbar;
- rediscover after navigation, reconnects, or component recreation.

The scan interval in 0.3.0 is **500 ms**. Copy feedback is restored after **1000 ms**.

## Verification status

The 0.3.0 implementation is documented from repository/source inspection. This repository currently distinguishes static evidence from runtime acceptance:

| Evidence | Status |
| --- | --- |
| Source/implementation inspection | Documented |
| Local automated test execution | Not established |
| Browser automation | Not established |
| Manual Proxmox acceptance | Not established |
| Cross-version Proxmox/browser/userscript-manager matrix | Not established |

See [Testing](docs/TESTING.md) for the runtime/manual acceptance scenarios, including scrollback, wrapped lines, alternate screens, navigation/reconnects, resize behavior, hidden frames, and error feedback.

## Project layout

| Path | Purpose |
| --- | --- |
| [`proxmox-copy-console.user.js`](proxmox-copy-console.user.js) | Current 0.3.0 userscript implementation |
| [`CHANGELOG.md`](CHANGELOG.md) | Version and baseline record |
| [`DECISIONS.md`](DECISIONS.md) | Durable design decisions |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Implementation design |
| [`docs/HISTORY.md`](docs/HISTORY.md) | Project lineage and selection-to-copy pivot |
| [`docs/TESTING.md`](docs/TESTING.md) | Verification boundaries and acceptance scenarios |
| [`AGENTS.md`](AGENTS.md) | Repository execution and mutation guidance |
| [`LICENSE`](LICENSE) | MIT license |

## Roadmap

**0.4.0** is planned future work and remains intentionally unreleased. Experimental 0.4.0 behavior is not part of the documented 0.3.0 baseline and should not be treated as current functionality.

## License

Released under the [MIT License](LICENSE).
