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

function integrationProbe(h) {
    const logs = [];
    h.context.console = { log: text => logs.push(text) };
    h.Ext.create = () => { throw Error('probe must not create UI'); };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'tools', 'probe-manager.user.js'), 'utf8'), h.context);
    assert.equal(logs.length, 1);
    h.advance(5000);
    assert.equal(logs.length, 2);
    return { detail: JSON.parse(logs[1]), output: logs.join('\n') };
}

test('delayed manager probe exercises discovery without clipboard, terminal, or UI mutation', () => {
    const view = consoleView({ node: 'private-host', vmid: 987654, text: 'SECRET TRANSCRIPT' });
    const h = host({ views: [view] });
    const before = view.toolbar.items.items.slice();
    view.term.buffer.normal.getLine = () => { throw Error('must not read rows'); };
    h.context.cloneInto = (value, target, options) => {
        assert.equal(target, h.context.unsafeWindow);
        if (value.handler) assert.equal(options.cloneFunctions, true);
        return { ...value };
    };
    const { detail, output } = integrationProbe(h);
    assert.equal(detail.checks.clonePlain.ok, true);
    assert.equal(detail.checks.cloneCallback.ok, true);
    assert.equal(detail.checks.query.ok, true);
    assert.equal(detail.anchors[0].singleAnchor, true);
    assert.equal(detail.anchors[0].hasFrames, true);
    assert.deepEqual(view.toolbar.items.items, before);
    assert.equal(h.copied.length, 0);
    assert.equal(view.term.focused, 0);
    assert.equal(h.timers.size, 0, 'one delayed pass, no ongoing timer');
    for (const secret of ['private-host', '987654', 'SECRET TRANSCRIPT', 'pve.example']) {
        assert.equal(output.includes(secret), false);
    }
});

test('delayed probe isolates callback failures and redacts exception messages', () => {
    const view = consoleView();
    const h = host({ views: [view] });
    h.context.cloneInto = () => { throw TypeError('PRIVATE CLONE DETAIL'); };
    h.anchors.filter = () => { throw TypeError('PRIVATE FILTER DETAIL'); };
    view.toolbar.items.items.some = () => { throw TypeError('PRIVATE SOME DETAIL'); };
    const { detail, output } = integrationProbe(h);
    assert.equal(detail.checks.cloneCallback.ok, false);
    assert.equal(detail.checks.query.ok, true);
    assert.equal(detail.anchors[0].checks.anchorFilter.error, 'TypeError');
    assert.equal(detail.anchors[0].checks.buttonSome.error, 'TypeError');
    assert.equal(detail.anchors[0].checks.ownerFrames.ok, true);
    assert.equal(output.includes('PRIVATE'), false);
});

test('delayed probe contains query errors with inaccessible exception properties', () => {
    const h = host();
    h.Ext.ComponentQuery.query = () => {
        throw Object.defineProperty({}, 'name', { get() { throw Error('private'); } });
    };
    const { detail, output } = integrationProbe(h);
    assert.equal(detail.checks.query.ok, false);
    assert.equal(detail.checks.query.error, 'Other');
    assert.equal(detail.anchors.length, 0);
    assert.equal(output.includes('private'), false);
});
