/* SEO publishing contract. Node 18+; no packages and no network by default.
 * This checks our restricted HTML/XML format, not generic HTML/Schema.org.
 * verify-static.js handles local assets, fragments, PT/EN, ARIA and JS syntax.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const origin = 'https://danilovcardoso.com.br';
const pages = ['index.html', 'projects/mapcloud.html', 'projects/atlas3d.html', 'projects/azriel.html'];
const files = [...pages, '404.html', 'robots.txt', 'sitemap.xml'];
const canonicalFor = file => origin + '/' + (file === 'index.html' ? '' : file);
const decode = text => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
const normalize = text => decode(text).replace(/\s+/g, ' ').trim();
const tagPattern = /<([a-z][\w:-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
function attributes(source) {
  return Object.fromEntries([...source.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m => [m[1].toLowerCase(), decode(m[2] ?? m[3])]));
}
function check(sources) {
  const errors = [], unique = new Map(), nodes = new Map(), references = [];
  let homeLinks = new Set();
  const fail = (file, reason) => errors.push(file + ': ' + reason);
  for (const file of [...pages, '404.html']) {
    const html = sources[file] || '';
    const clean = html.replace(/<!--[\s\S]*?-->/g, '').replace(/(<script\b[^>]*>)[\s\S]*?<\/script\s*>/gi, '$1</script>');
    const tags = [...clean.matchAll(tagPattern)].map(m => ({ ...attributes(m[2]), tag:m[1].toLowerCase() }));
    const head = clean.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
    const titles = [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
    const title = normalize(titles[0]?.[1] || '');
    if (titles.length !== 1 || !title) fail(file, 'expected one nonempty title in head');
    const metas = [...head.matchAll(/<meta\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi)].map(m => attributes(m[1]));
    const keys = new Set();
    for (const item of metas) {
      const key = (item.property || item.name || (item.charset ? 'charset' : item['http-equiv']) || '').toLowerCase();
      if (!key) continue;
      if (keys.has(key)) fail(file, 'duplicate meta ' + key);
      keys.add(key);
    }
    const byKey = key => metas.filter(m => (m.name || m.property || '').toLowerCase() === key);
    const content = key => {
      const found = byKey(key);
      if (found.length !== 1 || !found[0].content?.trim()) fail(file, 'expected one nonempty ' + key);
      return found[0]?.content || '';
    };
    const description = content('description');
    const canonicalTags = [...head.matchAll(/<link\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi)].map(m => attributes(m[1])).filter(a => a.rel === 'canonical');
    const canonical = canonicalTags[0]?.href || '';
    const robots = metas.filter(m => /^(robots|googlebot(?:-.*)?|bingbot)$/i.test(m.name || ''));
    if (file === '404.html') {
      if (!robots.some(m => /\bnoindex\b/i.test(m.content || ''))) fail(file, '404 must be noindex');
      if (canonicalTags.length) fail(file, '404 must not canonicalize to the home page');
      if (!tags.some(t => t.tag === 'a' && t.href === '/')) fail(file, '404 needs a static home link');
    } else {
      if (robots.some(m => /\b(noindex|nofollow|none)\b/i.test(m.content || ''))) fail(file, 'accidental robots blocking');
      if (canonicalTags.length !== 1 || canonical !== canonicalFor(file)) fail(file, 'canonical must equal ' + canonicalFor(file));
      if (content('og:url') !== canonical) fail(file, 'og:url differs from canonical');
      for (const key of ['og:title','og:description','og:type','og:locale','og:site_name','twitter:card','twitter:title','twitter:description','og:image:alt','twitter:image:alt']) content(key);
      for (const key of ['og:image','twitter:image']) {
        if (content(key) !== origin + '/assets/social-card.png') fail(file, key + ' must reference the public PNG');
      }
      if (content('og:image:width') !== '1200' || content('og:image:height') !== '630' || content('og:image:type') !== 'image/png') fail(file, 'social image format/dimensions differ from the asset');
      if (content('og:title') !== title || content('twitter:title') !== title) fail(file, 'social titles differ from title');
      for (const [key,value] of [['title',title],['description',description],['canonical',canonical]]) {
        const id = key + ':' + normalize(value).toLowerCase();
        if (unique.has(id)) fail(file, key + ' duplicates ' + unique.get(id));
        unique.set(id,file);
      }
      for (const item of metas.filter(m => m['data-meta-pt'])) {
        if (item.content !== item['data-meta-pt'] || !item['data-meta-en']) fail(file, 'initial metadata must equal PT and provide EN');
      }
      if (/\bhreflang\s*=/i.test(clean)) fail(file, 'same-URL language toggle must not invent hreflang');
      const blocks = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].filter(m => attributes(m[1]).type === 'application/ld+json');
      if (blocks.length !== 1) fail(file, 'expected one JSON-LD block');
      for (const block of blocks) {
        try {
          const json = JSON.parse(block[2]);
          if (json['@context'] !== 'https://schema.org') fail(file, 'JSON-LD context must be schema.org HTTPS');
          const graph = json['@graph'] || [json];
          if (!Array.isArray(graph)) throw new Error('@graph must be an array');
          const webpage = graph.filter(n => n['@type'] === 'WebPage');
          if (webpage.length !== 1 || webpage[0].url !== canonical || webpage[0].name !== title || webpage[0].description !== description || webpage[0].inLanguage !== 'pt-BR') fail(file, 'WebPage must match the initial document');
          for (const node of graph) {
            if (!['WebSite','WebPage','Person'].includes(node['@type'])) fail(file, 'unexpected schema type');
            if (!node['@id']?.startsWith(origin + '/') || nodes.has(node['@id'])) fail(file, 'invalid/duplicate schema id');
            nodes.set(node['@id'],node);
            if (!node.name || !node.url?.startsWith(origin + '/')) fail(file, 'schema node needs factual name and public URL');
          }
          const visit = obj => {
            if (!obj || typeof obj !== 'object') return;
            if (obj['@id'] && !obj['@type']) references.push([file,obj['@id']]);
            for (const [key,value] of Object.entries(obj)) {
              if (['address','telephone','aggregateRating','review','worksFor','award','datePublished','dateModified'].includes(key)) fail(file, 'schema field requires new factual verification: ' + key);
              if (typeof value === 'string' && /http:|localhost|127\.0\.0\.1|sslip\.io/i.test(value)) fail(file, 'nonpublic/insecure schema value');
              visit(value);
            }
          };
          visit(json);
        } catch (error) { fail(file, 'invalid JSON-LD: ' + error.message); }
      }
    }
    const h1s = [...clean.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
    if (h1s.length !== 1 || !normalize((h1s[0]?.[1] || '').replace(/<[^>]+>/g, ''))) fail(file, 'expected one nonempty h1');
    const body = clean.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
    if (file === 'index.html') homeLinks = new Set([...body.matchAll(tagPattern)].filter(m => m[1].toLowerCase() === 'a').map(m => attributes(m[2]).href));
    const visible = normalize(body.replace(tagPattern,' ').replace(/<\/[^>]+>/g,' '));
    if (!visible.includes('Danilo V. Cardoso') && !visible.includes('DANILO V. CARDOSO')) fail(file, 'identity missing from initial HTML');
    if (file !== '404.html' && visible.length < 1000) fail(file, 'essential content missing from initial HTML');
    if (/(?:https?:\/\/)?(?:localhost|127\.0\.0\.1|[\w.-]+\.sslip\.io)/i.test(clean)) fail(file, 'development URL in public HTML');
    if (/(?:href|src|content)\s*=\s*["'](?:http:|\/\/)/i.test(clean)) fail(file, 'HTTP or protocol-relative URL');
    if (/\bhref=["'][^"']*index\.html(?:[#?"'])/i.test(body)) fail(file, 'home links should use / instead of index.html');
  }
  for (const [file,id] of references) if (!nodes.has(id)) fail(file, 'unresolved schema reference ' + id);
  const person = nodes.get(origin + '/#person');
  if (!person || person['@type'] !== 'Person' || person.name !== 'Danilo V. Cardoso') fail('index.html','Person missing/incorrect');
  for (const url of person?.sameAs || []) {
    if (!homeLinks.has(url)) fail('index.html','sameAs is not a visible profile link');
  }
  const xml = (sources['sitemap.xml'] || '').trim();
  // Deliberately restricted sitemap grammar: UTF-8 urlset/url/loc, no DTD,
  // extensions or lastmod without a verified content modification source.
  const grammar = /^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">\s*(?:<url>\s*<loc>https:\/\/[^<>&\s]+<\/loc>\s*<\/url>\s*)+<\/urlset>$/;
  if (!grammar.test(xml)) fail('sitemap.xml','invalid restricted XML format');
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const expected = pages.map(canonicalFor);
  if (locations.length !== expected.length || new Set(locations).size !== locations.length || expected.some(url => !locations.includes(url))) fail('sitemap.xml','must contain exactly the four public canonicals');
  const robots = (sources['robots.txt'] || '').split(/\r?\n/).map(line => line.replace(/#.*/,'').trim()).filter(Boolean);
  if (robots.length !== 3 || robots[0].toLowerCase() !== 'user-agent: *' || robots[1].toLowerCase() !== 'allow: /' || robots[2] !== 'Sitemap: ' + origin + '/sitemap.xml') fail('robots.txt','expected the public allow-all group and official sitemap only');
  return errors;
}
function checkPng(bytes) {
  return bytes.length >= 24 && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) &&
    bytes.toString('ascii',12,16) === 'IHDR' && bytes.readUInt32BE(16) === 1200 && bytes.readUInt32BE(20) === 630;
}
async function checkHttp(base) {
  const errors = [], sources = {};
  const tasks = [...files.map(file => [file === 'index.html' ? '/' : '/' + file, file === '404.html' ? 404 : 200, file.endsWith('.html') ? 'text/html' : file.endsWith('.xml') ? '(?:application|text)/xml' : 'text/plain', file]),
    ['/assets/social-card.png',200,'image/png'],['/seo-check-missing-page/deep',404,'text/html']];
  await Promise.all(tasks.map(async ([route,status,mime,file]) => {
    try {
      const response = await fetch(new URL(route,base), { redirect:'manual', signal:AbortSignal.timeout(15000) });
      if (response.status !== status) errors.push(route + ': HTTP ' + response.status + ', expected ' + status);
      if (!new RegExp('^' + mime + '(?:;|$)','i').test(response.headers.get('content-type') || '')) errors.push(route + ': incorrect Content-Type');
      if (status === 200 && /\b(noindex|nofollow|none)\b/i.test(response.headers.get('x-robots-tag') || '')) errors.push(route + ': blocking X-Robots-Tag');
      if (file) sources[file] = await response.text();
      else if (route.endsWith('.png')) {
        if (!checkPng(Buffer.from(await response.arrayBuffer()))) errors.push(route + ': invalid PNG response');
      } else if (!(await response.text()).includes('Este caminho não existe.')) errors.push(route + ': custom 404 missing');
    } catch (error) { errors.push(route + ': ' + error.message); }
  }));
  try {
    const alias = await fetch(new URL('/index.html',base), {redirect:'manual',signal:AbortSignal.timeout(15000)});
    const destination = new URL(alias.headers.get('location') || '/index.html',base);
    if (![301,308].includes(alias.status) || destination.href !== new URL('/',base).href) errors.push('/index.html: expected permanent redirect to /');
  } catch (error) { errors.push('/index.html: ' + error.message); }
  return [...errors,...check(sources)];
}
async function main() {
  const sources = Object.fromEntries(files.map(file => [file, fs.existsSync(path.join(root,file)) ? fs.readFileSync(path.join(root,file),'utf8') : '']));
  const errors = check(sources);
  const png = path.join(root,'assets/social-card.png');
  if (!fs.existsSync(png) || !checkPng(fs.readFileSync(png))) errors.push('assets/social-card.png: expected a real 1200x630 PNG');
  const staticCheck = spawnSync(process.execPath,[path.join(__dirname,'verify-static.js')],{encoding:'utf8'});
  if (staticCheck.status !== 0) errors.push('Static integrity: ' + (staticCheck.stderr || staticCheck.error || 'failed'));
  if (process.argv.includes('--self-test')) {
    const cases = [
      ['duplicate title','index.html',s => s.replace('</head>','<title>Duplicate</title></head>'),/one nonempty title/],
      ['empty description','index.html',s => s.replace(/(<meta name="description"[^>]* content=")[^"]*/,'$1'),/nonempty description/],
      ['duplicate description meta','index.html',s => s.replace('</head>','<meta name="description" content="duplicate"></head>'),/nonempty description/],
      ['HTTP canonical','index.html',s => s.replace('rel="canonical" href="https:','rel="canonical" href="http:'),/canonical must/],
      ['duplicate canonical','projects/mapcloud.html',s => s.replace('rel="canonical" href="' + canonicalFor('projects/mapcloud.html'),'rel="canonical" href="' + origin + '/'),/canonical must/],
      ['bot noindex','index.html',s => s.replace('</head>','<meta name="googlebot" content="NOINDEX"></head>'),/robots blocking/],
      ['JSON syntax','index.html',s => s.replace('"@context":','"@context"'),/invalid JSON-LD/],
      ['empty H1','index.html',s => s.replace(/(<h1\b[^>]*>)[\s\S]*?<\/h1>/,'$1</h1>'),/nonempty h1/],
      ['comment is not a profile','index.html',s => s.replace('"sameAs": [','"sameAs": ["https://example.com/fake",').replace('</body>','<!-- href="https://example.com/fake" --></body>'),/visible profile link/],
      ['missing sitemap URL','sitemap.xml',s => s.replace(/\s*<url>[\s\S]*?<\/url>/,''),/four public canonicals/],
      ['duplicate sitemap URL','sitemap.xml',s => s.replace('projects/azriel.html','projects/mapcloud.html'),/four public canonicals/],
      ['XML malformed','sitemap.xml',s => s.replace('</urlset>','</url>'),/XML format/],
      ['blocked robots','robots.txt',s => s.replace('Allow: /','Disallow: /'),/allow-all/],
      ['missing asset URL','index.html',s => s.replaceAll('social-card.png','missing.png'),/public PNG/],
    ];
    for (const [name,file,mutate,expected] of cases) {
      const result = check({...sources,[file]:mutate(sources[file])});
      if (!result.some(message => expected.test(message))) errors.push('self-test did not detect: ' + name);
    }
    if (checkPng(Buffer.from('not a PNG'))) errors.push('self-test accepted invalid PNG');
    console.log('SEO self-tests exercised ' + (cases.length + 1) + ' in-memory failure fixtures (no files modified).');
  }
  const argument = process.argv.indexOf('--base-url');
  if (argument !== -1) {
    const base = new URL(process.argv[argument+1]);
    if (base.username || base.password || base.pathname !== '/' || base.search || base.hash || !['http:','https:'].includes(base.protocol)) throw new Error('--base-url must be an HTTP(S) origin without credentials, path, query or fragment');
    errors.push(...await checkHttp(base));
  }
  if (errors.length) {
    console.error('SEO verification failed:\n' + errors.map(e => '- ' + e).join('\n'));
    process.exitCode = 1;
  } else {
    console.log('SEO verification passed: 4 indexable pages + 404, unique metadata, JSON-LD references, PT/EN metadata, PNG, robots, sitemap, static assets and links' + (argument !== -1 ? ', HTTP/MIME/redirect/real 404.' : '.'));
    console.log('Not a ranking, rich-result, Core Web Vitals or production-deployment guarantee.');
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
