# Changelog

## 0.4.1-dev.1 — unreleased

- Address FireMonkey's observed rejection of sandbox callbacks passed to page-owned array `filter`/`some` methods by using local loops for anchor counting and duplicate-button checks.
- When available, use Firefox `exportFunction` for no-argument/no-return handlers and clone configuration data separately. Preserve the existing clone-functions path for managers without that API.
- Keep the shared script, permissions, clipboard behavior, and installation scope. Add regression cases for strict callback boundaries and export failure containment. FireMonkey and Firefox/Violentmonkey live acceptance remain pending; stable 0.4.0 is unchanged on main.

## 0.4.0 — 2026-09-19

- Promote the unchanged runtime from `0.4.0-dev.2` after the maintainer reported successful live copy/paste across several node Shell and LXC consoles, with expected text detail and correct current-console targeting.
- Promotion changes the version and release description only; no copying behavior, permissions, dependencies, or installation scope changes.
- Retain explicit evidence limits: this is a maintainer-reported workflow acceptance, not completion of the full browser/manager and edge-case matrix. See [Testing](docs/TESTING.md) for the report and remaining checks.

## Earlier development — 0.4.0-dev.2 (unreleased)

- Target current stable Proxmox VE, Chrome, and Firefox; document a ten-app survey and nine browser/manager test combinations, with all live results pending.
- Add modern `GM.setClipboard` / `GM.info` capability support while retaining legacy manager APIs. Never retry a failed write through a second API.
- Add Firefox configuration/callback sharing when `cloneInto` is available; shared callbacks do not return privileged objects.
- Use a portable include glob with a runtime HTTPS/8006/top-frame guard and document trusted-host restrictions.
- Add a separate read-only manager-context probe and compatibility regression coverage. Keep one dependency-free userscript; no manager-specific forks or native clipboard fallback.

## Earlier development — 0.4.0-dev.1 (unreleased)

Development implementation only; live Proxmox/browser/userscript-manager acceptance is outstanding. The documented 0.3.0 baseline remains at commit `27a83d2ac836ef35c2f7e6644b6e448355631be0`.

- Associate each Copy button with its own console owner and exact node/type/guest identity; refuse ambiguous frames and unsupported remote consoles.
- Discover native console controls by component type instead of English labels.
- Catch extraction/integration failures, clean up partial controls, and rate-limit integration warnings without logging terminal content or raw errors.
- Preserve Unicode whitespace and omit xterm's empty last-column placeholder when a wide glyph wraps; retain the existing ASCII-padding policy.
- Distinguish clipboard completion from legacy unconfirmed dispatch, handle promises/callbacks/errors/timeouts, and prevent overlapping copy requests.
- Show normal/alternate buffer scope, replace feedback timers, disable unavailable controls, and conservatively restore terminal focus.
- Skip hidden-page discovery and rescan on visibility return; retain 500 ms periodic recovery.
- Add dependency-free Node checks, regression fixtures, a pinned real-xterm probe, a read-only live diagnostic, and CI configuration.
- Add editor/line-ending conventions and trusted-host installation guidance. No runtime dependencies or automatic update URLs were added.

## 0.3.0 — Documented baseline

- Added a native ExtJS **Copy** button for supported Proxmox xterm consoles.
- Supported node **Shell** and LXC **Console** toolbar integration.
- Added visible xterm discovery with fresh rediscovery to tolerate navigation, reconnects, and recreated console instances.
- Copied the full retained normal buffer, including scrollback.
- Reconstructed xterm wrapped physical rows into logical text lines.
- Used the active alternate buffer when an alternate-screen application is active.
- Preserved stable **Copy** button text while using icon and tooltip changes for brief feedback.
- Used native ExtJS layout behavior rather than split-button or custom layout behavior.
