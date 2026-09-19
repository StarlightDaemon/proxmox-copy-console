// Development fixture only. The userscript never loads or downloads this file.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const revision = '89075b05773a2b6c380175dde3f8a4472a5ab506';
const expectedBlob = 'e47e2ddd2c3d71e006008a9a948aacf64cade1d6';
const url = `https://raw.githubusercontent.com/proxmox/pve-xtermjs/${revision}/xterm.js/src/xterm.js`;
const destination = path.join(__dirname, '..', '.cache', 'xterm.cjs');
function verify(data) {
    const actual = createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
    if (actual !== expectedBlob) throw Error(`Fixture integrity mismatch: ${actual}`);
}
async function main() {
    if (fs.existsSync(destination)) {
        verify(fs.readFileSync(destination));
        console.log(`Verified cached Proxmox xterm fixture at ${revision}`);
        return;
    }
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw Error(`Fixture download failed: HTTP ${response.status}`);
    const data = Buffer.from(await response.arrayBuffer());
    verify(data);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, data);
    console.log(`Downloaded and verified Proxmox xterm fixture at ${revision}`);
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { verify, destination, revision };
