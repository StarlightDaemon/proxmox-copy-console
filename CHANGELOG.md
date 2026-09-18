# Changelog

## Unreleased

- 0.4.0 remains planned future work.
- No 0.4.0 experimental behavior is part of the current baseline.

## 0.3.0 — Current documented baseline

- Added a native ExtJS **Copy** button for supported Proxmox xterm consoles.
- Supported node **Shell** and LXC **Console** toolbar integration.
- Added visible xterm discovery with fresh rediscovery to tolerate navigation, reconnects, and recreated console instances.
- Copied the full retained normal buffer, including scrollback.
- Reconstructed xterm wrapped physical rows into logical text lines.
- Used the active alternate buffer when an alternate-screen application is active.
- Preserved stable **Copy** button text while using icon and tooltip changes for brief feedback.
- Used native ExtJS layout behavior rather than split-button or custom layout behavior.
