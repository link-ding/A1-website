const pageLanguage=document.documentElement.lang.startsWith('zh')?'zh':'en';
let preferredLanguage;
try{preferredLanguage=localStorage.getItem('academy-one-language');}catch{}
if(preferredLanguage!=='zh'&&preferredLanguage!=='en'){
  const systemLanguage=navigator.languages?.[0]||navigator.language||'en';
  preferredLanguage=/^zh(?:-|$)/i.test(systemLanguage)?'zh':'en';
}
if(preferredLanguage!==pageLanguage){
  const alternate=[...document.querySelectorAll('link[rel="alternate"][hreflang]')]
    .find(link=>link.hreflang.toLowerCase().startsWith(preferredLanguage));
  if(alternate){
    const target=new URL(alternate.href,location.href);
    location.replace(target.pathname+location.search+location.hash);
  }
}
document.querySelector('[data-language]')?.addEventListener('click',event=>{
  try{localStorage.setItem('academy-one-language',event.currentTarget.dataset.language);}catch{}
});
const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}})},{threshold:.12}):null;
document.querySelectorAll('.reveal').forEach(el=>observer?observer.observe(el):el.classList.add('is-visible'));
document.querySelectorAll('.final-cta .button').forEach(button=>button.href='/contact/');

if(location.pathname.replace(/\/$/,'')==='/tutoring/english'){
  document.querySelector('.hero-actions .text-link')?.remove();
  const enquiryButton=document.querySelector('.hero-actions .button');
  if(enquiryButton)enquiryButton.textContent='Enquiry now';
  const heroLede=document.querySelector('.hero-lede');
  if(heroLede)heroLede.textContent='We cover Years 6–10 English, HSC English Standard, HSC English Advanced, HSC English Extension 1 and 2, and HSC EAL/D.';
}

const classStructurePages=new Set(['/tutoring/maths','/tutoring/english','/tutoring/physics']);
if(classStructurePages.has(location.pathname.replace(/\/$/,''))){
  const lessonProcess=document.querySelector('.topic-list')?.closest('.section');
  lessonProcess?.insertAdjacentHTML('afterend',`<section class="section class-structure"><div class="section-grid"><div><p class="eyebrow">Lesson formats</p><h2>What we offer: class structure.</h2><p class="section-intro">Choose the lesson format that best fits the student’s goals and learning needs.</p></div><div class="levels"><section class="level"><h3>One-on-one tuition</h3><p>Individual support tailored to the student’s level, school program and learning goals. <a class="text-link" href="/pricing/">View pricing →</a></p></section><section class="level"><h3>Group classes</h3><p>Structured small-group lessons, with available subjects and current fees listed on our pricing page. <a class="text-link" href="/pricing/">View pricing →</a></p></section></div></div></section>`);
}

const contactWechat=[...document.querySelectorAll('.contact-grid article p')].find(el=>el.textContent.trim().startsWith('WeChat:'));
if(contactWechat&&!contactWechat.parentElement.querySelector('img[src="/assets/wechat-qr.jpg"]')){
  const qr=document.createElement('img');
  qr.src='/assets/wechat-qr.jpg';
  qr.alt='Academy One WeChat QR code';
  qr.width=730;
  qr.height=730;
  Object.assign(qr.style,{display:'block',width:'min(100%, 220px)',height:'auto',marginTop:'20px',borderRadius:'6px'});
  contactWechat.after(qr);
}

const pricingPage=document.querySelector('.pricing-page');
if(pricingPage){
  fetch('/api/content',{cache:'no-store'})
    .then(response=>{if(!response.ok)throw new Error('Could not load current pricing.');return response.json();})
    .then(content=>{
      const subjects=['english','maths','humanitiesScience','economicsBusiness'];
      const tables=pricingPage.querySelectorAll('table tbody');
      subjects.forEach((subject,index)=>{
        if(!tables[index]||!Array.isArray(content.pricing[subject]))return;
        const rows=content.pricing[subject].map(row=>{
          const tr=document.createElement('tr');
          const label=document.createElement('th');
          label.textContent=pageLanguage==='zh'?row.labelZh:row.labelEn;
          tr.append(label);
          row.values.forEach(value=>{
            const cell=document.createElement('td');
            cell.textContent=value==null?(pageLanguage==='zh'?'暂不提供':'Not available'):`$${value}`;
            tr.append(cell);
          });
          return tr;
        });
        tables[index].replaceChildren(...rows);
      });
      const groups=pricingPage.querySelectorAll('.group-prices span');
      ['english','mathematics'].forEach((subject,index)=>{
        const amount=content.groupClasses[subject];
        groups[index].replaceChildren(
          document.createTextNode(pageLanguage==='zh'?`每节 1.5 小时课程约 $${amount}`:`Approx. $${amount} per 1.5-hour class`),
          document.createElement('br'),
          document.createTextNode(pageLanguage==='zh'?'仅限整套课程报名':'Package enrolment only')
        );
      });
    })
    .catch(error=>console.error('Could not update pricing:',error));
}

const tutorDirectory=document.querySelector('.directory');
if(tutorDirectory){
  fetch('/api/content',{cache:'no-store'})
    .then(response=>{if(!response.ok)throw new Error('Could not load current tutors.');return response.json();})
    .then(content=>{
      const esc=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
      const zh=pageLanguage==='zh';
      tutorDirectory.innerHTML=content.tutors.filter(tutor=>!tutor.hidden).map(tutor=>{
        const p=tutor[pageLanguage];
        const name=esc(String(p.name||'').replace(/^Dr\s+/i,'').trim().split(/\s+/)[0]);
        return `<article class="profile-card" id="${esc(tutor.id)}"><p class="eyebrow">${esc(p.role)} · ${esc(p.tag||tutor.group)}</p><h2>${name}</h2><p class="profile-subject"><strong>${zh?'授课科目：':'Teaches:'}</strong> ${esc(p.subject)}</p><p>${esc(p.hook)}</p><details><summary>${zh?'查看完整简介':'View full profile'}</summary><h3>${zh?'学历与教学经验':'Qualifications and experience'}</h3><p>${esc(p.qual)}</p><p>${esc(p.bio)}</p><h3>${zh?'部分教学成果':'Selected teaching information'}</h3><p>${esc(p.result)}</p><p><strong>${zh?'授课形式与当前时间：':'Format and current availability:'}</strong> ${zh?'请在咨询时向 Academy One 确认。':'confirm with Academy One when enquiring.'}</p></details><a class="text-link" href="/contact/">${zh?'咨询':'Ask about'} ${name} →</a></article>`;
      }).join('');
    })
    .catch(error=>console.error('Could not update tutors:',error));
}
