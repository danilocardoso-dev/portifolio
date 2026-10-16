const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'dist');
const pages = ['index.html', '404.html', 'projects/mapcloud.html', 'projects/atlas3d.html', 'projects/azriel.html'];
const errors = [];

const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

for (const page of pages) {
  if (!exists(page)) {
    errors.push(`${page}: missing page`);
    continue;
  }

  const html = read(page);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${page}: missing title`);
  if (page !== '404.html' && !/<meta name="description" content="[^"]+"/.test(html)) errors.push(`${page}: missing description`);
  if (page !== '404.html' && !/<link rel="canonical" href="https:\/\/[^"]+"/.test(html)) errors.push(`${page}: missing canonical`);
  if ((html.match(/<h1\b/g) || []).length !== 1) errors.push(`${page}: expected exactly one h1`);

  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) errors.push(`${page}: duplicate ids ${duplicateIds.join(', ')}`);

  for (const tag of html.match(/<[^>]+data-pt="[^"]*"[^>]*>/g) || []) {
    if (!tag.includes('data-en=')) errors.push(`${page}: data-pt without data-en`);
  }

  const base = path.dirname(page);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|#|data:)/.test(target)) continue;
    const cleaned = target.split('#')[0].split('?')[0];
    const resolved = cleaned.startsWith('/')
      ? cleaned.slice(1)
      : path.normalize(path.join(base, cleaned));
    const candidate = resolved.endsWith(path.sep) || cleaned.endsWith('/')
      ? path.join(resolved, 'index.html')
      : resolved;
    if (!exists(candidate)) errors.push(`${page}: missing local target ${target}`);
  }
}

for (const asset of ['styles.css', 'script.js', 'assets/favicon.svg', 'assets/social-card.png', 'robots.txt', 'sitemap.xml']) {
  if (!exists(asset)) errors.push(`${asset}: missing required asset`);
}

const sitemap = read('sitemap.xml');
if ((sitemap.match(/<url>/g) || []).length !== 4) errors.push('sitemap.xml: expected four public URLs');

if (errors.length) {
  console.error(`Sites verification failed (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Sites verification passed: ${pages.length} pages, local links, language pairs, metadata and required assets.`);
