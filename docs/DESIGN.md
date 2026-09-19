# Design

## 0.4.0 — current implementation

Version 0.4.0 promotes the runtime from 0.4.0-dev.2 without behavior changes, following the maintainer's live copy/paste report. [Testing](TESTING.md) records the scope and limits of that acceptance. The 0.3.0 design is retained below and its source remains pinned at `27a83d2ac836ef35c2f7e6644b6e448355631be0`.

### Console association

Discovery queries `pveConsoleButton` components, accepts visible `shell`/`lxc` controls with node/guest identity, and inspects iframe descendants of their toolbar owner's DOM element. The loaded frame URL must be same-origin and match `xtermjs=1`, console type, node, and (for LXC) guest ID exactly. Remote-console parameters are excluded. Exactly one eligible terminal and one native console anchor per toolbar are required. A stale `src` attribute or an unrelated global frame cannot satisfy this association.

The direct and Firefox `wrappedJSObject` terminal paths remain. Each click resolves its own current frame and terminal again. The Map retains toolbar/button state, never a terminal between operations. Existing controls disable when their context is unavailable and recover on a later scan. Unsupported component shapes fail closed; the diagnostic probe provides evidence before adding compatibility fallbacks.

Page integration selects `unsafeWindow`, Firefox `wrappedJSObject`, or the current window. When the sandbox provides `cloneInto`, the button configuration and destroy callback are cloned with function sharing. Those exported callbacks ignore page arguments and return no sandbox objects, including promises. Failure to share is contained by the existing installation boundary; no eval/injected bridge is attempted. The include glob is backed by an actual HTTPS/port-8006/top-frame guard before listeners or polling start. See [Compatibility](COMPATIBILITY.md) for platform policy and evidence limits.

### Text extraction

Physical rows are joined using `isWrapped`. Only ASCII spaces at a completed logical line's right edge and trailing empty logical rows are removed. Unicode whitespace and interior blank lines survive. Extraction limits translated columns to the terminal's current width, excluding cells retained beyond the display width after resize.

When the next row is wrapped and begins with a width-two glyph, an empty width-one final cell is an xterm wrap placeholder. That cell alone is omitted; a literal space cell is preserved. This distinction was exercised against Proxmox's pinned xterm 6.0.0 bundle. Normal/alternate buffer selection remains explicit. Missing rows remain blank lines, and non-finite/invalid lengths are rejected. This is rendered-text copying, not byte-exact terminal recording.

### Clipboard and feedback

The copy operation catches discovery, extraction, and clipboard failures at its boundary. Only fixed error messages reach feedback; transcript text and arbitrary exception content are not logged. One global pending flag prevents overlapping writes across controls. Other buttons disable during a pending write; the initiating button stays focusable and ignores repeated activation.

The adapter selects callable `GM_setClipboard`, otherwise `GM.setClipboard` with its receiver intact. Tampermonkey's legacy callback is used when `GM_info` or `GM.info` identifies that manager. A returned thenable is awaited from either API style; even modern APIs may return void, which reports dispatch without claiming completion. Selection is by availability before the write, never a fallback after failure. A five-second watchdog reports uncertainty and does not retry or cancel the manager operation. Late completion cannot replace the timeout feedback. The script does not read the OS clipboard, and a delayed manager write could still finish after a timeout.

Normal/alternate scope appears in the tooltip. One replaceable 1.5-second feedback timer per button avoids old timers resetting newer feedback. Destroyed buttons release their timer/state. Focus restoration requires the same focused button element, a focused/visible document, and the same freshly resolved terminal. It is skipped after focus or console changes.

### Lifecycle and cost

Discovery runs immediately, every 500 ms, and on visibility return. Hidden pages exit before querying components or frames. Buffer rows are read only for an explicit copy. Component-query failures disable controls and retry; failed insertions dispose of partial buttons. Integration warnings are limited to one per 30 seconds. Native ExtJS insertion and optional layout flushing own sizing; no output MutationObserver, private router hooks, or runtime libraries are introduced.

### Trust and evidence

Matching the native component and URL prevents accidental cross-console selection; it does not authenticate a hostile page. Installation must be restricted to trusted hosts. Both legacy and modern clipboard/info grants are declared for manager compatibility. [Testing](TESTING.md) separates mocks, actual parser execution, and live acceptance. [Research](RESEARCH.md) pins the upstream sources behind these choices.

## 0.3.0 baseline design (historical)

## Scope

Version 0.3.0 adds an explicit native-looking **Copy** control to supported Proxmox xterm consoles and copies terminal text from xterm's retained buffer.

The following sections describe the historical 0.3.0 source, not the current implementation above.

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
