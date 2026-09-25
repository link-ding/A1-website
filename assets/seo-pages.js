document.querySelector('[data-language="zh"]')?.addEventListener('click',()=>{
  try{localStorage.setItem('academy-one-language','zh');}catch{}
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
