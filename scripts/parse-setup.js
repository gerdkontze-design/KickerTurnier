const fs = require('fs');
const parser = require('@babel/parser');
const code = fs.readFileSync('src/components/Setup.jsx', 'utf8');
try {
  const ast = parser.parse(code, {sourceType: 'module', plugins: ['jsx']});
  console.log('OK');
} catch (err) {
  console.error(err.message);
  console.error(err.loc);
  process.exit(1);
}
