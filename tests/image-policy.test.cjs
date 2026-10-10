require('./register.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isOptimizedRemoteImage } = require('../lib/image-policy.ts');

test('uploaded images use only the configured HTTPS public storage paths', () => {
  const sources = [
    { protocol: 'https', hostname: 'store.convex.cloud', pathname: '/api/storage/**' },
    { protocol: 'https', hostname: 'store.supabase.co', pathname: '/storage/v1/object/public/**' },
  ];
  assert.equal(isOptimizedRemoteImage('https://store.convex.cloud/api/storage/photo-id', sources), true);
  assert.equal(isOptimizedRemoteImage('https://store.supabase.co/storage/v1/object/public/products/photo.jpg', sources), true);
  for (const src of [
    'http://store.convex.cloud/api/storage/photo-id',
    'https://another.convex.cloud/api/storage/photo-id',
    'https://store.convex.cloud/other-path/photo-id',
    'https://store.supabase.co/storage/v1/object/private/photo.jpg',
    'https://store.convex.cloud.attacker.example/api/storage/photo-id',
    'https://user:password@store.convex.cloud/api/storage/photo-id',
    'https://store.convex.cloud:8080/api/storage/photo-id',
    'not-a-url',
  ]) assert.equal(isOptimizedRemoteImage(src, sources), false, src);
});
