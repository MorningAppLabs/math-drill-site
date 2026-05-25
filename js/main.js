/* ============================================================
   Math Drill Website — Main JavaScript
   ============================================================ */

// ── Theme toggle ──────────────────────────────────────────────
const THEME_KEY = 'md-theme';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || getSystemTheme());
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ── Mobile nav ────────────────────────────────────────────────
function initMobileNav() {
  const toggle = document.getElementById('menu-toggle');
  const navbar = document.getElementById('navbar');
  if (!toggle || !navbar) return;
  toggle.addEventListener('click', () => {
    navbar.classList.toggle('navbar--open');
    const isOpen = navbar.classList.contains('navbar--open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.querySelectorAll('span')[0].style.transform = isOpen ? 'rotate(45deg) translateY(7px)' : '';
    toggle.querySelectorAll('span')[1].style.opacity  = isOpen ? '0' : '1';
    toggle.querySelectorAll('span')[2].style.transform = isOpen ? 'rotate(-45deg) translateY(-7px)' : '';
  });
  // close on link click
  navbar.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navbar.classList.remove('navbar--open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
}

// ── Scroll animations ─────────────────────────────────────────
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 60);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  elements.forEach(el => observer.observe(el));
}

// ── FAQ accordion ─────────────────────────────────────────────
function initFAQ() {
  document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item');
      const isOpen = item.classList.contains('open');
      // close all
      document.querySelectorAll('.faq__item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ── Animated counter ─────────────────────────────────────────
function animateCounter(el, target, duration = 1200) {
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    el.textContent = Math.floor(ease * target).toLocaleString('en-IN') + (el.dataset.suffix || '');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el, parseInt(el.dataset.counter, 10));
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}

// ── Screenshot Lightbox ──────────────────────────────────────
function initLightbox() {
  const overlay  = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lb-img');
  const lbClose  = document.getElementById('lb-close');
  const lbPrev   = document.getElementById('lb-prev');
  const lbNext   = document.getElementById('lb-next');
  const lbCount  = document.getElementById('lb-counter');
  if (!overlay || !lbImg) return;

  // Collect all screenshot images lazily (after carousel renders)
  function getImages() {
    return Array.from(document.querySelectorAll('.screenshot-frame img'));
  }

  let current = 0;

  function open(index) {
    const imgs = getImages();
    if (!imgs.length) return;
    current = ((index % imgs.length) + imgs.length) % imgs.length;
    lbImg.src = imgs[current].src;
    lbImg.alt = imgs[current].alt;
    lbCount.textContent = (current + 1) + ' / ' + imgs.length;
    lbPrev.disabled = false;
    lbNext.disabled = false;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    open(current + dir);
  }

  // Attach click to every screenshot frame
  document.addEventListener('click', (e) => {
    const frame = e.target.closest('.screenshot-frame');
    if (!frame) return;
    const imgs = getImages();
    const img  = frame.querySelector('img');
    const idx  = imgs.indexOf(img);
    open(idx >= 0 ? idx : 0);
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', () => navigate(-1));
  lbNext.addEventListener('click', () => navigate(1));

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowRight')  navigate(1);
    if (e.key === 'ArrowLeft')   navigate(-1);
  });
}

// ── Screenshot Carousel ─────────────────────────────────────
function initCarousel() {
  const track   = document.getElementById('ss-track');
  const prevBtn = document.getElementById('ss-prev');
  const nextBtn = document.getElementById('ss-next');
  const dotsWrap = document.getElementById('ss-dots');
  if (!track || !prevBtn || !nextBtn) return;

  const frames = Array.from(track.querySelectorAll('.screenshot-frame'));
  const TOTAL  = frames.length;
  if (!TOTAL) return;

  // How many slides visible at once (responsive)
  function visibleCount() {
    const vw = window.innerWidth;
    if (vw >= 1024) return 5;
    if (vw >= 768)  return 4;
    if (vw >= 540)  return 3;
    return 2;
  }

  let index = 0; // index of leftmost visible slide
  const GAP = 18; // must match CSS gap

  function frameWidth() {
    return frames[0].getBoundingClientRect().width || (window.innerWidth <= 640 ? 150 : 190);
  }

  // Build dots
  function buildDots() {
    dotsWrap.innerHTML = '';
    const pages = TOTAL - visibleCount() + 1;
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot' + (i === 0 ? ' carousel__dot--active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.carousel__dot').forEach((d, i) => {
      d.classList.toggle('carousel__dot--active', i === index);
    });
  }

  function maxIndex() {
    return Math.max(0, TOTAL - visibleCount());
  }

  function goTo(i) {
    index = Math.max(0, Math.min(i, maxIndex()));
    const offset = index * (frameWidth() + GAP);
    track.style.transform = `translateX(-${offset}px)`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index >= maxIndex();
    updateDots();
  }

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));

  // Touch / swipe support
  let touchStartX = 0;
  track.parentElement.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.parentElement.addEventListener('touchend', e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) dx > 0 ? goTo(index + 1) : goTo(index - 1);
  }, { passive: true });

  // Keyboard arrow support
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('ss-carousel')) return;
    if (e.key === 'ArrowRight') goTo(index + 1);
    if (e.key === 'ArrowLeft')  goTo(index - 1);
  });

  // Rebuild on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(Math.min(index, maxIndex()));
    }, 150);
  });

  buildDots();
  goTo(0);
}

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  initScrollAnimations();
  initFAQ();
  initCounters();
  initCarousel();
  initLightbox();

  // wire theme toggle button
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.addEventListener('click', toggleTheme);
});
