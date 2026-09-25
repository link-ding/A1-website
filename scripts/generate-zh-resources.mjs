import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd();
const pages=JSON.parse(await readFile(path.join(root,'data/zh-resources.json'),'utf8'));
const register='https://academyoneprivatetuition.teachworks.com/form/academy-one-private-tutoring-student-registration-form';
const esc=value=>String(value).replace(/[&<>\"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));

function nav(currentSlug){
  return `<aside class="trial-banner" aria-label="试课信息"><div class="trial-banner-inner"><p>一对一试课按单次 1.5 小时课程收费；小班试课每 1.5 小时 $75。</p><a href="/contact/#trial-lesson">预约试课</a></div></aside><header class="site-header"><div class="header-inner"><a class="brand" href="/" aria-label="Academy One 首页"><img src="/assets/academy-one-crest.png" alt=""><span><strong>Academy One</strong><small>Private Tuition</small></span></a><nav class="primary-nav" aria-label="主导航"><a href="/courses">课程</a><a href="/pricing/">学费</a><a href="/tutors/">师资</a><a href="/timetable">课程表</a><a href="/careers/">招聘</a><a href="/contact/">联系</a><details class="nav-resources"><summary>资源</summary><div class="nav-resources-menu"><a href="/zh/resources/atar-calculator/">ATAR 估算工具</a><a href="/zh/resources/how-is-atar-calculated/">ATAR 如何计算</a><a href="/zh/resources/hsc-scaling/">HSC Scaling 详解</a><a href="/zh/resources/hsc-study-tips/">HSC 学习建议</a><a href="/zh/resources/selective-oc-guides/">精英中学 / OC 指南</a></div></details></nav><div class="header-actions"><a class="language-switch" href="/${currentSlug}/" data-language="en" lang="en-AU">English</a><a class="header-cta" href="${register}" target="_blank" rel="noopener">报名</a></div></div></header>`;
}

function footer(){
  return `<footer class="site-footer"><div class="footer-inner"><div class="footer-grid"><div><img class="footer-logo" src="/assets/academy-one-logo.png" alt="Academy One Private Tuition"><p>Suite 403, 815 Pacific Highway<br>Chatswood NSW 2067</p></div><div><h3>课程</h3><a href="/tutoring/maths/">数学辅导</a><a href="/tutoring/english/">英语辅导</a><a href="/hsc-tutoring/">HSC 辅导</a><a href="/timetable">小班课程表</a><a href="/pricing/">学费</a></div><div><h3>中心信息</h3><a href="/credit">Credit Policy</a><a href="/zh/resources/atar-calculator/">ATAR 估算工具</a><a href="/zh/resources/how-is-atar-calculated/">ATAR 如何计算</a><a href="/careers/">招聘</a><a href="/contact/">联系</a><a href="https://www.google.com/search?q=Academy+One+Private+Tuition+Chatswood" target="_blank" rel="noopener">Google 评价</a></div><div><h3>联系方式</h3><a href="tel:+61486017931">0486 017 931</a><p>微信：academyonechatswood</p><a href="mailto:operations@academyone.com.au">operations@academyone.com.au</a><a href="mailto:admin@academyone.com.au">admin@academyone.com.au</a></div></div><div class="copyright">© 2026 Academy One Private Tuition · Chatswood NSW</div></div></footer>`;
}

function pageHtml(page){
  const english=`https://academyone.com.au/${page.slug}/`;
  const canonical=`https://academyone.com.au/zh/${page.slug}/`;
  const faqJson=page.faq.map(([question,answer])=>({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer}}));
  const schema=[
    {'@context':'https://schema.org','@type':'EducationalOrganization',name:'Academy One Private Tuition',url:'https://academyone.com.au/',telephone:'+61486017931',email:'operations@academyone.com.au',address:{'@type':'PostalAddress',streetAddress:'Suite 403, 815 Pacific Highway',addressLocality:'Chatswood',addressRegion:'NSW',postalCode:'2067',addressCountry:'AU'}},
    {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'首页',item:'https://academyone.com.au/'},{'@type':'ListItem',position:2,name:page.title,item:canonical}]},
    {'@context':'https://schema.org','@type':'FAQPage',mainEntity:faqJson},
    {'@context':'https://schema.org','@type':'Article',inLanguage:'zh-Hans-AU',headline:page.title,dateModified:'2026-09-25',author:{'@type':'Organization',name:'Academy One 教学团队'},publisher:{'@type':'EducationalOrganization',name:'Academy One Private Tuition'},mainEntityOfPage:canonical}
  ];
  const processTitle=page.slug.includes('how-is-atar')?'ATAR 计算过程':page.slug.includes('scaling')?'HSC Scaling 的基本过程':'可以实际执行的方法';
  return `<!doctype html><html lang="zh-Hans-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(page.title)} | Academy One</title><meta name="description" content="${esc(page.meta)}"><link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="en-AU" href="${english}"><link rel="alternate" hreflang="zh-Hans-AU" href="${canonical}"><link rel="alternate" hreflang="x-default" href="${english}"><meta property="og:type" content="article"><meta property="og:locale" content="zh_AU"><meta property="og:locale:alternate" content="en_AU"><meta property="og:title" content="${esc(page.title)} | Academy One"><meta property="og:description" content="${esc(page.meta)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://academyone.com.au/assets/academy-one-classroom.jpg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Libre+Baskerville:wght@400;700&family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Serif+SC:wght@500;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/seo-pages.css"><script type="application/ld+json">${JSON.stringify(schema)}</script></head><body>${nav(page.slug)}<main><div class="breadcrumbs"><a href="/">首页</a> <span aria-hidden="true">/</span> ${esc(page.type)} <span aria-hidden="true">/</span> ${esc(page.title)}</div><article><section class="hero"><img class="hero-image" src="/assets/academy-one-classroom.jpg" width="1672" height="941" alt="Academy One Chatswood 辅导课堂" fetchpriority="high"><div class="hero-inner"><div class="hero-copy"><p class="eyebrow">${esc(page.type)} · 悉尼</p><h1>${esc(page.h1)}</h1><p class="hero-lede">${esc(page.lede)}</p><div class="hero-actions"><a class="button" href="${register}" target="_blank" rel="noopener">提交报名意向</a><a class="text-link" href="/contact/">联系 Academy One →</a></div></div></div></section><section class="proof" aria-label="Academy One 简介"><div class="proof-inner"><div class="proof-item"><strong>98</strong><span>资深导师学生的 ATAR 中位数</span></div><div class="proof-item"><strong>2017</strong><span>自 2017 年开始辅导学生</span></div><div class="proof-item"><strong>Chatswood</strong><span>提供线下与线上课程</span></div></div></section><section class="section reveal"><div class="section-grid"><div><p class="eyebrow">核心要点</p><h2>${esc(page.introTitle)}</h2></div><div class="prose">${page.intro.map(text=>`<p>${esc(text)}</p>`).join('')}</div></div></section><section class="section reveal"><div class="section-grid"><div><p class="eyebrow">需要理解的概念</p><h2>作出决定前，先掌握这些重点。</h2></div><div class="levels">${page.levels.map(([title,text])=>`<section class="level"><h3>${esc(title)}</h3><p>${esc(text)}</p></section>`).join('')}</div></div></section><section class="section reveal"><div class="section-grid"><div><p class="eyebrow">具体方法</p><h2>${processTitle}</h2></div><ol class="topic-list">${page.topics.map(([title,text],index)=>`<li><span>0${index+1}</span><div><h3>${esc(title)}</h3><p>${esc(text)}</p></div></li>`).join('')}</ol></div></section><section class="section reveal"><div class="section-grid"><div><p class="eyebrow">常见问题</p><h2>${esc(page.type.replace('指南',''))}常见问题</h2></div><div class="faq-list">${page.faq.map(([question,answer])=>`<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('')}</div></div></section><section class="section reveal editorial-meta"><div class="section-grid"><div><p class="eyebrow">编辑信息</p><h2>经过审核，并列明资料来源。</h2></div><div class="prose"><p><strong>由 Academy One 教学团队审核。</strong><br>最后审核日期：2026 年 9 月 25 日。</p><h3>主要资料来源</h3><ul class="source-list">${page.sources.map(([label,url])=>`<li><a href="${url}" target="_blank" rel="noopener">${esc(label)} ↗</a></li>`).join('')}</ul></div></div></section></article><section class="related"><div class="related-inner"><p class="eyebrow">继续浏览</p><h2>找到适合学生的下一步。</h2><div class="related-links">${page.related.map(([url,label])=>`<a href="${url}">${esc(label)} →</a>`).join('')}</div></div></section><section class="final-cta"><h2>告诉我们学生接下来需要什么。</h2><p>请提供学生年级、科目、目前遇到的困难和适合的上课时间。我们会协助推荐合适的导师和课程形式。</p><a class="button" href="/contact/">联系 Academy One</a></section></main>${footer()}<script src="/assets/seo-pages.js" defer></script></body></html>`;
}

function localizeCalculator(html){
  const replacements=[
    ['<html lang="en-AU">','<html lang="zh-Hans-AU">'],
    ['Estimate your NSW ATAR by entering your HSC courses and expected marks. See which courses contribute to your best 10 units.','输入预计 HSC 成绩，估算新州 ATAR，并了解哪些课程会计入最佳 10 units。'],
    ['NSW ATAR Calculator — Academy One','新州 ATAR 估算工具 — Academy One'],
    ['<link rel="canonical" href="https://academyone.com.au/resources/atar-calculator/">','<link rel="canonical" href="https://academyone.com.au/zh/resources/atar-calculator/">'],
    ['<meta property="og:url" content="https://academyone.com.au/resources/atar-calculator/">','<meta property="og:url" content="https://academyone.com.au/zh/resources/atar-calculator/">'],
    ['Academy One NSW ATAR Calculator','Academy One 新州 ATAR 估算工具'],
    ['A planning calculator that estimates a NSW ATAR from expected HSC marks using Academy One\'s model.','使用 Academy One 模型，根据预计 HSC 成绩进行学习规划的 ATAR 估算工具。'],
    ['<a class="language-link" href="/zh/resources/atar-calculator/" lang="zh-Hans">中文</a>','<a class="language-link" href="/resources/atar-calculator/" lang="en-AU">English</a>'],
    ['href="/resources/how-is-atar-calculated/"','href="/zh/resources/how-is-atar-calculated/"'],
    ['How ATAR is calculated','ATAR 如何计算'],
    ['Trial lesson information','试课信息'],
    ['Private trials are one-off 1.5-hour lessons at the applicable private rate. Group trials are $75 for 1.5 hours.','一对一试课按单次 1.5 小时课程收费；小班试课每 1.5 小时 $75。'],
    ['Book your trial lesson','预约试课'],
    ['NSW HSC · Study planning tool','NSW HSC · 学习规划工具'],
    ['Where could your marks take you?','你的成绩可能对应怎样的 ATAR？'],
    ['Add your courses and expected HSC marks. The calculator includes at least 2 units of English, then selects your best 10 units to produce a planning estimate.','添加课程和预计 HSC 成绩。估算工具会先计入至少 2 units 英语，再选出最佳 10 units，提供用于规划的 ATAR 估算。'],
    ['About this estimate','关于本次估算'],
    ['Academy One simulation 2026.09. This is a rough planning estimate using modelled scaling, not UAC data. Actual scaling and your final ATAR may differ. This tool is not affiliated with UAC.','Academy One simulation 2026.09。本工具使用模型化 scaling 提供粗略规划估算，并非采用 UAC 官方数据。实际 scaling 和最终 ATAR 可能不同；本工具与 UAC 无关联。'],
    ['Courses and expected marks','课程与预计成绩'],
    ['At least 10 units · Extension marks may be out of 50','至少 10 units · Extension 成绩可能以 50 分为满分'],
    ['<span>Course</span><span>HSC mark</span>','<span>课程</span><span>HSC 成绩</span>'],
    ['＋ Add a course','＋ 添加课程'],
    ['Update estimate','更新估算'],
    ['Simulated ATAR estimate','ATAR 模拟估算'],
    ['Updates as you edit your courses','修改课程后会自动更新'],
    ['Simulated aggregate','模拟 Aggregate'],
    ['Courses in your best 10 units','计入最佳 10 units 的课程'],
    ['How the estimate works','估算方法'],
    ['Validate the course pattern','检查课程组合'],
    ['The tool checks English and Mathematics Extension prerequisites and the core NSW ATAR eligibility rules.','工具会检查英语与 Mathematics Extension 的先修关系，以及新州 ATAR 的基本资格规则。'],
    ['Select the best 10 units','选取最佳 10 units'],
    ['At least 2 units of English are included first, followed by the highest remaining contributions.','首先计入至少 2 units 英语，再选取其余贡献最高的 units。'],
    ['Estimate your ATAR','估算 ATAR'],
    ['The aggregate is mapped to a planning estimate. Actual scaling changes from year to year.','系统将 aggregate 映射为规划估算；实际 scaling 每年都会变化。'],
    ['Remove course','删除课程'],
    ['For study planning only','仅供学习规划'],
    ['UAC calculation rules','UAC 计算规则'],
    ['href="/resources/hsc-scaling/"','href="/zh/resources/hsc-scaling/"'],
    ['HSC scaling explained','HSC Scaling 详解'],
    ['HSC tutoring','HSC 辅导']
  ];
  return replacements.reduce((output,[from,to])=>output.split(from).join(to),html)
    .replace('"url":"https://academyone.com.au/resources/atar-calculator/"','"url":"https://academyone.com.au/zh/resources/atar-calculator/"')
    .replace('<meta property="og:title"','<meta property="og:locale" content="zh_AU"><meta property="og:locale:alternate" content="en_AU"><meta property="og:title"');
}

for(const page of pages){
  const directory=path.join(root,'zh',page.slug);
  await mkdir(directory,{recursive:true});
  await writeFile(path.join(directory,'index.html'),pageHtml(page));
}

const calculator=await readFile(path.join(root,'atar-calculator.html'),'utf8');
const calculatorDirectory=path.join(root,'zh','resources','atar-calculator');
await mkdir(calculatorDirectory,{recursive:true});
await writeFile(path.join(calculatorDirectory,'index.html'),localizeCalculator(calculator));

console.log(`Generated ${pages.length+1} Chinese resource pages.`);
