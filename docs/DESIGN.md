# Design

This describes stable **0.4.1**. The [historical design](historicals/DESIGN.md) preserves the 0.3.0 baseline and the development sequence. [Decisions](../DECISIONS.md) records the rationale.

## Scope and console ownership

One directly installable userscript adds one native ExtJS Copy button beside the relevant node Shell or LXC Console control. There are no runtime dependencies, server changes, network requests, or transcript storage.

The manager's include rule selects eligible pages. A runtime guard also requires HTTPS, port 8006, and the top-level page. Restrict installation to trusted hosts: page globals are integration points, not authentication.

Discovery queries native `pveConsoleButton` components and uses their console type, node, and guest identity rather than translated labels. It searches iframe descendants of the toolbar owner's element. The loaded frame URL must be same-origin and match the console identity and `xtermjs=1`; remote-console parameters are excluded. Exactly one eligible terminal and one native anchor per toolbar are required.

The terminal is resolved again on every copy. Unavailable or ambiguous contexts disable the button instead of falling back to another console. State retains the toolbar/button, not a long-lived terminal reference.

## Text extraction

Ordinary shell copies use the retained normal buffer, including scrollback. An active alternate screen contributes that buffer instead.

Rows marked `isWrapped` are joined into logical lines. Extraction uses the terminal's current display width and public buffer/cell APIs. An empty final cell before a wrapped width-two glyph is omitted as a wrap placeholder; literal spaces remain. Interior blank lines and Unicode whitespace survive. Completed-line trailing ASCII spaces and trailing empty rows are removed.

This captures retained rendered text, not a lossless session recording. Discarded scrollback and terminal reflow losses cannot be recovered.

## Browser and manager integration

Page access uses `unsafeWindow`, Firefox's `wrappedJSObject`, or the current window. Terminal access supports direct and wrapped frame globals. Local loops avoid sending sandbox callbacks into page-owned array methods.

Where available, `cloneInto` shares configuration data and `exportFunction` separately shares handlers. Otherwise the existing function-cloning path is used. Exported callbacks ignore page arguments and return no privileged objects or promises. Sharing failures are contained; no injected/eval bridge or weaker-permission fallback is attempted.

The source declares legacy and modern clipboard/manager-info grants plus `unsafeWindow`. One shared implementation serves the primary browser/manager combinations.

## Clipboard and feedback

Select callable `GM_setClipboard`, otherwise `GM.setClipboard` with its receiver intact. Use the legacy completion callback only for identified Tampermonkey; await returned promises from either API style. A void return reports unconfirmed dispatch. The script never reads the OS clipboard back or retries through another API.

One pending flag prevents overlapping writes. The initiating button remains focusable but ignores repeated activation; other controls disable. A five-second watchdog reports uncertainty without canceling a possible late write. Late completion cannot overwrite timeout feedback.

Icons/tooltips show buffer scope and outcome without changing the Copy label. Feedback resets after 1.5 seconds. Focus returns only when the same button still has focus and the same terminal is active in a focused, visible document. Destroyed controls release their state and timers. Fixed error messages never include transcript text or arbitrary exception contents.

## Lifecycle and maintenance

Discovery runs immediately, every 500 ms while visible, and on visibility return. Idle scans never extract terminal rows. Failed integration retries with warnings limited to once per 30 seconds; partial controls are disposed of. ExtJS owns layout and appearance.

Keep the runtime below its 20 KiB review ceiling and add complexity only for demonstrated copying problems. [Testing](TESTING.md) separates mocked contracts, real-parser checks, CI, and live reports. Pinned upstream sources and experiments remain in [historical research](historicals/RESEARCH.md).
