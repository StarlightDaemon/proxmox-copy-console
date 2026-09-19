// Optional historical evidence check. Pass an exact 0.3.0 source snapshot.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fixtures = require('../tests/fixtures/baseline.json');
const { buffer, row } = require('../tests/helpers.cjs');
const source = fs.readFileSync(process.argv[2], 'utf8').replace(/\r\n/g, '\n');
// Normalized Git blob at the recorded baseline; refuse a mislabeled snapshot.
const data = Buffer.from(source);
assert.equal(createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex'),
    '624cf337bd754b6418894d5af4bc0570ae12b59d');
const window = {};
window.top = window.self = window;
const context = { window, document: { querySelectorAll: () => [] }, setInterval() {}, console };
vm.runInNewContext(source.replace(/\}\)\(\);\s*$/, 'globalThis.extract = extractBuffer;\n})();'), context);
for (const fixture of fixtures.cases) {
    const rows = fixture.rows.map(value => value && row(value.text, value.wrapped));
    assert.equal(context.extract(buffer(rows)).text, fixture.baseline, fixture.name);
}
console.log(`Confirmed ${fixtures.cases.length} output fixtures against ${fixtures.version} at ${fixtures.revision}`);
