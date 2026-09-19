// ==UserScript==
// @name         Proxmox Copy Console - manager probe
// @namespace    homelab
// @version      0.4.0-dev.2
// @description  Temporary read-only userscript-context capability report. No clipboard calls or terminal text.
// @include      https://*:8006/*
// @grant        GM_setClipboard
// @grant        GM_info
// @grant        GM.setClipboard
// @grant        GM.info
// @grant        unsafeWindow
// @run-at       document-idle
// @noframes
// @license      MIT
// ==/UserScript==

(() => {
    'use strict';
    if (window.top !== window.self || location.protocol !== 'https:' || location.port !== '8006') return;
    const report = { probe: 'proxmox-copy-console/manager/0.4.0-dev.2' };
    try {
        const modern = typeof GM !== 'undefined' ? GM : undefined;
        const info = typeof GM_info !== 'undefined' ? GM_info : modern?.info;
        const known = ['Tampermonkey', 'Violentmonkey', 'Greasemonkey', 'FireMonkey', 'ScriptCat', 'OrangeMonkey'];
        report.manager = known.includes(info?.scriptHandler) ? info.scriptHandler : 'Other/unknown';
        report.legacyClipboard = typeof GM_setClipboard === 'function';
        report.modernClipboard = typeof modern?.setClipboard === 'function';
        report.cloneInto = typeof cloneInto === 'function';
        report.pagePath = typeof unsafeWindow !== 'undefined' ? 'unsafeWindow' :
            (window.wrappedJSObject ? 'wrappedJSObject' : 'window');
        const page = typeof unsafeWindow !== 'undefined' ? unsafeWindow : (window.wrappedJSObject || window);
        report.proxmoxGlobal = !!page.PVE;
        report.extQuery = typeof page.Ext?.ComponentQuery?.query === 'function';
        report.extCreate = typeof page.Ext?.create === 'function';
        // Inspect availability only: do not query components, clone objects,
        // export callbacks, read buffer rows, or exercise clipboard permissions.
    } catch {
        report.error = 'Userscript integration unavailable';
    }
    console.log(JSON.stringify(report, null, 2));
})();
