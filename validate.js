const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const artMatch = html.match(/<script id="art">([\s\S]*?)<\/script>/);
if (!artMatch) { console.error('art script not found'); process.exit(1); }

const sandbox = { window: {} };
vm.createContext(sandbox);
try {
  new vm.Script(artMatch[1]).runInContext(sandbox);
} catch (e) {
  console.error('ART ERROR:', e.message);
  process.exit(1);
}
const A = sandbox.window.BIRTHDAY_ART;
console.log('art keys:', Object.keys(A.ART).join(', '));
console.log('pal keys:', Object.keys(A.PAL).join(', '));

for (const [name, rows] of Object.entries(A.ART)) {
  const w = rows[0].length;
  const bad = rows.filter(r => r.length !== w);
  console.log(`\n== ${name} (${w}x${rows.length}) ${bad.length ? 'BAD ROWS: ' + bad.length : 'ok'}`);
  const pal = A.PAL[name];
  const unknown = new Set();
  rows.forEach(r => { for (const c of r) if (c !== '.' && !pal[c]) unknown.add(c); });
  if (unknown.size) console.log('  UNKNOWN CHARS:', [...unknown].join(','));
  rows.forEach((r, i) => console.log(String(i).padStart(2) + ' ' + r));
}

const scripts = [...html.matchAll(/<script(?: id="art")?>([\s\S]*?)<\/script>/g)];
scripts.forEach((m, i) => {
  try {
    new vm.Script(m[1]);
    console.log(`\nscript ${i}: syntax OK`);
  } catch (e) {
    console.log(`\nscript ${i}: SYNTAX ERROR -> ${e.message}`);
    process.exitCode = 1;
  }
});
