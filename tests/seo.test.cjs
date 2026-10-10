const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const http = require('node:http');
const { randomBytes } = require('node:crypto');

test('public HTML, real product 404s, sitemap, privacy and preview indexing', { timeout: 180000 }, async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), '9teen-seo-'));
  const children = [];
  const origin = 'https://9teen-collection.vercel.app';
  const product = { id: 'seo-shirt', name: 'Catalog Shirt', category: 'shirts', price: 1250, image: '/images/campaign/warm-hero.png', description: 'Cotton shirt </script><script>bad()</script>', sizes: ['M'], featured: true, inStock: true, newArrival: true, bestSeller: false, trending: false };
  const fixture = { '9teen_products': [product], '9teen_categories': [{ id: 'shirts', name: 'Shirts', enabled: true }], '9teen_site_settings': { siteName: '9TEEN', adminPassword: 'private-settings-sentinel', adminUsername: 'private-admin-sentinel' }, '9teen_orders': [{ id: 'private-order-sentinel' }], '9teen_user_accounts': [{ id: 'private-user-sentinel' }], '9teen_reviews': [{ id: 'review-pending', productId: product.id, comment: 'pending-review-sentinel', status: 'pending' }] };
  const file = path.join(directory, 'catalog.json');
  await fs.writeFile(file, JSON.stringify(fixture));
  async function start(extra = {}) {
    const listener = net.createServer(); listener.listen(0, '127.0.0.1'); await once(listener, 'listening');
    const port = listener.address().port; await new Promise(resolve => listener.close(resolve));
    const base = `http://127.0.0.1:${port}`;
    const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
      cwd: path.resolve(__dirname, '..'), windowsHide: true,
      env: { ...process.env, NODE_ENV: 'production', APP_SURFACE: 'storefront', VERCEL_ENV: 'production', STORE_BACKEND: 'local', STORE_FILE: file, NEXT_PUBLIC_AUTH_PROVIDER: 'legacy', NEXT_PUBLIC_BASE_URL: origin, SEO_SITE_URL: origin, GOOGLE_SITE_VERIFICATION: '', SESSION_SECRET: randomBytes(32).toString('hex'), ...extra },
    });
    children.push(child);
    let output = ''; child.stdout.on('data', data => output += data); child.stderr.on('data', data => output += data);
    for (let attempt = 0; attempt < 160; attempt++) {
      if (child.exitCode !== null) throw new Error(output);
      try { await fetch(base + '/robots.txt'); return base; } catch { await new Promise(resolve => setTimeout(resolve, 250)); }
    }
    throw new Error('SEO test server did not start: ' + output);
  }
  async function request(base, pathname, canonicalHost = true, host = new URL(origin).host) {
    // Node fetch discards a custom Host; raw HTTP is needed to test real aliases.
    return new Promise((resolve, reject) => {
      const req = http.get(base + pathname, { headers: canonicalHost ? { host } : {} }, response => {
        let html = ''; response.setEncoding('utf8'); response.on('data', data => html += data);
        response.on('end', () => resolve({ status: response.statusCode, headers: new Headers(response.headers), html }));
        response.on('error', reject);
      });
      req.on('error', reject);
    });
  }
  const meta = (html, name) => html.match(new RegExp(`<meta name="${name}" content="([^"]*)"`))?.[1];
  try {
    const base = await start();
    const titles = new Set();
    for (const pathname of ['/', '/products', '/about', '/lookbook', '/product/seo-shirt']) {
      const page = await request(base, pathname);
      assert.equal(page.status, 200, pathname);
      const title = page.html.match(/<title>(.*?)<\/title>/)?.[1];
      assert.ok(title && !titles.has(title), `unique title: ${pathname}`); titles.add(title);
      assert.equal((page.html.match(/<title>/g) || []).length, 1);
      assert.equal((page.html.match(/name="description"/g) || []).length, 1);
      assert.ok(meta(page.html, 'description'));
      const canonical = page.html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      assert.equal(canonical && new URL(canonical).href, origin + pathname, `canonical: ${pathname}`);
      assert.match(page.html, /property="og:title"/); assert.equal(meta(page.html, 'twitter:card'), 'summary_large_image');
      assert.equal(meta(page.html, 'robots'), 'index, follow');
      assert.equal(page.headers.get('x-robots-tag'), null);
      assert.match(page.html, /<h1/); assert.doesNotMatch(page.html, />Loading store…</);
      assert.doesNotMatch(page.html, /private-settings-sentinel|private-admin-sentinel|private-order-sentinel|private-user-sentinel|pending-review-sentinel/);
      if (pathname !== '/about') assert.match(page.html, /Catalog Shirt/);
    }
    const detail = await request(base, '/product/seo-shirt');
    const schema = JSON.parse(detail.html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(schema.offers.priceCurrency, 'NPR'); assert.equal(schema.offers.price, 1250);
    assert.equal(schema.description, product.description); assert.equal(schema.aggregateRating, undefined);
    assert.equal(schema.category, 'Shirts'); assert.deepEqual(schema.size, ['M']);
    assert.equal(schema.offers.seller.name, '9TEEN Collection');
    const home = await request(base, '/');
    const brand = JSON.parse(home.html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(brand['@graph'][0].name, '9TEEN Collection');
    assert.equal(brand['@graph'][0].alternateName, '9TEEN');
    assert.match(home.html, /rel="icon"[^>]*href="\/favicon.png"/);
    assert.doesNotMatch(home.html, /name="keywords"/);
    const icon = await fetch(base + '/favicon.png');
    assert.equal(icon.status, 200); assert.match(icon.headers.get('content-type'), /image\/png/);
    assert.equal(icon.headers.get('x-robots-tag'), null);
    assert.deepEqual(Buffer.from(await icon.arrayBuffer()), await fs.readFile(path.resolve(__dirname, '../public/favicon.png')));
    assert.equal((await request(base, '/product/missing-product')).status, 404);
    assert.equal((await request(base, '/missing-route')).status, 404);
    const facets = await request(base, '/products?search=shirt');
    assert.equal(meta(facets.html, 'robots'), 'noindex, follow');
    for (const pathname of ['/account', '/cart', '/checkout', '/login', '/wishlist', '/track-order', '/payment', '/supabase-demo']) {
      const page = await request(base, pathname);
      assert.match(page.headers.get('x-robots-tag') || '', /noindex/);
      assert.match(meta(page.html, 'robots') || '', /noindex/);
    }
    const sitemap = await request(base, '/sitemap.xml');
    assert.equal(sitemap.status, 200);
    const urls = [...sitemap.html.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
    assert.equal(urls.length, 5); assert.ok(urls.includes(origin + '/product/seo-shirt'));
    assert.doesNotMatch(sitemap.html, /<lastmod>|\/admin|\/account|\/cart/);
    for (const url of urls) assert.equal((await request(base, new URL(url).pathname)).status, 200);
    // A future product must become discoverable without a rebuild or hand-written keywords.
    const added = { ...product, id: 'new-kurti', name: 'Blue Embroidered Kurti', description: 'Blue kurti with embroidered sleeves.', price: 2300, sizes: ['S', 'L'], variants: [{ name: 'Colour', values: ['Blue'] }] };
    fixture['9teen_products'].push(added);
    await fs.writeFile(file, JSON.stringify(fixture));
    const newPage = await request(base, '/product/new-kurti');
    assert.equal(newPage.status, 200);
    assert.match(newPage.html, /<title>Blue Embroidered Kurti in Nepal \| 9TEEN Collection<\/title>/);
    assert.match(meta(newPage.html, 'description'), /NPR 2,300/);
    assert.match(meta(newPage.html, 'description'), /embroidered sleeves/);
    assert.match((await request(base, '/products')).html, /href="\/product\/new-kurti"/);
    assert.match((await request(base, '/sitemap.xml')).html, /\/product\/new-kurti<\/loc>/);
    const newSchema = JSON.parse(newPage.html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.deepEqual(newSchema.size, ['S', 'L']);
    assert.equal(newSchema.additionalProperty[0].value, 'Blue');
    added.name = 'Navy Embroidered Kurti'; added.price = 2400; added.inStock = false;
    await fs.writeFile(file, JSON.stringify(fixture));
    const updatedPage = await request(base, '/product/new-kurti');
    assert.match(updatedPage.html, /<title>Navy Embroidered Kurti in Nepal/);
    assert.match(meta(updatedPage.html, 'description'), /NPR 2,400/);
    const updatedSchema = JSON.parse(updatedPage.html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(updatedSchema.offers.availability, 'https://schema.org/OutOfStock');
    fixture['9teen_products'].pop(); await fs.writeFile(file, JSON.stringify(fixture));
    assert.equal((await request(base, '/product/new-kurti')).status, 404);
    assert.doesNotMatch((await request(base, '/sitemap.xml')).html, /\/product\/new-kurti<\/loc>/);
    const robots = await request(base, '/robots.txt');
    assert.equal(robots.status, 200); assert.match(robots.html, /Allow: \//); assert.match(robots.html, /Disallow: \/api\//);
    assert.ok(robots.html.includes(origin + '/sitemap.xml'));
    assert.match((await request(base, '/', false)).headers.get('x-robots-tag'), /noindex/);
    const alias = await request(base, '/products?cat=shirts', true, '9teenonlinestore.vercel.app');
    assert.equal(alias.status, 308); assert.equal(alias.headers.get('location'), origin + '/products?cat=shirts');
    const preview = await start({ VERCEL_ENV: 'preview' });
    const previewHome = await request(preview, '/');
    assert.match(previewHome.headers.get('x-robots-tag'), /noindex/); assert.match(meta(previewHome.html, 'robots'), /noindex/);
    assert.doesNotMatch((await request(preview, '/sitemap.xml')).html, /<loc>/);
    const admin = await start({ APP_SURFACE: 'admin' });
    assert.equal((await request(admin, '/products')).status, 404);
    assert.match((await request(admin, '/admin')).headers.get('x-robots-tag'), /noindex/);
    assert.equal((await request(admin, '/robots.txt')).status, 200);
    assert.doesNotMatch((await request(admin, '/sitemap.xml')).html, /<loc>/);
  } finally {
    for (const child of children) if (child.exitCode === null) { child.kill(); await once(child, 'exit'); }
    // Only remove the exact test directory we created under the OS temp directory.
    if (path.dirname(directory) === path.resolve(os.tmpdir()) && path.basename(directory).startsWith('9teen-seo-')) await fs.rm(directory, { recursive: true, force: true });
  }
});
