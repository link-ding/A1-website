import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const root=new URL('../',import.meta.url);

test('custom 404 page is branded, bilingual and useful',async()=>{
  const html=await readFile(new URL('404.html',root),'utf8');

  assert.match(html,/<meta name="robots" content="noindex,follow">/);
  assert.match(html,/This page missed the lesson\./);
  assert.match(html,/这个页面好像走错了教室。/);
  assert.match(html,/href="\/"/);
  assert.match(html,/href="\/contact\/"/);
  assert.match(html,/navigator\.languages\?\.\[0\]\|\|navigator\.language/);
  assert.match(html,/localStorage\.setItem\('academy-one-language',language\)/);
  assert.match(html,/@media\(prefers-reduced-motion:reduce\)/);
});

test('the local development server returns the custom page with a 404 status',async()=>{
  const server=await readFile(new URL('dev-server.js',root),'utf8');

  assert.match(server,/readFile\(path\.join\(root, '404\.html'\)\)/);
  assert.match(server,/writeHead\(404, \{\s*'Content-Type': 'text\/html; charset=utf-8'/s);
});
