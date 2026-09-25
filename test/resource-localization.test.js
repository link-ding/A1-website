import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const articleSlugs=['how-is-atar-calculated','hsc-scaling','hsc-study-tips','selective-oc-guides'];
const allSlugs=['atar-calculator',...articleSlugs];

test('resource pages expose reciprocal English and Chinese SEO alternates',async()=>{
  for(const slug of articleSlugs){
    const englishUrl=`https://academyone.com.au/resources/${slug}/`;
    const chineseUrl=`https://academyone.com.au/zh/resources/${slug}/`;
    const english=await readFile(new URL(`resources/${slug}/index.html`,root),'utf8');
    const chinese=await readFile(new URL(`zh/resources/${slug}/index.html`,root),'utf8');

    assert.match(english,new RegExp(`<link rel="canonical" href="${englishUrl}">`));
    assert.match(english,new RegExp(`hreflang="zh-Hans-AU" href="${chineseUrl}"`));
    assert.match(english,new RegExp(`class="language-switch" href="/zh/resources/${slug}/"`));

    assert.match(chinese,/<html lang="zh-Hans-AU">/);
    assert.match(chinese,new RegExp(`<link rel="canonical" href="${chineseUrl}">`));
    assert.match(chinese,new RegExp(`hreflang="en-AU" href="${englishUrl}"`));
    assert.match(chinese,new RegExp(`class="language-switch" href="/resources/${slug}/"`));
    assert.match(chinese,/"inLanguage":"zh-Hans-AU"/);
  }
});

test('Chinese resource articles contain fully localized body content',async()=>{
  const expectations={
    'how-is-atar-calculated':'ATAR 是排名，不是平均分',
    'hsc-scaling':'Scaling 要解决什么问题',
    'hsc-study-tips':'稳定进步需要反馈循环',
    'selective-oc-guides':'先关注分数背后的能力'
  };
  for(const [slug,heading] of Object.entries(expectations)){
    const html=await readFile(new URL(`zh/resources/${slug}/index.html`,root),'utf8');
    assert.match(html,new RegExp(heading));
    assert.match(html,/由 Academy One 教学团队审核/);
    assert.match(html,/告诉我们学生接下来需要什么/);
  }
});

test('ATAR calculator has an independently indexable Chinese version',async()=>{
  const english=await readFile(new URL('atar-calculator.html',root),'utf8');
  const chinese=await readFile(new URL('zh/resources/atar-calculator/index.html',root),'utf8');
  assert.match(english,/hreflang="zh-Hans-AU" href="https:\/\/academyone\.com\.au\/zh\/resources\/atar-calculator\/"/);
  assert.match(chinese,/<html lang="zh-Hans-AU">/);
  assert.match(chinese,/<link rel="canonical" href="https:\/\/academyone\.com\.au\/zh\/resources\/atar-calculator\/">/);
  assert.match(chinese,/ATAR 模拟估算/);
  assert.match(chinese,/href="\/resources\/atar-calculator\/" lang="en-AU">English<\/a>/);
});

test('sitemap includes every Chinese resource URL',async()=>{
  const sitemap=await readFile(new URL('sitemap.xml',root),'utf8');
  for(const slug of allSlugs){
    assert.match(sitemap,new RegExp(`<loc>https://academyone.com.au/zh/resources/${slug}/</loc>`));
  }
});
