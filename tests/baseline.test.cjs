const { test } = require('node:test');
const assert = require('node:assert/strict');
const fixtures = require('./fixtures/baseline.json');
const { host, buffer, row } = require('./helpers.cjs');
for (const fixture of fixtures.cases) {
    test(`0.3.0 comparison: ${fixture.name}`, () => {
        const rows = fixture.rows.map(value => value && row(value.text, value.wrapped));
        assert.equal(host().api.extractBuffer(buffer(rows)).text, fixture.current);
    });
}
