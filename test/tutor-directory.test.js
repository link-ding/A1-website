import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

for (const language of ['en', 'zh']) {
  test(`${language} tutor directory renders saved profiles and excludes hidden tutors`, async () => {
    const script = await readFile(new URL('../assets/seo-pages.js', import.meta.url), 'utf8');
    const directory = { innerHTML: 'old profiles' };
    const profile = { name: 'Dr New Tutor', role: 'Senior', tag: 'Maths', subject: 'Updated subject', hook: '<img onerror="bad">', qual: 'Updated qualification', bio: 'Updated biography', result: 'Updated results' };
    const calls = [];
    runInNewContext(script, {
      document: {
        documentElement: { lang: language },
        querySelector: selector => selector === '.directory' ? directory : null,
        querySelectorAll: () => []
      },
      window: {}, navigator: {}, localStorage: { getItem: () => language },
      location: { pathname: '/tutors/' }, console,
      fetch: async (url, options) => {
        calls.push({ url, options });
        return { ok: true, json: async () => ({ tutors: [
          { id: 'new-tutor', hidden: false, en: profile, zh: { ...profile, name: '新导师', bio: '更新简介' } },
          { id: 'hidden-tutor', hidden: true, en: profile, zh: profile }
        ] }) };
      }
    });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(calls[0].url, '/api/content');
    assert.equal(calls[0].options.cache, 'no-store');
    assert.match(directory.innerHTML, /id="new-tutor"/);
    assert.doesNotMatch(directory.innerHTML, /hidden-tutor|old profiles|<img/);
    assert.match(directory.innerHTML, /&lt;img/);
    assert.match(directory.innerHTML, language === 'en' ? /<h2>New<\/h2>.*Updated biography/ : /<h2>新导师<\/h2>.*更新简介/);
  });
}
