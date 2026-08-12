const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const required = ['server.js','render.yaml','package.json','catalog/products/COMMANDER-DECK-DIAGNOSTIC-001.json','config/qr-routes.json','index.html','success.html'];
let pass = true;
for (const rel of required) { const ok = fs.existsSync(path.join(root, rel)); console.log(`${ok ? 'PASS' : 'FAIL'} ${rel}`); pass = pass && ok; }
const product = JSON.parse(fs.readFileSync(path.join(root, 'catalog/products/COMMANDER-DECK-DIAGNOSTIC-001.json')));
for (const [k,v] of [['id', 'COMMANDER-DECK-DIAGNOSTIC-001'],['currency','nzd'],['status','published'],['checkout_available',true],['approval_required',false]]) { const ok = product[k] === v; console.log(`${ok ? 'PASS' : 'FAIL'} offer.${k}`); pass = pass && ok; }
const fossil = path.join(root, 'Proof/Fossils/FIRST_PAYMENT_PROOF.json');
if (fs.existsSync(fossil)) {
  const f = JSON.parse(fs.readFileSync(fossil));
  const ok = f.status === 'PASS' && typeof f.transaction_id === 'string' && f.transaction_id.length > 0;
  console.log(`${ok ? 'PASS' : 'FAIL'} FIRST_PAYMENT_PROOF live transaction evidence`); pass = pass && ok;
} else console.log('INFO FIRST_PAYMENT_PROOF not present: no live payment has been observed yet');
console.log(pass ? 'VERIFY PASS' : 'VERIFY FAIL');
process.exitCode = pass ? 0 : 1;
