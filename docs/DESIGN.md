# Design

## Scope

Version 0.3.0 adds an explicit native-looking **Copy** control to supported Proxmox xterm consoles and copies terminal text from xterm's retained buffer.

The design is intentionally based on the supplied 0.3.0 source, not on inferred future behavior.

## Main-page execution

The userscript is marked `@noframes` and also exits when `window.top !== window.self`. It operates from the main Proxmox UI and reaches the xterm terminal through accessible iframe globals.

## Terminal discovery

`findVisibleTerminal()` enumerates iframes and ignores frames that are not visibly rendered.

Discovery has two passes:

1. Prefer visible frames whose `src` looks console-related through `xtermjs=1` or `console=`.
2. Fall back to every visible iframe so future Proxmox URL/markup changes do not make URL matching the sole dependency.

`getTerminalFromFrame()` checks `frame.contentWindow.term`. It also checks `frame.contentWindow.wrappedJSObject.term` for Firefox/userscript-manager cases where same-origin iframe globals are exposed through a wrapped object.

The terminal is rediscovered whenever copying is requested and during periodic installation scans. The script deliberately avoids retaining one long-lived terminal object across navigation/reconnects.

## Buffer selection

`extractFullConsole()` distinguishes the active xterm buffer:

- For ordinary shell operation, it prefers `term.buffer.normal` so retained scrollback is included.
- If the active buffer is the alternate buffer, it uses that active alternate buffer because it represents the alternate-screen content currently displayed.

## Wrapped-line reconstruction

`extractBuffer()` iterates every physical row exposed by the selected xterm buffer.

For each row:

- `translateToString(false)` preserves the complete physical row during assembly.
- If `line.isWrapped` is true and a logical line is already in progress, the physical row is appended without adding a newline.
- Right-side whitespace is removed only after the complete logical line has been assembled.
- Missing rows become blank logical lines.
- Trailing empty logical rows below the active content are removed, while interior blank lines remain.

The final clipboard text is `lines.join('\n')`.

## Clipboard flow

`copyConsole()` performs fresh terminal discovery, extracts the selected buffer, and calls `GM_setClipboard(result.text)`.

The script reports success/failure through console logging plus temporary icon/tooltip feedback. Clipboard type is intentionally left unspecified in the 0.3.0 source.

## ExtJS integration

`findConsoleAnchor()` searches visible ExtJS buttons in this preference order:

1. `Shell`
2. `Console`

The anchor must belong to a toolbar. This yields the intended placement:

- Node: **Shell → Copy**
- LXC: **Console → Copy**

The injected control is a genuine `Ext.button.Button`, allowing Proxmox/ExtJS to own dimensions, theme, hover state, and layout behavior.

Each toolbar receives at most one injected control, marked with the private `pveCopyConsoleButton` property.

## Feedback and layout stability

The button text remains **Copy**. Feedback is expressed by temporarily changing the icon and tooltip, then restoring them after the configured feedback interval. Stable text avoids toolbar width/reflow changes.

The control is not a split button.

## Navigation and component lifecycle

Proxmox can create, hide, destroy, and recreate ExtJS components and console frames. The script runs `installForCurrentConsole()` immediately and on a 500 ms interval.

The repeated scan requires an actual visible xterm before inserting a control, checks for an existing injected button in the current toolbar, and naturally re-evaluates after navigation or component recreation.

## Evidence boundary

This design document describes behavior represented by source inspection. The GitHub-only foundation task did not execute the userscript in Proxmox and does not establish runtime/manual acceptance.
