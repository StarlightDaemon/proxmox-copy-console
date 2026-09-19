# Compatibility policy and manager survey

## Target platform

**Firefox is the primary development and acceptance browser**, reflecting the maintainer's daily homelab workflow. **Chrome is the secondary compatibility target**. Start investigation and usability checks in Firefox, especially sandbox access, clipboard behavior, keyboard focus, and navigation; verify the same behavior in Chrome before claiming cross-browser qualification. Keep one shared implementation. The maintainer approved 0.4.0 promotion after live node/LXC copy-paste testing; this does not complete the wider matrix.

Target the latest **stable Proxmox VE**, with its standard web UI and packaged xterm console, on current stable desktop **Chrome and Firefox**. As researched on 2026-09-18, the current release line is **Proxmox VE 9.2**, announced on May 21, 2026 ([official release](https://www.proxmox.com/en/about/company-details/press-releases/proxmox-virtual-environment-9-2), [downloads](https://www.proxmox.com/en/downloads/proxmox-virtual-environment)). Record the actual installed package versions; the release line alone does not identify the console bundle.

This is a rolling target, not a promise that an untested future release works. Recheck native component identity, ownership, frame exposure, and clipboard behavior after relevant upgrades. Do not add old-release shims without a demonstrated need. Firefox ESR is an additional useful test when available, not a replacement for stable Firefox. Beta/nightly browsers, preview Proxmox builds, mobile browsers, PDM, custom reverse-proxy ports, and standalone/noVNC/SPICE consoles are outside the target.

## Ten-app survey

There is no verified cross-store top-ten ranking. The survey below prioritizes full userscript managers and separately records adjacent injectors and a Safari-only manager. Store counts are rounded, store-specific snapshots observed on 2026-09-18, not total users, security endorsements, or proof of compatibility. A dash means no comparable count was recorded. Browser columns describe publisher offerings; the [maintainer's live workflow report](TESTING.md#maintainer-live-acceptance--2026-09-18) covers Firefox 156.0 (64-bit) on Proxmox VE 9.2.3. The manager is not yet identified, so the report is not assigned to a specific matrix row.

| App and primary source | Chrome | Firefox | Observed adoption signal | Project disposition |
| --- | --- | --- | --- | --- |
| [Tampermonkey](https://www.tampermonkey.net/) | Yes | Yes | [12M Chrome users](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | Primary target; shared script; identified legacy completion callback |
| [Violentmonkey](https://violentmonkey.github.io/get-it/) | Yes, stable MV3 | Yes | [1M Chrome users](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag) | Primary target; shared script; legacy dispatch may be unconfirmed |
| [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) | No offering established | Yes | 156,031 Firefox users | Extended target; modern `GM.setClipboard`; Firefox sharing adapter |
| [FireMonkey](https://addons.mozilla.org/en-US/firefox/addon/firemonkey/) | No current offering established | Yes | 1,783 Firefox users | Extended target; GM API styles and Firefox sharing adapter |
| [ScriptCat](https://docs.scriptcat.org/en/) | Yes | Yes | [100K Chrome users](https://chromewebstore.google.com/detail/scriptcat/ndcooeababalnlpkfedmmbbbgkljhpjf) | Extended target; publisher advertises GM compatibility; verify actual API completion and page access |
| [OrangeMonkey](https://chromewebstore.google.com/detail/orangemonkey/ekmeppjgajofkpiofbebgcbohbmfldaf) | Yes | No offering established | 1M Chrome users | Candidate target; publisher advertises GM APIs; require probe evidence before claiming compatibility |
| [User JavaScript and CSS](https://chromewebstore.google.com/detail/user-javascript-and-css/nbhcbdghjpllgmfilhnhkllmkecfmpld) | Yes | Not established | 200K Chrome users | Deferred injector; a matching GM clipboard/page bridge contract has not been established |
| [Custom Style Script](https://mybrowseraddon.com/custom-style-script.html) | Yes | Yes | — | Deferred injector; JS injection alone is insufficient to establish the required GM contract |
| [Custom JavaScript for Websites 2](https://chromewebstore.google.com/detail/custom-javascript-for-web/ddbjnfjiigjmcpcpkmhogomapikjbjdk) | Listed; current installability unverified | Not established | 20K Chrome users; listing last updated 2023 | Deferred; verify current-browser installability and APIs before any port |
| [Userscripts](https://github.com/quoid/userscripts) | No | No | — | Safari product; outside the requested browsers |

Six manager families produce **nine browser/manager combinations** to investigate. The additional four survey entries do not become supported simply to fill a number. Browser availability and extension maintenance must be rechecked at the time of testing, using the publisher's stable installation links.

## One script, small compatibility adapters

Version `0.4.0`, promoted from the unchanged `0.4.0-dev.2` runtime, keeps one installable source:

- Choose callable `GM_setClipboard` when available; otherwise call `GM.setClipboard` with its receiver intact. Declare both clipboard and manager-info grant styles. There is one write attempt per activation, with no retry through another API.
- Use Tampermonkey's known legacy callback only when identified. Await an actual returned thenable on either API. A modern API name does not imply a promise: [Greasemonkey documents a void return](https://wiki.greasespot.net/GM.setClipboard). Void dispatch remains explicitly unconfirmed.
- Access page globals through `unsafeWindow`, or Firefox's `wrappedJSObject`, or the current window. When `cloneInto` is available, share button configuration and lifecycle callbacks explicitly. Shared callbacks accept no page data and return no privileged objects. This follows [Mozilla's cross-compartment model](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts) and [FireMonkey's documented sharing APIs](https://erosman.github.io/firemonkey/src/content/help.html).
- Use the portable `https://*:8006/*` include glob, plus an actual protocol/port/top-frame check before startup. Replace the broad include with trusted host rules in each manager. Globs can overmatch URL paths; the runtime check is deliberate. No broad extra `@match` rule is added.

No manager-specific copies are needed for the currently identified API differences. If live testing establishes a metadata-only incompatibility, generate that variant from the shared source and check it for drift. Consider a separate page-context/native-clipboard edition only if a requested injector warrants it: it would need its own user-activation, permission, and CSP acceptance tests. Do not silently fall back to native clipboard APIs, inject an eval bridge, weaken CSP, or force page injection to make a test pass.

## Installation and diagnosis

Install one script version in one manager per test profile. Use each publisher's stable distribution; do not install an old MV2 Chrome package to emulate current Chrome. Chrome may require enabling the extension's **Allow User Scripts** setting and granting access to the trusted host; consult the [manager's current setup instructions](https://docs.scriptcat.org/en/docs/use/open-dev/). Keep the default injection mode initially and record any changes.

First run the optional [manager probe](../tools/probe-manager.user.js) as a **separate temporary userscript** with the same trusted-host restrictions as the main script. It requests the same integration grants but never calls clipboard APIs. Reload the main Proxmox page and inspect its JSON console output, then disable/remove the probe. Do not paste it into page devtools: that would observe the wrong execution context. It reports API presence and page-global visibility only, not successful cloning, permission, clipboard writes, or timing recovery. Missing page globals at document-idle may also reflect delayed page initialization.

Then use the [page structure probe](../tools/probe-console.js) in top-page devtools after opening each console. Its output answers a different question: whether Proxmox exposes the expected component/frame structure. Neither probe reads terminal rows or sends data anywhere. Record extension and browser versions manually from their own UI.

## Live test priority and evidence

Reported workflow pass: Firefox 156.0 (64-bit), Proxmox VE 9.2.3, script 0.4.0-dev.2, multiple node Shell and LXC consoles. Browser/Proxmox versions are screenshot-backed; copy/paste results are maintainer-reported. Manager identity/version is pending. The rows below track complete per-manager qualification, not this narrower workflow result.

| Priority | Combination | Status |
| --- | --- | --- |
| 1 | Firefox stable + Tampermonkey stable | Pending |
| 1 | Firefox stable + Violentmonkey stable | Pending |
| 2 | Chrome stable + Tampermonkey stable | Pending |
| 2 | Chrome stable + Violentmonkey stable MV3 | Pending |
| 3 | Firefox stable + Greasemonkey stable | Pending |
| 3 | Firefox stable + FireMonkey stable | Pending |
| 3 | Firefox stable + ScriptCat stable | Pending |
| 3 | Chrome stable + ScriptCat stable | Pending |
| 4 | Chrome stable + OrangeMonkey stable | Pending |

For each combination, run both probes and the full [live acceptance sequence](TESTING.md#remaining-live-acceptance-plan) for node Shell and LXC. In particular, verify plain-text clipboard contents by pasting, Firefox callback invocation/destruction, reconnect/navigation, keyboard focus, and blocked clipboard behavior. Record a separate result per combination; a passing mock cannot promote a row. Pass all four priority-one and priority-two combinations before claiming full primary browser/manager qualification, and retain explicit pending/failed labels on unaccepted extended targets. The 0.4.0 promotion decision is recorded separately in Testing. Browser preference does not establish a preferred manager; start with the maintainer's installed Firefox manager when that is known.

For every tested Proxmox update, record `pve-manager` and `pve-xtermjs` versions. The pinned parser fixture in this repository is reproducible upstream-source evidence, not proof that every stable 9.2 installation ships those exact bytes. Refresh or add a fixture when an observed packaged console change warrants it; never fetch a floating latest bundle into tests automatically.
