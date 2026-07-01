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

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const mainNav = document.querySelector('.main-nav > ul');
hamburger.addEventListener('click', () => {
  const open = mainNav.style.display === 'flex';
  mainNav.style.display = open ? 'none' : 'flex';
  mainNav.style.cssText += open ? '' : 'position:absolute;top:70px;left:0;right:0;background:#fff;flex-direction:column;padding:20px 24px;gap:16px;box-shadow:0 12px 24px rgba(0,0,0,.1);';
});

// Sticky header: elevate on scroll, hide once past the "Jasa Kami" section
const headerEl = document.querySelector('header');
const jasaSection = document.getElementById('jasa');
window.addEventListener('scroll', () => {
  headerEl.style.boxShadow = window.scrollY > 10 ? '0 6px 24px rgba(20,30,80,.06)' : 'none';
  const jasaBottom = jasaSection.offsetTop + jasaSection.offsetHeight;
  headerEl.classList.toggle('header-hidden', window.scrollY > jasaBottom);
});

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
