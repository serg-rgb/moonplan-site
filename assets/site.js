'use strict';

// Content and navigation remain usable with JavaScript disabled.
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reduced.matches && 'IntersectionObserver' in window) {
  const reveal = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => {
    // Enhance only elements below the initial viewport; never hide the hero.
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.classList.add('reveal-ready');
      reveal.observe(el);
    }
  });
  const words = document.querySelectorAll('.word');
  if (words.length) {
    const tagline = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = [...words].indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('lit'), index * 45);
          tagline.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6, rootMargin:'0px 0px -15% 0px' });
    document.querySelector('.tagline').classList.add('word-reveal');
    words.forEach(word => tagline.observe(word));
  }
  reduced.addEventListener('change', event => {
    if (event.matches) document.querySelectorAll('.reveal-ready,.word').forEach(el => el.classList.add('visible','lit'));
  });
}

const menu = document.querySelector('.mobile-menu');
if (menu) {
  const summary = menu.querySelector('summary');
  menu.addEventListener('toggle', () => {
    document.body.classList.toggle('menu-open',menu.open);
    summary.setAttribute('aria-expanded',String(menu.open));
  });
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.open=false;}));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) { menu.open=false; summary.focus(); }
    if (event.key === 'Tab' && menu.open) {
      const items=[summary,...menu.querySelectorAll('a')];
      const first=items[0],last=items[items.length-1];
      if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
      if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', event=>{if(event.matches)menu.open=false;});
}

document.querySelectorAll('.copy-email').forEach(button=>{
  button.addEventListener('click',async()=>{
    const status=button.closest('.contact-card').querySelector('.copy-status');
    try {
      await navigator.clipboard.writeText(button.dataset.email);
      status.textContent=button.dataset.success;
    } catch {
      status.textContent=button.dataset.error;
    }
  });
});

// Language menu: close on outside click and Escape (it also works without JavaScript).
const langMenu = document.querySelector('.lang-menu');
if (langMenu) {
  document.addEventListener('click', event => { if (langMenu.open && !langMenu.contains(event.target)) langMenu.open = false; });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && langMenu.open) { langMenu.open = false; langMenu.querySelector('summary').focus(); }
  });
}
