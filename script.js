// Nav background on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Subtle hero parallax (relative to the hero's own position — it sits below the intro)
const heroBg = document.querySelector('.hero-bg');
const heroSection = document.querySelector('.hero');
window.addEventListener('scroll', () => {
  if (!heroBg || !heroSection) return;
  const rel = Math.max(0, window.scrollY - heroSection.offsetTop);
  heroBg.style.transform = `scale(1.05) translateY(${rel * 0.12}px)`;
}, { passive: true });

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Animated stat counters
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach((el) => counterObserver.observe(el));

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
function openLightbox(src) { lightboxImg.src = src; lightbox.classList.add('open'); }
document.getElementById('lightbox-close').addEventListener('click', () => lightbox.classList.remove('open'));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.remove('open'); });

// Showcase slideshow
(function initShowcase() {
  const root = document.getElementById('showcase');
  if (!root) return;
  const slides = Array.from(root.querySelectorAll('.showcase-slide'));
  const dotsWrap = document.getElementById('showcase-dots');
  const prevBtn = document.getElementById('showcase-prev');
  const nextBtn = document.getElementById('showcase-next');
  let current = 0;
  let timer = null;
  const AUTOPLAY_MS = 5500;

  slides.forEach((slide, i) => {
    const dot = document.createElement('button');
    dot.className = 'showcase-dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
    slide.querySelector('img').addEventListener('click', (e) => openLightbox(e.target.src));
  });
  const dots = Array.from(dotsWrap.children);

  function goTo(index) {
    if (index === current) return;
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    restart();
  }
  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }
  function restart() { clearInterval(timer); timer = setInterval(next, AUTOPLAY_MS); }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', restart);
  restart();
})();

// Brochure unlock — only filling out the callback form reveals the download
const brochureUnlock = document.getElementById('brochure-unlock');
function unlockBrochure() {
  if (brochureUnlock) brochureUnlock.classList.add('show');
}

// WhatsApp — embed the brochure link in the pre-filled message, so sending it
// puts the brochure right in the chat thread (only when the site is hosted;
// a local file path would be meaningless in WhatsApp)
const whatsappBtn = document.getElementById('whatsapp-btn');
let waMessage = 'Hi, I am interested in Mirai Properties.';
if (location.protocol === 'https:' || location.protocol === 'http:') {
  const brochureUrl = new URL('MIRAI-Brochure.pdf', location.href).href;
  waMessage += `\n\nMIRAI Brochure: ${brochureUrl}`;
}
whatsappBtn.href = 'https://wa.me/919734562999?text=' + encodeURIComponent(waMessage);

// Callback form — no backend; opens a prefilled email to the developer
const form = document.getElementById('callback-form');
const success = document.getElementById('form-success');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = data.get('name');
  const phone = `${data.get('country')} ${data.get('phone')}`;
  const time = data.get('time');
  const subject = encodeURIComponent(`Callback request — ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nPhone: ${phone}\nPreferred time of day: ${time || 'No preference'}\n\nRequesting a callback about Sree Sudha's MIRAI.`
  );
  window.location.href = `mailto:sreesudhapromoters@gmail.com?subject=${subject}&body=${body}`;
  success.classList.add('show');
  unlockBrochure();
  form.reset();
});
