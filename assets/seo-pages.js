const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.primary-nav');
menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',String(open));});
const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}})},{threshold:.12}):null;
document.querySelectorAll('.reveal').forEach(el=>observer?observer.observe(el):el.classList.add('is-visible'));
