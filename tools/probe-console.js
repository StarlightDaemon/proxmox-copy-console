// Read-only diagnostic: paste into the TOP Proxmox page's browser devtools.
// No buffer rows, transcript text, credentials, host names, VM IDs, or full URLs
// are collected. No clipboard, network, focus, or component mutations occur.
(() => {
    'use strict';
    function visible(element) {
        if (!element?.isConnected) return false;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 &&
            style.display !== 'none' && style.visibility !== 'hidden';
    }
    function inspectFrame(frame, anchor) {
        const result = { visible: visible(frame), sameOrigin: false, identityMatches: false, terminal: 'unavailable' };
        try {
            const url = new URL(frame.contentWindow.location.href);
            result.sameOrigin = url.origin === location.origin;
            const params = url.searchParams;
            result.identityMatches = result.sameOrigin && params.get('xtermjs') === '1' &&
                !params.has('remote') && params.get('console') === anchor.consoleType &&
                params.get('node') === String(anchor.nodename) &&
                (anchor.consoleType !== 'lxc' || params.get('vmid') === String(anchor.vmid));
            for (const wrapped of [false, true]) {
                try {
                    const win = frame.contentWindow;
                    const term = (wrapped ? win?.wrappedJSObject : win)?.term;
                    const buffers = term?.buffer;
                    if (!buffers) continue;
                    result.terminal = wrapped ? 'wrapped' : 'direct';
                    result.bufferReadable = typeof buffers.active?.getLine === 'function';
                    result.alternateScreen = !!buffers.alternate && buffers.active === buffers.alternate;
                    result.retainedRows = buffers.active?.length;
                    result.columns = term.cols;
                    break;
                } catch { /* Try the other exposure path without printing exceptions. */ }
            }
        } catch {
            result.terminal = 'inaccessible';
        }
        return result;
    }
    const result = {
        probe: 'proxmox-copy-console/0.4.0-dev.2',
        topPage: window.top === window.self,
        pageVisible: !document.hidden,
        proxmoxGlobal: !!window.PVE,
        extAvailable: !!window.Ext?.ComponentQuery?.query,
        anchors: [],
    };
    try {
        const anchors = window.Ext?.ComponentQuery?.query('pveConsoleButton') || [];
        result.anchors = anchors.map(anchor => {
            try {
                const toolbar = anchor.up('toolbar');
                const root = toolbar?.ownerCt?.getEl()?.dom;
                const frames = [...(root?.querySelectorAll('iframe') || [])].map(frame => inspectFrame(frame, anchor));
                return {
                    supportedType: ['shell', 'lxc'].includes(anchor.consoleType),
                    visible: !anchor.destroyed && anchor.isVisible(true),
                    identityPresent: !!anchor.nodename && (anchor.consoleType !== 'lxc' || !!anchor.vmid),
                    ownerElement: !!root,
                    toolbarAnchorCount: anchors.filter(item => !item.destroyed && item.up('toolbar') === toolbar).length,
                    eligibleFrames: frames.filter(f => f.visible && f.identityMatches).length,
                    copyButtons: (toolbar?.items?.items || []).filter(item => !item.destroyed && item.pveCopyConsoleButton).length,
                    frames,
                };
            } catch { return { error: 'Component unavailable during probe' }; }
        });
    } catch { result.error = 'Component query unavailable'; }
    console.log(JSON.stringify(result, null, 2));
    return result;
})();
