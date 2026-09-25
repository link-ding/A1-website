import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const root=new URL('../',import.meta.url);

test('generated pages use the same complete navbar controls as the homepage',async()=>{
  for(const page of ['pricing/index.html','tutors/index.html','tutoring/english/index.html']){
    const html=await readFile(new URL(page,root),'utf8');
    assert.match(html,/class="header-actions"/);
    assert.match(html,/data-language="zh"[^>]*>中文<\/a>/);
    assert.match(html,/class="header-cta"[^>]*>Register<\/a>/);
    assert.doesNotMatch(html,/menu-toggle/);
    for(const label of ['Courses','Pricing','Tutors','Timetable','Careers','Contact','Resources']){
      assert.match(html,new RegExp(`>${label}<`));
    }
  }
});

test('responsive navbar remains visible and scrollable on narrow screens',async()=>{
  const css=await readFile(new URL('assets/seo-pages.css',root),'utf8');
  assert.match(css,/@media\(max-width:1100px\).*?\.primary-nav\{[^}]*display:flex[^}]*overflow-x:auto/s);
  assert.doesNotMatch(css,/\.primary-nav\{display:none/);
  assert.doesNotMatch(css,/\.header-cta\{display:none/);
});
