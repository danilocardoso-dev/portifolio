'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const publishableFiles = [
  'index.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'styles.css',
  'script.js',
  'assets/favicon.svg',
  'assets/social-card.png',
  'projects/mapcloud.html',
  'projects/atlas3d.html',
  'projects/azriel.html',
];

for (const relativePath of publishableFiles) {
  const source = path.join(root, relativePath);
  const destination = path.join(dist, relativePath);

  if (!fs.existsSync(source)) {
    throw new Error(`Arquivo da fonte oficial não encontrado: ${relativePath}`);
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

console.log(`Sites dist synchronized from the root source: ${publishableFiles.length} files.`);
