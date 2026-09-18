# proxmox-copy-console

A userscript that adds a native **Copy** button to Proxmox xterm consoles and copies the full retained terminal buffer.

## Current baseline: 0.3.0

Version 0.3.0 is the documented implementation baseline. It provides:

- a native ExtJS **Copy** button;
- node **Shell** support;
- LXC **Console** support;
- visible xterm discovery from the main Proxmox UI;
- fresh terminal rediscovery so navigation, reconnects, and recreated consoles do not retain stale terminal references;
- full retained-buffer copying;
- wrapped-line reconstruction;
- normal-buffer scrollback copying;
- active alternate-buffer handling when an alternate screen is in use;
- navigation and resize resilience through repeated lightweight rediscovery;
- stable **Copy** button text with native ExtJS layout behavior;
- no split-button behavior.

The userscript source is `proxmox-copy-console.user.js`.

## Why explicit buffer copying

The project previously explored a select-to-copy approach. That lineage was abandoned because browser/Firefox selection behavior did not integrate cleanly with xterm selection for this use case. A probe found that xterm `getSelection()` was already populated before `onSelectionChange()` ran.

The design therefore pivoted away from selection-driven copying. Version 0.3.0 uses an explicit **Copy** control and reads the retained xterm buffer directly, reconstructing wrapped rows into logical lines before writing to the clipboard.

See `docs/HISTORY.md` and `docs/DESIGN.md` for the recorded rationale and implementation shape.

## Usage

With the userscript enabled in the Proxmox web UI:

1. Open a node **Shell** or LXC **Console** backed by xterm.
2. Use the native-looking **Copy** button inserted immediately after the corresponding toolbar control.
3. The script copies the appropriate retained terminal buffer to the clipboard and briefly changes the icon/tooltip for feedback while keeping the button text stable.

## Verification status

This repository foundation documents behavior represented by the 0.3.0 source. The foundation task itself was performed through GitHub only. It did **not** perform local execution, automated runtime tests, or manual Proxmox acceptance.

See `docs/TESTING.md` for the verification scenarios that should be exercised in a real Proxmox environment.

## Future work

0.4.0 is planned/unreleased future work. Experimental 0.4.0 behavior is intentionally excluded from the 0.3.0 baseline and must not be treated as current behavior.

## License

MIT. See `LICENSE`.
