# Project History

## Selection-driven lineage

The project previously explored a select-to-copy approach for Proxmox xterm consoles.

That approach was abandoned. The recorded task context identifies two relevant findings:

1. Firefox/browser selection behavior was incompatible with the intended xterm selection interaction for this use case.
2. A probe found that xterm `getSelection()` was already populated before `onSelectionChange()` ran.

Those findings made selection-driven copying an unsuitable foundation for the project.

## Pivot to explicit retained-buffer copying

The design pivoted to an explicit **Copy** action. Instead of trying to infer copy intent from browser/xterm selection events, the userscript:

- discovers the currently visible xterm terminal;
- reads the retained xterm buffer;
- reconstructs wrapped physical rows into logical lines;
- selects the normal retained buffer for ordinary shell use or the active alternate buffer when appropriate;
- writes the resulting text to the clipboard only when the user activates the native-looking **Copy** button.

This is the design represented by the 0.3.0 source baseline.

## 0.3.0 baseline

Version 0.3.0 includes:

- native ExtJS **Copy** button integration;
- node **Shell** support;
- LXC **Console** support;
- visible xterm discovery;
- fresh rediscovery across navigation/recreated consoles;
- full retained-buffer copying;
- wrapped-line reconstruction;
- normal-buffer scrollback handling;
- active alternate-buffer handling;
- navigation/resize resilience;
- stable button text with native ExtJS layout behavior;
- no split-button behavior.

## 0.4.0

0.4.0 remains unreleased. On 2026-09-18, development began as `0.4.0-dev.1`, following the repository review. It refines ownership, text fidelity, feedback, lifecycle behavior, and local verification. The source at commit `27a83d2ac836ef35c2f7e6644b6e448355631be0` preserves the 0.3.0 baseline. Development changes and locally executed tests are not live Proxmox acceptance; see [Testing](TESTING.md).

The same day's `0.4.0-dev.2` iteration establishes current stable Proxmox, Chrome, and Firefox as the target policy. It adds modern clipboard API selection, explicit Firefox object sharing, a userscript-context diagnostic, and a researched manager matrix while retaining one implementation. These remain development capabilities awaiting live acceptance.
