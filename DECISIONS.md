# Decisions

This file records durable decisions represented by the 0.3.0 baseline. Future ideas are not accepted merely because they are listed as possible 0.4.0 work.

## Accepted for 0.3.0

### Use explicit full-buffer copying instead of selection-driven copying

**Decision:** Copy terminal content only when the user activates the dedicated **Copy** control, and derive the copied text from xterm's retained buffer.

**Rationale:** The earlier select-to-copy lineage exposed browser/Firefox selection incompatibility with the xterm interaction model. A probe also found that xterm `getSelection()` was already populated before `onSelectionChange()` ran. The project therefore stopped using selection events as the copying foundation.

### Integrate through native ExtJS controls

**Decision:** Insert a real `Ext.button.Button` immediately after the visible Proxmox **Shell** or **Console** control.

**Rationale:** Proxmox then owns button dimensions, theme, hover behavior, and toolbar layout. Button text remains **Copy** so feedback does not cause width/reflow changes.

### Rediscover the active terminal instead of retaining one terminal reference

**Decision:** Resolve the visible xterm terminal fresh when needed and periodically re-evaluate installation state.

**Rationale:** Proxmox can create, hide, destroy, and recreate console frames/components while navigating. Fresh discovery avoids relying on a stale terminal object.

### Reconstruct logical lines from the retained xterm buffer

**Decision:** Read physical buffer rows, concatenate rows marked `isWrapped`, trim right-side padding only after a logical line is complete, and remove only trailing empty logical rows.

### Distinguish normal and alternate buffers

**Decision:** Use the normal buffer for ordinary shell operation so retained scrollback is included. When the alternate buffer is active, copy that active alternate buffer because it represents the current alternate-screen display.

## Deferred / future

0.4.0 remains future, unreleased work. No experimental 0.4.0 behavior is accepted by this document, and the 0.3.0 baseline must not silently absorb such changes.
