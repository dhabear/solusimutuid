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

// ---- UI sound effects (synthesized via Web Audio, no asset files) ----
(() => {
  let actx = null;
  const getCtx = () => {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  };

  // Short tone with an attack/decay envelope so it doesn't click/pop
  function blip({ freq = 880, type = 'sine', dur = 0.08, gain = 0.05, slideTo = null }) {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }

  // Two distinct sounds
  const playHover = () => blip({ freq: 1650, type: 'sine', dur: 0.06, gain: 0.035 });
  const playClick = () => blip({ freq: 330, slideTo: 170, type: 'triangle', dur: 0.15, gain: 0.075 });

  // Browsers block audio until a user gesture — unlock on first interaction
  const unlock = () => getCtx();
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });

  const HOVER_SEL = '.btn, nav.main-nav a, .nav-icons .search-btn, .jasa-item, .jasa-frame, .article-card, .acc-head, .socials a, .footer-grid ul li a, .cta-contact, .wa-float, .logo';
  const CLICK_SEL = 'a, button, .btn, .acc-head, .nav-icons .search-btn, .hamburger, .cta-contact, .jasa-item, .wa-float';

  // Hover: fire once per enter, lightly throttled
  let lastHover = 0;
  document.querySelectorAll(HOVER_SEL).forEach(el => {
    el.addEventListener('mouseenter', () => {
      const now = performance.now();
      if (now - lastHover < 45) return;
      lastHover = now;
      playHover();
    });
  });

  // Click: delegated, only for interactive targets
  document.addEventListener('click', (e) => {
    if (e.target.closest(CLICK_SEL)) playClick();
  });
})();
