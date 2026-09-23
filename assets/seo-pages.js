const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.primary-nav');
menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',String(open));});
const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}})},{threshold:.12}):null;
document.querySelectorAll('.reveal').forEach(el=>observer?observer.observe(el):el.classList.add('is-visible'));

const contactWechat=[...document.querySelectorAll('.contact-grid article p')].find(el=>el.textContent.trim().startsWith('WeChat:'));
if(contactWechat){
  const qr=document.createElement('img');
  qr.src='/assets/wechat-qr.jpg';
  qr.alt='Academy One WeChat QR code';
  qr.width=730;
  qr.height=730;
  Object.assign(qr.style,{display:'block',width:'min(100%, 220px)',height:'auto',marginTop:'20px',borderRadius:'6px'});
  contactWechat.after(qr);
}
