const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { consoleView, host } = require('./helpers.cjs');

test('manager probe observes sandbox capabilities without invoking integration or clipboard APIs', () => {
    const h = host({ manager: null, clipboard: null, globals: { GM: {
        info: { scriptHandler: 'Greasemonkey' },
        setClipboard() { throw Error('must not write'); },
    }, cloneInto() { throw Error('must not clone'); } } });
    const logs = [];
    h.context.console = { log: text => logs.push(text) };
    h.Ext.create = h.Ext.ComponentQuery.query = () => { throw Error('must not invoke Ext'); };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'tools', 'probe-manager.user.js'), 'utf8'), h.context);
    const report = JSON.parse(logs[0]);
    assert.equal(report.manager, 'Greasemonkey');
    assert.equal(report.legacyClipboard, false);
    assert.equal(report.modernClipboard, true);
    assert.equal(report.cloneInto, true);
    assert.equal(report.proxmoxGlobal, true);
    assert.equal(report.extQuery, true);
    assert.equal(report.error, undefined);
    assert.equal(logs[0].includes('pve.example'), false);
});

test('diagnostic probe reports structure without reading or leaking console content/identity', () => {
    const view = consoleView({ node: 'private-host', vmid: 987654, text: 'SECRET TRANSCRIPT' });
    view.term.buffer.normal.getLine = () => { throw Error('probe must not read rows'); };
    const h = host({ views: [view] });
    h.context.window.Ext = h.Ext;
    h.context.window.PVE = {};
    const logs = [];
    h.context.console = { log: text => logs.push(text) };
    const report = vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'tools', 'probe-console.js'), 'utf8'), h.context);
    assert.equal(report.anchors[0].eligibleFrames, 1);
    assert.equal(report.anchors[0].frames[0].bufferReadable, true);
    const output = logs.join('');
    for (const secret of ['private-host', '987654', 'SECRET TRANSCRIPT', 'pve.example']) assert.equal(output.includes(secret), false);
    assert.equal(h.copied.length, 0);
    assert.equal(view.term.focused, 0);
});
