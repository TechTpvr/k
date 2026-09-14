const fs = require('fs');
const path = require('path');

const root = process.cwd();
const candidates = [
  path.join(root, 'node_modules', 'vazirmatn', 'fonts', 'webfonts', 'Vazirmatn[wght].woff2'),
  path.join(root, 'node_modules', 'vazirmatn', 'fonts', 'webfonts', 'Vazirmatn-Variable.woff2'),
  path.join(root, 'node_modules', 'vazirmatn', 'Vazirmatn[wght].woff2')
];

const source = candidates.find(fs.existsSync);
if (!source) {
  throw new Error('Vazirmatn variable font was not found in node_modules.');
}

const outDir = path.join(root, 'public', 'fonts');
fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(source, path.join(outDir, 'Vazirmatn-wght.woff2'));
console.log(`Copied ${source} -> public/fonts/Vazirmatn-wght.woff2`);
