// ==UserScript==
// @name         Proxmox Copy Console
// @namespace    homelab
// @version      0.3.0
// @description  Adds a native Copy button to Proxmox xterm consoles and copies the full retained terminal buffer.
// @include      /^https\://[^/]+:8006/.*$/
// @grant        GM_setClipboard
// @grant        unsafeWindow
// @run-at       document-idle
// @noframes
// ==/UserScript==

(() => {
'use strict';

const TAG = '[PVE Copy Console]';

const SCAN_INTERVAL_MS = 500;
const FEEDBACK_DURATION_MS = 1000;

/*
 * This script runs only in the main Proxmox UI.
 * The xterm iframe is accessed from the parent page.
 */
if (window.top !== window.self) {
    return;
}

function log(...args) {
    console.log(TAG, ...args);
}

function warn(...args) {
    console.warn(TAG, ...args);
}

function isVisibleElement(element) {
    if (!element) {
        return false;
    }

    const rect = element.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
        return false;
    }

    const style = getComputedStyle(element);

    return (
        style.display !== 'none' &&
        style.visibility !== 'hidden'
    );
}

/*
 * Firefox/userscript managers can expose same-origin iframe globals
 * either directly or through wrappedJSObject.
 */
function getTerminalFromFrame(frame) {
    try {
        const candidate = frame.contentWindow?.term;

        if (
            candidate &&
            candidate.buffer &&
            typeof candidate.buffer === 'object'
        ) {
            return candidate;
        }
    } catch {
        // Try Firefox's wrapped object below.
    }

    try {
        const candidate =
            frame.contentWindow?.wrappedJSObject?.term;

        if (
            candidate &&
            candidate.buffer &&
            typeof candidate.buffer === 'object'
        ) {
            return candidate;
        }
    } catch {
        // Not an accessible xterm frame.
    }

    return null;
}

/*
 * Find the currently visible Proxmox xterm console.
 *
 * This is intentionally resolved fresh whenever needed so navigation,
 * reconnects, and recreated xterm instances do not leave us holding a
 * stale Terminal object.
 */
function findVisibleTerminal() {
    const frames = [
        ...document.querySelectorAll('iframe')
    ];

    /*
     * First pass:
     * prefer visible frames whose URL explicitly looks console-related.
     */
    for (const frame of frames) {
        if (!isVisibleElement(frame)) {
            continue;
        }

        const src = frame.getAttribute('src') || '';

        if (
            !src.includes('xtermjs=1') &&
            !src.includes('console=')
        ) {
            continue;
        }

        const term = getTerminalFromFrame(frame);

        if (term) {
            return {
                term,
                frame
            };
        }
    }

    /*
     * Fallback:
     * tolerate future Proxmox URL/markup changes by checking every
     * visible same-origin iframe for an exposed xterm instance.
     */
    for (const frame of frames) {
        if (!isVisibleElement(frame)) {
            continue;
        }

        const term = getTerminalFromFrame(frame);

        if (term) {
            return {
                term,
                frame
            };
        }
    }

    return null;
}

/*
 * Convert xterm physical buffer rows into logical text lines.
 *
 * xterm represents long wrapped output as multiple physical rows.
 * Rows marked isWrapped belong to the previous logical line and should
 * not introduce an artificial newline in the copied text.
 */
function extractBuffer(buffer) {
    if (
        !buffer ||
        typeof buffer.getLine !== 'function'
    ) {
        return null;
    }

    const lines = [];

    let logicalLine = null;

    function finishLogicalLine() {
        if (logicalLine === null) {
            return;
        }

        /*
         * Remove terminal padding at the end of the completed logical
         * line, while preserving spaces encountered inside wrapped rows.
         */
        lines.push(
            logicalLine.replace(/\s+$/u, '')
        );

        logicalLine = null;
    }

    for (let y = 0; y < buffer.length; y++) {
        const line = buffer.getLine(y);

        if (!line) {
            finishLogicalLine();

            lines.push('');
            continue;
        }

        /*
         * Keep the entire physical terminal row while reconstructing
         * wrapped logical lines. Right-side cleanup happens only after
         * the complete logical line has been assembled.
         */
        const text = line.translateToString(false);

        if (
            line.isWrapped &&
            logicalLine !== null
        ) {
            logicalLine += text;
        } else {
            finishLogicalLine();

            logicalLine = text;
        }
    }

    finishLogicalLine();

    /*
     * The terminal viewport often contains blank rows below the current
     * prompt. Strip only those trailing empty logical rows.
     *
     * Blank lines within actual console output remain intact.
     */
    while (
        lines.length > 0 &&
        lines[lines.length - 1] === ''
    ) {
        lines.pop();
    }

    return {
        text: lines.join('\n'),
        logicalLines: lines.length,
        physicalLines: buffer.length
    };
}

/*
 * Select the appropriate xterm buffer.
 *
 * Normal shell operation:
 * use the normal buffer because it contains retained scrollback.
 *
 * Alternate-screen applications such as top/nano/less:
 * use the active alternate buffer because that represents the screen
 * currently displayed to the user.
 */
function extractFullConsole(term) {
    if (!term?.buffer) {
        return null;
    }

    const isAlternate =
        term.buffer.active === term.buffer.alternate;

    const buffer = isAlternate
        ? term.buffer.active
        : (term.buffer.normal || term.buffer.active);

    const result = extractBuffer(buffer);

    if (!result) {
        return null;
    }

    return {
        ...result,
        alternateScreen: isAlternate
    };
}

function copyConsole() {
    const active = findVisibleTerminal();

    if (!active) {
        warn('No active Proxmox xterm console found');

        return {
            ok: false,
            message: 'No xterm console is active'
        };
    }

    const result = extractFullConsole(active.term);

    if (!result?.text) {
        warn('Terminal buffer is empty or unavailable');

        return {
            ok: false,
            message: 'Console buffer is empty'
        };
    }

    try {
        /*
         * Leave the clipboard type unspecified for compatibility across
         * current userscript managers.
         */
        GM_setClipboard(result.text);

        log(
            `Copied ${result.text.length} characters`,
            `logicalLines=${result.logicalLines}`,
            `bufferRows=${result.physicalLines}`,
            `alternate=${result.alternateScreen}`
        );

        return {
            ok: true,
            message:
                `Copied ${result.logicalLines} lines`
        };
    } catch (err) {
        console.error(
            TAG,
            'Clipboard write failed:',
            err
        );

        return {
            ok: false,
            message: 'Clipboard write failed'
        };
    }
}

function getButtonText(button) {
    try {
        if (typeof button.getText === 'function') {
            return String(
                button.getText() || ''
            ).trim();
        }

        return String(
            button.text || ''
        ).trim();
    } catch {
        return '';
    }
}

/*
 * Locate the visible native Proxmox toolbar control that should precede
 * our Copy button.
 *
 * Node:
 *     Shell -> Copy
 *
 * LXC:
 *     Console -> Copy
 */
function findConsoleAnchor(Ext) {
    const components =
        Ext.ComponentQuery.query('button');

    const preferredLabels = [
        'Shell',
        'Console'
    ];

    for (const label of preferredLabels) {
        for (const component of components) {
            if (
                !component ||
                component.destroyed ||
                getButtonText(component) !== label
            ) {
                continue;
            }

            try {
                if (
                    typeof component.isVisible === 'function' &&
                    !component.isVisible(true)
                ) {
                    continue;
                }
            } catch {
                continue;
            }

            let toolbar = null;

            try {
                toolbar =
                    component.up?.('toolbar') ||
                    null;
            } catch {
                continue;
            }

            if (!toolbar) {
                continue;
            }

            return {
                anchor: component,
                toolbar,
                label
            };
        }
    }

    return null;
}

/*
 * Each ExtJS toolbar may own at most one injected Copy control.
 *
 * We deliberately do not use one global Ext component ID because
 * Proxmox can keep old/hidden toolbars around while navigating.
 */
function toolbarAlreadyHasCopyButton(toolbar) {
    const items =
        toolbar?.items?.items || [];

    return items.some(
        item =>
            item &&
            !item.destroyed &&
            item.pveCopyConsoleButton === true
    );
}

/*
 * Give brief feedback without changing the button text.
 *
 * Keeping "Copy" stable prevents toolbar width/reflow changes.
 */
function showFeedback(
    button,
    result
) {
    if (
        !button ||
        button.destroyed
    ) {
        return;
    }

    const normalIcon =
        'fa fa-copy';

    const feedbackIcon =
        result.ok
            ? 'fa fa-check'
            : 'fa fa-exclamation-triangle';

    try {
        button.setIconCls(feedbackIcon);
        button.setTooltip(result.message);
    } catch {
        return;
    }

    setTimeout(() => {
        if (
            !button ||
            button.destroyed
        ) {
            return;
        }

        try {
            button.setIconCls(normalIcon);

            button.setTooltip(
                'Copy the full retained console buffer to the clipboard'
            );
        } catch {
            /*
             * The toolbar may have been destroyed during navigation.
             */
        }
    }, FEEDBACK_DURATION_MS);
}

function installForCurrentConsole() {
    /*
     * Do not put a Copy button beside arbitrary controls named Console.
     * Require an actual visible xterm terminal first.
     */
    if (!findVisibleTerminal()) {
        return;
    }

    let Ext;

    try {
        Ext = unsafeWindow.Ext;
    } catch {
        return;
    }

    if (
        !Ext ||
        !Ext.ComponentQuery ||
        typeof Ext.create !== 'function'
    ) {
        return;
    }

    const context =
        findConsoleAnchor(Ext);

    if (!context) {
        return;
    }

    const {
        anchor,
        toolbar,
        label
    } = context;

    if (toolbarAlreadyHasCopyButton(toolbar)) {
        return;
    }

    const items =
        toolbar.items?.items || [];

    const anchorIndex =
        items.indexOf(anchor);

    if (anchorIndex < 0) {
        return;
    }

    /*
     * Create a genuine ExtJS toolbar button so Proxmox owns its layout,
     * dimensions, theme, hover state, and resize behavior.
     */
    const copyButton = Ext.create(
        'Ext.button.Button',
        {
            text: 'Copy',

            iconCls:
                'fa fa-copy',

            tooltip:
                'Copy the full retained console buffer to the clipboard',

            handler: function () {
                const result =
                    copyConsole();

                showFeedback(
                    copyButton,
                    result
                );
            }
        }
    );

    /*
     * Private marker used only by this userscript.
     */
    copyButton.pveCopyConsoleButton = true;

    toolbar.insert(
        anchorIndex + 1,
        copyButton
    );

    /*
     * Ask ExtJS to recalculate the toolbar immediately.
     */
    try {
        toolbar.updateLayout?.();
    } catch {
        /*
         * ExtJS will also update naturally during its next layout pass.
         */
    }

    log(
        `Copy button installed after ${label}`
    );
}

/*
 * Proxmox creates, hides, destroys, and recreates ExtJS components while
 * navigating. Re-discovering the active console is intentionally cheap
 * and avoids coupling this userscript to private Proxmox router events.
 */
setInterval(
    installForCurrentConsole,
    SCAN_INTERVAL_MS
);

installForCurrentConsole();

})();