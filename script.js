// Accordion
document.querySelectorAll('.acc-head').forEach(head => {
  head.addEventListener('click', () => {
    const item = head.parentElement;
    const isActive = item.classList.contains('active');
    item.parentElement.querySelectorAll('.acc-item').forEach(i => {
      i.classList.remove('active');
      i.querySelector('.toggle i').className = 'fa-solid fa-plus';
    });
    if (!isActive) {
      item.classList.add('active');
      item.querySelector('.toggle i').className = 'fa-solid fa-minus';
    }
  });
});

const header = document.querySelector('header');

// Mobile menu: toggle a class (CSS handles the panel + hamburger animation)
const hamburger = document.getElementById('hamburger');
hamburger.addEventListener('click', () => header.classList.toggle('nav-open'));

// Close the menu after tapping a link, and when resizing back to desktop
document.querySelectorAll('nav.main-nav a').forEach(a => {
  a.addEventListener('click', () => header.classList.remove('nav-open'));
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 900) header.classList.remove('nav-open');
});

// Sticky header: elevate on scroll, hide when scrolling down, reveal when scrolling up.
// Also drive the top scroll-progress bar.
const progress = document.getElementById('scrollProgress');

// Scrollspy pairs (link → section), sorted by document position
const navLinks = [...document.querySelectorAll('nav.main-nav > ul > li > a[href^="#"]')];
const spyPairs = navLinks
  .map(a => ({ link: a, sec: document.querySelector(a.getAttribute('href')) }))
  .filter(p => p.sec)
  .sort((a, b) => a.sec.offsetTop - b.sec.offsetTop);

function updateSpy(y) {
  const line = y + window.innerHeight * 0.35;
  let current = null;
  for (const p of spyPairs) {
    if (p.sec.offsetTop <= line) current = p;
  }
  navLinks.forEach(a => a.classList.toggle('active', current && a === current.link));
}

let lastY = window.scrollY;
function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 10);

  if (!header.classList.contains('nav-open')) {
    if (y > lastY && y > 240) header.classList.add('header-hidden');
    else header.classList.remove('header-hidden');
  }
  lastY = y;

  const docH = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = docH > 0 ? (y / docH * 100) + '%' : '0%';

  updateSpy(y);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Scroll reveal animations
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// "Whisper": word-by-word staggered fade + slide reveal for text content.
// Only touches text nodes (icons/toggles inside the same element are left untouched).
function whisperify(el) {
  let i = 0;
  [...el.childNodes].forEach(node => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (part === '') return;
        if (/^\s+$/.test(part)) {
          // Wrap in a span (not a bare text node) so flex containers like
          // .eyebrow don't collapse whitespace-only text runs between words.
          const space = document.createElement('span');
          space.className = 'ww-space';
          space.textContent = part;
          frag.appendChild(space);
          return;
        }
        const word = document.createElement('span');
        word.className = 'ww';
        const inner = document.createElement('span');
        inner.textContent = part;
        inner.style.setProperty('--i', i++);
        word.appendChild(inner);
        frag.appendChild(word);
      });
      node.replaceWith(frag);
    }
  });
  el.classList.add('whisper');
}

const WHISPER_SELECTOR = [
  '.page-hero h1',
  '.hero-text h1 .line',
  '.section-title',
  '.about-text h2',
  '.about-text p',
  '.jasa-item-body h3',
  '.jasa-item-body p',
  '.acc-body p',
  '.article-body h3',
  '.article-body p',
  '.cta-inner h3',
  '.footer-grid p',
  '.eyebrow'
].join(',');

const whisperEls = document.querySelectorAll(WHISPER_SELECTOR);
whisperEls.forEach(whisperify);

const whisperObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      whisperObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
whisperEls.forEach(el => whisperObserver.observe(el));
