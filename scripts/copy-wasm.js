// Copies the sql.js WASM next to the compiled backend so the serverless
// function can load it from its own bundle (backend/dist/sql-wasm.wasm).
const fs = require('fs');
const path = require('path');

const src = require.resolve('sql.js/dist/sql-wasm.wasm', {
  paths: ['./backend/node_modules', './node_modules'],
});
const dest = path.join('backend', 'dist', 'sql-wasm.wasm');
fs.copyFileSync(src, dest);
console.log('[build] sql.js wasm copied ->', dest, 'from', src);
