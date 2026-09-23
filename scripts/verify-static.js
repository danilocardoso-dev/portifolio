/* Reproducible checks for the portfolio's static publishing contract.
 * Run from any directory: node scripts/verify-static.js
 * This deliberately small source checker complements browser QA; it is not an
 * HTML5 parser and does not claim to verify rendering, contrast, or animation.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const origin = 'https://danilovcardoso.com.br';
const pages = ['index.html', 'projects/mapcloud.html', 'projects/atlas3d.html', 'projects/azriel.html'];
const errors = [];
const counts = { pages: 0, references: 0, fragments: 0, translations: 0, css: 0, javascript: 0 };
const documents = new Map();
const scripts = new Set();
const stylesheets = new Set();
const fail = (file, message) => errors.push(`${file}: ${message}`);
const relative = absolute => path.relative(root, absolute).split(path.sep).join('/');
const entities = value => value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, entity => {
  const named = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
  if (named[entity]) return named[entity];
  const hexadecimal = entity.toLowerCase().startsWith('&#x');
  const code = Number.parseInt(entity.slice(hexadecimal ? 3 : 2, -1), hexadecimal ? 16 : 10);
  return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
});

function readDocument(file) {
  if (documents.has(file)) return documents.get(file);
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const tags = [];
  const ids = new Set();
  // Respect quoted greater-than signs and ignore comments. The repository uses
  // external scripts, so no script source must be interpreted as HTML here.
  const clean = source.replace(/<!--[\s\S]*?-->/g, '');
  for (const match of clean.matchAll(/<([a-z][\w:-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi)) {
    const attrs = {};
    for (const attr of match[2].matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
      const name = attr[1].toLowerCase();
      if (Object.hasOwn(attrs, name)) fail(file, `duplicate attribute ${name} on <${match[1]}>`);
      attrs[name] = entities(attr[2] ?? attr[3] ?? attr[4] ?? '');
    }
    const tag = { name: match[1].toLowerCase(), attrs };
    tags.push(tag);
    if (attrs.id !== undefined) {
      if (!attrs.id.trim()) fail(file, 'empty id');
      if (ids.has(attrs.id)) fail(file, `duplicate id #${attrs.id}`);
      ids.add(attrs.id);
    }
  }
  const doc = { source, tags, ids };
  documents.set(file, doc);
  return doc;
}

function checkReference(file, value, label, { loaded = false } = {}) {
  counts.references++;
  if (!value.trim()) {
    fail(file, `${label} is empty`);
    return;
  }
  if (/^(?:mailto:|tel:)/i.test(value)) {
    if (loaded) fail(file, `${label} uses a non-resource scheme: ${value}`);
    return;
  }
  if (/^data:/i.test(value)) return;
  if (/^\/\//.test(value)) {
    fail(file, `${label} must use explicit HTTPS: ${value}`);
    return;
  }
  let url;
  try {
    url = new URL(value, `${origin}/${file}`);
  } catch {
    fail(file, `${label} is not a valid URL: ${value}`);
    return;
  }
  if (url.protocol !== 'https:') {
    fail(file, `${label} is not HTTPS-safe: ${value}`);
    return;
  }
  if (loaded && /\.gif$/i.test(url.pathname)) fail(file, `production resource still loads a GIF: ${value}`);
  if (url.origin !== origin) return;
  let pathname;
  let fragment;
  try {
    pathname = decodeURIComponent(url.pathname);
    fragment = decodeURIComponent(url.hash.slice(1));
  } catch {
    fail(file, `${label} has invalid percent encoding: ${value}`);
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const absolute = path.resolve(root, `.${pathname}`);
  const local = relative(absolute);
  if (local.startsWith('../') || path.isAbsolute(local)) {
    fail(file, `${label} escapes the publishing root: ${value}`);
    return;
  }
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    fail(file, `${label} points to a missing file: ${value}`);
    return;
  }
  if (fragment && /\.(?:html|svg)$/i.test(local)) {
    counts.fragments++;
    if (!readDocument(local).ids.has(fragment)) fail(file, `${label} points to missing fragment #${fragment} in ${local}`);
  }
  return local;
}

for (const file of pages) {
  if (!fs.existsSync(path.join(root, file))) {
    fail(file, 'required publishable page is missing');
    continue;
  }
  const doc = readDocument(file);
  counts.pages++;
  const h1s = doc.tags.filter(tag => tag.name === 'h1');
  if (h1s.length !== 1) fail(file, `expected one h1, found ${h1s.length}`);
  if (doc.tags.filter(tag => tag.name === 'main').length !== 1) fail(file, 'expected one main landmark');
  if (!doc.tags.some(tag => tag.name === 'html' && tag.attrs.lang === 'pt-BR')) fail(file, 'default language must be pt-BR');
  if (!doc.tags.some(tag => tag.name === 'a' && /(?:^|\s)skip-link(?:\s|$)/.test(tag.attrs.class || '') && tag.attrs.href?.startsWith('#'))) fail(file, 'missing skip link');
  const canonical = `${origin}/${file === 'index.html' ? '' : file}`;
  const canonicals = doc.tags.filter(tag => tag.name === 'link' && tag.attrs.rel === 'canonical');
  if (canonicals.length !== 1 || canonicals[0].attrs.href !== canonical) fail(file, `canonical must be ${canonical}`);
  const ogUrl = doc.tags.find(tag => tag.name === 'meta' && tag.attrs.property === 'og:url');
  if (ogUrl?.attrs.content !== canonical) fail(file, 'og:url must match canonical');

  for (const { name, attrs } of doc.tags) {
    for (const attribute of Object.keys(attrs)) {
      if (!/^data-(?:[\w-]+-)?(?:pt|en)$/.test(attribute)) continue;
      const counterpart = attribute.replace(/-(pt|en)$/, (_, language) => language === 'pt' ? '-en' : '-pt');
      if (!Object.hasOwn(attrs, counterpart)) fail(file, `<${name}> has ${attribute} without ${counterpart}`);
      if (!attrs[attribute].trim()) fail(file, `<${name}> has empty ${attribute}`);
      if (attribute.endsWith('-pt')) counts.translations++;
    }
    for (const attribute of ['src', 'href', 'poster', 'data-motion-sprite']) {
      if (!Object.hasOwn(attrs, attribute)) continue;
      const loaded = attribute !== 'href' || name === 'link';
      const target = checkReference(file, attrs[attribute], `<${name}> ${attribute}`, { loaded });
      if (name === 'script' && attribute === 'src' && target) scripts.add(target);
      if (name === 'link' && attrs.rel === 'stylesheet' && target) stylesheets.add(target);
    }
    if (attrs.srcset) {
      for (const candidate of attrs.srcset.split(',')) checkReference(file, candidate.trim().split(/\s+/)[0], `<${name}> srcset`, { loaded: true });
    }
    if (name === 'meta' && /^(?:og:image|twitter:image)$/.test(attrs.property || attrs.name || '')) checkReference(file, attrs.content || '', 'social image', { loaded: true });
    for (const attribute of ['aria-controls', 'aria-labelledby', 'aria-describedby']) {
      for (const id of (attrs[attribute] || '').split(/\s+/).filter(Boolean)) {
        if (!doc.ids.has(id)) fail(file, `${attribute} points to missing #${id}`);
      }
    }
    if (name === 'img' && !Object.hasOwn(attrs, 'alt')) fail(file, `image lacks alt: ${attrs.src || '(no src)'}`);
  }
}

// Follow linked CSS and local @imports. Validate asset URLs relative to the CSS,
// including optional SVG fragments; do not request external resources.
for (const file of stylesheets) {
  const css = fs.readFileSync(path.join(root, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  counts.css++;
  for (const match of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]*))\s*\)/gi)) {
    const value = match[1] ?? match[2] ?? match[3];
    if (value.startsWith('#')) continue;
    const target = checkReference(file, value, 'CSS url()', { loaded: true });
    if (target?.endsWith('.css')) stylesheets.add(target);
  }
  for (const match of css.matchAll(/@import\s+["']([^"']+)["']/gi)) {
    const target = checkReference(file, match[1], 'CSS @import', { loaded: true });
    if (target) stylesheets.add(target);
  }
}

for (const file of scripts) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  counts.javascript++;
  if (result.error || result.status !== 0) fail(file, `JavaScript syntax check failed: ${result.error?.message || result.stderr.trim()}`);
}

if (errors.length) {
  console.error(`Static verification failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):\n${errors.map(error => `- ${error}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Static verification passed: ${counts.pages} pages, ${counts.references} references, ${counts.fragments} fragments, ${counts.translations} PT/EN pairs, ${counts.css} stylesheets, ${counts.javascript} JavaScript file(s).`);
  console.log('Confirmed: local assets and anchors, unique IDs, one h1/main per page, canonical/OG URLs, translation pairs, ARIA references, image alt, HTTPS-safe resources, and no loaded GIFs.');
  console.log('Still requires browser QA: rendering, responsive layout, keyboard, language switching, reduced motion, pause, visibility lifecycle, and console.');
}
