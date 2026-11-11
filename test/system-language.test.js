import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const root=new URL('../',import.meta.url);

test('localized static pages follow the saved or system language',async()=>{
  const script=await readFile(new URL('assets/seo-pages.js',root),'utf8');

  assert.match(script,/localStorage\.getItem\('academy-one-language'\)/);
  assert.match(script,/navigator\.languages\?\.\[0\]\|\|navigator\.language/);
  assert.match(script,/link\[rel="alternate"\]\[hreflang\]/);
  assert.match(script,/location\.replace\(/);
  assert.doesNotMatch(script,/setItem\('academy-one-language',pageLanguage\)/);
});

test('the standalone ATAR calculator uses the same language preference behaviour',async()=>{
  const script=await readFile(new URL('atar-calculator.js',root),'utf8');

  assert.match(script,/localStorage\.getItem\('academy-one-language'\)/);
  assert.match(script,/navigator\.languages\?\.\[0\]\|\|navigator\.language/);
  assert.match(script,/location\.replace\(/);
  assert.match(script,/querySelector\('\.language-link'\).*addEventListener\('click'/s);
  assert.doesNotMatch(script,/setItem\('academy-one-language',isChinese\?'zh':'en'\)/);
});
