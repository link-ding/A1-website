import test from 'node:test';
import assert from 'node:assert/strict';
import { MockAgent, getGlobalDispatcher, setGlobalDispatcher } from 'undici';
import { defaultContent, readContent, writeContent } from '../server/content.js';

test('reads and saves private content with request-context OIDC and no token environment variables', async (t) => {
  const keys = ['VERCEL', 'BLOB_READ_WRITE_TOKEN', 'BLOB_STORE_ID', 'VERCEL_OIDC_TOKEN'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  t.after(() => {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  });
  process.env.VERCEL = '1';
  delete process.env.BLOB_READ_WRITE_TOKEN;
  process.env.BLOB_STORE_ID = 'store_test';
  const token = `e30.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test`;
  delete process.env.VERCEL_OIDC_TOKEN;
  const contextKey = Symbol.for('@vercel/request-context');
  const previousContext = globalThis[contextKey];
  globalThis[contextKey] = { get: () => ({ headers: { 'x-vercel-oidc-token': token } }) };
  t.after(() => {
    if (previousContext === undefined) delete globalThis[contextKey];
    else globalThis[contextKey] = previousContext;
  });
  const methods = [];
  const dispatcher = getGlobalDispatcher();
  const mock = new MockAgent();
  mock.disableNetConnect();
  setGlobalDispatcher(mock);
  t.after(async () => {
    setGlobalDispatcher(dispatcher);
    await mock.close();
  });
  const pool = mock.get('https://vercel.com');
  const stored = structuredClone(defaultContent);
  stored.groupClasses.english = 88;
  mock.get('https://test.private.blob.vercel-storage.com')
    .intercept({ path: '/academy-one/content-test.json?cache=0', method: 'GET' })
    .reply(options => {
      assert.equal(new Headers(options.headers).get('authorization'), `Bearer ${token}`);
      return { statusCode: 200, data: stored, responseOptions: { headers: { 'content-type': 'application/json' } } };
    });
  for (const method of ['GET', 'PUT']) pool.intercept({ path: /.*/, method }).reply(options => {
    const headers = new Headers(options.headers);
    assert.equal(headers.get('authorization'), `Bearer ${token}`);
    assert.equal(headers.get('x-vercel-blob-store-id'), 'test');
    methods.push(options.method);
    if (options.method === 'PUT') assert.equal(headers.get('x-vercel-blob-access'), 'private');
    return { statusCode: 200, data: options.method === 'GET'
      ? { blobs: [{ pathname: 'academy-one/content-test.json', url: 'https://test.private.blob.vercel-storage.com/academy-one/content-test.json', uploadedAt: new Date().toISOString() }], hasMore: false }
      : { url: 'https://test.private.blob.vercel-storage.com/content.json', pathname: 'content.json', contentType: 'application/json', contentDisposition: 'inline' } };
  });
  assert.equal((await readContent()).groupClasses.english, 88);
  const saved = await writeContent(defaultContent);
  assert.ok(saved.updatedAt);
  assert.deepEqual(methods, ['GET', 'PUT']);
  delete process.env.BLOB_STORE_ID;
  await assert.rejects(writeContent(defaultContent), /Blob storage is not configured/);
  assert.deepEqual(methods, ['GET', 'PUT']);
});
