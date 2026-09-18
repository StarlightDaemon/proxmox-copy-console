# Testing

## Evidence classes

The 0.3.0 foundation can be inspected statically from the userscript source, but important behavior requires runtime/manual verification in a real Proxmox environment.

The GitHub-only foundation task did **not** run local tests, execute the userscript, modify a Proxmox host, or perform manual browser acceptance.

## Static/source inspection

Source inspection can verify that the 0.3.0 implementation contains logic for:

- userscript metadata version `0.3.0`;
- main-page-only execution;
- visible iframe filtering;
- direct and `wrappedJSObject` terminal discovery;
- URL-preferred discovery with a visible-frame fallback;
- fresh terminal rediscovery;
- normal versus alternate xterm buffer selection;
- full buffer-row iteration;
- wrapped-row reconstruction using `isWrapped`;
- trailing blank-row cleanup;
- `GM_setClipboard` clipboard flow;
- native ExtJS button creation;
- **Shell** then **Console** anchor preference;
- one injected Copy button per toolbar;
- stable **Copy** button text with icon/tooltip feedback;
- periodic rescanning for navigation/component lifecycle changes.

Static inspection does not prove those paths work against a particular Proxmox/browser/userscript-manager combination.

## Runtime/manual acceptance scenarios

The following scenarios should be exercised against the 0.3.0 baseline.

### Node Shell

- Open a node **Shell**.
- Verify one **Copy** button appears immediately after **Shell**.
- Verify the control has native ExtJS layout/appearance.
- Generate output longer than the visible viewport.
- Copy and verify retained scrollback is included.

### LXC Console

- Open an LXC **Console**.
- Verify one **Copy** button appears immediately after **Console**.
- Verify copied content corresponds to the active LXC terminal.

### Wrapped lines

- Produce terminal output that wraps across multiple physical xterm rows.
- Copy the buffer.
- Verify wrapped rows are reconstructed into logical lines without artificial newlines.
- Verify interior spacing is retained and only completed-line right padding is removed.

### Blank lines and viewport padding

- Include meaningful blank lines in terminal output.
- Verify those interior blank lines remain.
- Verify empty rows below the final content are not appended to the clipboard text.

### Alternate screen

- Enter an alternate-screen program such as `top`, `nano`, or `less`.
- Verify copying uses the active alternate buffer.
- Exit the application and verify ordinary shell copying returns to the retained normal buffer.

### Navigation and reconnection

- Navigate between supported console views.
- Reconnect or otherwise cause a console/xterm instance to be recreated.
- Verify the button is installed for the newly active console.
- Verify copying uses the current terminal rather than a stale object.

### Resize

- Resize the browser/console area.
- Verify ExtJS retains normal toolbar layout.
- Verify **Copy** text remains stable and copying still targets the visible terminal.

### Multiple/hidden frames

- Where Proxmox retains hidden console frames/components, verify the script chooses the visible xterm and does not install beside unrelated controls named **Console**.

### Feedback and error handling

- Verify successful copy temporarily changes icon/tooltip and then restores them.
- Verify button text never changes from **Copy**.
- Verify an unavailable/empty terminal and clipboard failure are reported without creating split-button behavior or persistent layout changes.

## Not yet established by this repository foundation

Unless separately recorded by later evidence, this foundation does not claim:

- automated browser tests;
- a local test suite result;
- runtime compatibility across specific Proxmox releases;
- runtime compatibility across specific Firefox/userscript-manager releases;
- manual Proxmox acceptance;
- 0.4.0 behavior.
