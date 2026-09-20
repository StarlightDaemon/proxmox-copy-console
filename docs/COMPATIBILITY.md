# Compatibility policy and manager survey

## Target platform

Maintainer priority, clarified 2026-09-19: **Firefox + Violentmonkey** is the primary daily-use combination. Keep a shared script when small compatibility changes suffice. Chrome is the representative Chromium browser for later testing; other Chromium browsers are expected-compatible by policy but unverified unless exercised. Do not add routine derivative-browser test matrices without a concrete issue.

**Firefox is the primary development and acceptance browser**, reflecting the maintainer's daily homelab workflow. **Chrome is the secondary compatibility target**. Start investigation and usability checks in Firefox, especially sandbox access, clipboard behavior, keyboard focus, and navigation; verify the same behavior in Chrome before claiming cross-browser qualification. Keep one shared implementation. The maintainer approved 0.4.0 promotion after live node/LXC copy-paste testing; this does not complete the wider matrix.

Target the latest **stable Proxmox VE**, with its standard web UI and packaged xterm console, on current stable desktop **Chrome and Firefox**. As researched on 2026-09-18, the current release line is **Proxmox VE 9.2**, announced on May 21, 2026 ([official release](https://www.proxmox.com/en/about/company-details/press-releases/proxmox-virtual-environment-9-2), [downloads](https://www.proxmox.com/en/downloads/proxmox-virtual-environment)). Record the actual installed package versions; the release line alone does not identify the console bundle.

This is a rolling target, not a promise that an untested future release works. Recheck native component identity, ownership, frame exposure, and clipboard behavior after relevant upgrades. Do not add old-release shims without a demonstrated need. Firefox ESR is an additional useful test when available, not a replacement for stable Firefox. Beta/nightly browsers, preview Proxmox builds, mobile browsers, PDM, custom reverse-proxy ports, and standalone/noVNC/SPICE consoles are outside the target.

## Ten-app survey

Historical survey, not an active test queue: after the primary Chrome workflow passes on 2026-09-19, the maintainer deferred further testing outside Firefox/Chrome with Violentmonkey/Tampermonkey. Existing extended-manager results remain valid within their recorded limits. Revisit additional managers only on request or for a demonstrated copying issue.

There is no verified cross-store top-ten ranking. The survey below prioritizes full userscript managers and separately records adjacent injectors and a Safari-only manager. Store counts are rounded, store-specific snapshots observed on 2026-09-18, not total users, security endorsements, or proof of compatibility. A dash means no comparable count was recorded. Browser columns describe publisher offerings; the [maintainer's live workflow report](TESTING.md#maintainer-live-acceptance--2026-09-18) covers Firefox 156.0 (64-bit) with Violentmonkey 2.49.0 on Proxmox VE 9.2.3. The corresponding matrix row records this workflow pass without claiming full scenario coverage.

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

Stable **0.4.1** preserves the tested 0.4.1-dev.1 runtime: local loops replace page-array callbacks, and configuration cloning is separate from function export where `exportFunction` exists. All four primary browser/manager combinations have maintainer-reported practical passes. The adapter description below records the retained 0.4.0 foundation.

Version `0.4.0`, promoted from the unchanged `0.4.0-dev.2` runtime, keeps one installable source:

- Choose callable `GM_setClipboard` when available; otherwise call `GM.setClipboard` with its receiver intact. Declare both clipboard and manager-info grant styles. There is one write attempt per activation, with no retry through another API.
- Use Tampermonkey's known legacy callback only when identified. Await an actual returned thenable on either API. A modern API name does not imply a promise: [Greasemonkey documents a void return](https://wiki.greasespot.net/GM.setClipboard). Void dispatch remains explicitly unconfirmed.
- Access page globals through `unsafeWindow`, or Firefox's `wrappedJSObject`, or the current window. When `cloneInto` is available, share button configuration and lifecycle callbacks explicitly. Shared callbacks accept no page data and return no privileged objects. This follows [Mozilla's cross-compartment model](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts) and [FireMonkey's documented sharing APIs](https://erosman.github.io/firemonkey/src/content/help.html).
- Use the portable `https://*:8006/*` include glob, plus an actual protocol/port/top-frame check before startup. Replace the broad include with trusted host rules in each manager. Globs can overmatch URL paths; the runtime check is deliberate. No broad extra `@match` rule is added.

No manager-specific copies are needed for the currently identified API differences. If live testing establishes a metadata-only incompatibility, generate that variant from the shared source and check it for drift. Consider a separate page-context/native-clipboard edition only if a requested injector warrants it: it would need its own user-activation, permission, and CSP acceptance tests. Do not silently fall back to native clipboard APIs, inject an eval bridge, weaken CSP, or force page injection to make a test pass.

## Installation and diagnosis

Install one script version in one manager per test profile. Use each publisher's stable distribution; do not install an old MV2 Chrome package to emulate current Chrome. Chrome may require enabling the extension's **Allow User Scripts** setting and granting access to the trusted host; consult the [manager's current setup instructions](https://docs.scriptcat.org/en/docs/use/open-dev/). Keep the default injection mode initially and record any changes.

Run the optional [manager probe](../tools/probe-manager.user.js) as a **separate temporary userscript** with the same trusted-host restrictions as the main script. It requests the same integration grants but never calls clipboard APIs. Reload the main Proxmox page and inspect its JSON console output, then disable/remove the probe. Do not paste it into page devtools: that would observe the wrong execution context. Revision 2 prints immediate API availability followed by one integration report after five seconds. The second report tests disposable plain-object/callback cloning and component discovery, including page-array callbacks, with fixed stage names and redacted errors. It creates no UI, attaches no listeners, and reads no terminal rows. Successful checks do not establish ExtJS button creation, page-origin callback invocation, clipboard permission, or timing recovery. Keep the intended console open during the delay; missing components may reflect delayed page initialization.

Then use the [page structure probe](../tools/probe-console.js) in top-page devtools after opening each console. Its output answers a different question: whether Proxmox exposes the expected component/frame structure. Neither probe reads terminal rows or sends data anywhere. Record extension and browser versions manually from their own UI.

## Live test priority and evidence

Reported passes in the Firefox 156.0 (64-bit) / Proxmox VE 9.2.3 test round: **Violentmonkey 2.49.0** and **Tampermonkey 5.5.0**, both using script **0.4.0-dev.2**. Screenshots establish version details; the maintainer reports successful copy/paste across nodes and LXC consoles with Violentmonkey, and fully tested/working with no issues under Tampermonkey. See Testing for the evidence boundaries and unrecorded scenario details.

Current test round (maintainer preference, 2026-09-19): **operator-run Chrome testing** after canceling the computer-control attempt. Chrome + Tampermonkey and Chrome + Violentmonkey both have reported candidate workflow passes. Chrome is reported as the latest official public-channel build; exact browser/manager versions remain pending. Preserve the earlier Firefox results separately; The final Firefox + Tampermonkey candidate regression is now reported successful; additional-manager testing is deferred.

For each manager, keep the same script version and benign output, enable only one manager/script installation for the Proxmox site at a time, and apply the same trusted-host restrictions. Run this short workflow check first:

1. Open node Shell and LXC Console; check for exactly one Copy button in each supported view.
2. Copy/paste retained output containing scrollback, blank lines, and a long wrapped line into a scratch plain-text destination; compare the actual text.
3. Navigate between nodes and containers, copy distinct benign text, and confirm the currently intended console is selected.
4. Repeat Copy, reload/reopen the console, and check recovery, feedback, and keyboard focus.
5. Record date, script version, browser/manager versions, Proxmox version, observed result, and any failure. Mark this as a workflow pass; use Testing for the fuller edge-case qualification.

| Priority | Combination | Status |
| --- | --- | --- |
| 1 | Firefox stable + Tampermonkey stable | Workflow passed on dev.2 and candidate 0.4.1-dev.1. In response to the final Firefox/Tampermonkey check, the maintainer reports running all requested tests without issues. Earlier screenshot: Tampermonkey 5.5.0; final run versions were not independently restated |
| 1 | Firefox stable + Violentmonkey stable | Workflow passed on dev.2 and candidate 0.4.1-dev.1: maintainer reports shell/container copying and dynamic switching work without issues. Established environment: Firefox 156.0 (64-bit), Violentmonkey 2.49.0, Proxmox VE 9.2.3; full scenario qualification pending |
| 2 | Firefox stable + Greasemonkey stable | Functional pass, maintainer-reported: Greasemonkey 4.14 with candidate 0.4.1-dev.1 in the Firefox test round. Recurring UI exceptions coexist with working copying and also occurred in the earlier scripts-disabled profile; cause and full scenario qualification remain open |
| 2 | Firefox stable + FireMonkey stable | Stable workflow failed: 3.8 shows no Copy button. Candidate 0.4.1-dev.1: maintainer reports Copy worked with probe disabled. ExtJS fireFn/timerId and loadTags errors also appear in the supplied scripts-disabled baseline; candidate-specific cause not established. Full scenario qualification pending; popup port-matching issue remains separate |
| 2 | Firefox stable + ScriptCat stable | Deferred by maintainer; no additional-manager testing currently planned |
| 3 | Chrome stable + Tampermonkey stable | Workflow passed, maintainer-reported: candidate 0.4.1-dev.1 Copy button, menu navigation, and leaving/returning to the site worked with no observed functional issues. Exact Chrome/manager versions and full scenario qualification pending; see Testing for screenshot notices |
| 3 | Chrome stable + Violentmonkey stable MV3 | Workflow passed, maintainer-reported: all testing with candidate 0.4.1-dev.1 went fine without issue. Latest official public-channel Chrome reported; numeric browser/manager versions, installed manifest, and full scenario qualification remain unrecorded. Same form/unload issue categories as the Tampermonkey run |
| 4 | Chrome stable + ScriptCat stable | Deferred by maintainer for this round |
| 4 | Chrome stable + OrangeMonkey stable | Deferred by maintainer for this round |

For full qualification of a combination, run both probes and the [remaining live acceptance sequence](TESTING.md#remaining-live-acceptance-plan) for node Shell and LXC. In particular, verify plain-text clipboard contents by pasting, Firefox callback invocation/destruction, reconnect/navigation, keyboard focus, and blocked clipboard behavior. Record a separate result per combination; a passing mock cannot promote a row. Pass the four Tampermonkey/Violentmonkey combinations across Firefox and Chrome before claiming full primary browser/manager qualification, and retain explicit pending/failed labels on unaccepted extended targets. This broader goal does not block recording individual workflow passes. The 0.4.0 promotion decision is recorded separately in Testing.

For every tested Proxmox update, record `pve-manager` and `pve-xtermjs` versions. The pinned parser fixture in this repository is reproducible upstream-source evidence, not proof that every stable 9.2 installation ships those exact bytes. Refresh or add a fixture when an observed packaged console change warrants it; never fetch a floating latest bundle into tests automatically.
