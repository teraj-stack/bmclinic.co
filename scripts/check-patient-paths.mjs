import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(path, 'utf8');
const landing = read('src/app/page.tsx');
const aesthetic = read('src/app/medycyna-estetyczna/page.tsx');
const ruta = read('src/app/ruta/page.tsx');

assert.match(landing, /href="\/ruta"/, 'RUTA must be reachable from Sky Lobby');
assert.match(aesthetic, /href="\/ruta"/, 'Aesthetics must link to RUTA');
assert.match(ruta, /href="\/medycyna-estetyczna"/, 'RUTA must link back to aesthetics');
const tileCount = (aesthetic.match(/"code": "[0-9]{2}\.[0-9]"/g) || []).length;
assert.equal(tileCount, 27, 'Aesthetic symptom map must contain 27 restored tiles');
for (const department of ['proktologia', 'flebologia', 'chirurgia', 'estetyka']) {
  assert.match(ruta, new RegExp('"'+department+'":\\s*\\{'), 'Missing department: '+department);
}
assert.match(ruta, /const summary=/, 'RUTA summary must be available');
assert.match(ruta, /Nie wpisuj danych osobowych/, 'RUTA needs a privacy notice');
console.log('BM Clinic: checked Sky Lobby ↔ RUTA ↔ aesthetics; 27 tiles; 4 departments; summary; privacy copy');
