/**
 * NOIR & BEAN — Premium Coffee Shop
 * script.js — Main JavaScript
 *
 * Features:
 * - Loading Screen
 * - Sticky Navbar + Active Link
 * - Mobile Menu
 * - Typing Effect (Hero)
 * - Scroll Reveal Animations
 * - Gallery Lightbox
 * - Testimonial Carousel (Auto-slide)
 * - Animated Counters
 * - Countdown Timers
 * - Menu Tabs
 * - Add to Cart + Toast
 * - Reservation Form Validation
 * - Newsletter Form
 * - Ripple Button Effect
 * - Scroll To Top
 * - Lazy Loading Images
 */

'use strict';

/* ============================================================
   UTILITIES
   ============================================================ */

/** Safely query a single element; returns null if not found. */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/** Safely query all elements; returns NodeList (may be empty). */
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

/** Throttle a function to fire at most once per `limit` ms. */
function throttle(fn, limit) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= limit) { last = now; fn(...args); }
  };
}

/** Debounce: fire `fn` after `wait` ms of inactivity. */
function debounce(fn, wait) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

/** Format a number with locale commas (e.g. 48500 → "48,500"). */
function formatNum(n) { return Math.round(n).toLocaleString(); }

/* ============================================================
   1. LOADING SCREEN
   ============================================================ */
(function initLoader() {
  const loader = $('#loader');
  if (!loader) return;

  document.body.classList.add('loading');

  const hide = () => {
    loader.classList.add('hidden');
    document.body.classList.remove('loading');
  };

  // Minimum 1.4 s display; then hide once DOM is fully ready
  const min = new Promise(r => setTimeout(r, 1400));
  const dom = new Promise(r => {
    if (document.readyState === 'complete') r();
    else window.addEventListener('load', r, { once: true });
  });

  Promise.all([min, dom]).then(hide);
})();

/* ============================================================
   2. STICKY NAVBAR + ACTIVE LINK HIGHLIGHT
   ============================================================ */
(function initNavbar() {
  const nav  = $('#navbar');
  const links = $$('.nav__link');
  if (!nav) return;

  // Sections that correspond to nav links
  const sections = Array.from($$('main section[id]'));

  const onScroll = throttle(() => {
    const scrollY = window.scrollY;

    // Toggle "scrolled" glass style
    nav.classList.toggle('scrolled', scrollY > 40);

    // Scroll-to-top button
    const topBtn = $('#scroll-top');
    if (topBtn) topBtn.classList.toggle('visible', scrollY > 400);

    // Active section detection
    let current = '';
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop - 120) current = sec.id;
    });

    links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  }, 100);

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on init
})();

/* ============================================================
   3. MOBILE MENU
   ============================================================ */
(function initMobileMenu() {
  const hamburger = $('#hamburger');
  const navLinks  = $('#nav-links');
  if (!hamburger || !navLinks) return;

  // Inject backdrop overlay (CSS controls visibility)
  const overlay = document.createElement('div');
  overlay.className = 'nav__overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  let open = false;

  const toggle = () => {
    open = !open;
    hamburger.classList.toggle('open', open);
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  };

  const close = () => {
    if (!open) return;
    open = false;
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };

  hamburger.addEventListener('click', toggle);

  // Close on any nav-link click (mobile)
  $$('.nav__link').forEach(a => a.addEventListener('click', close));

  // Close when tapping the backdrop overlay
  overlay.addEventListener('click', close);

  // Close on Escape — return focus to hamburger
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && open) { close(); hamburger.focus(); }
  });
})();

/* ============================================================
   4. SCROLL TO TOP BUTTON
   ============================================================ */
(function initScrollTop() {
  const btn = $('#scroll-top');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   5. TYPING EFFECT (HERO HEADING)
   ============================================================ */
(function initTyping() {
  const el = $('#typing-target');
  if (!el) return;

  const phrases = [
    'Where Darkness\nMeets Depth.',
    'The Art of\nBlack Coffee.',
    'Obsessively\nCrafted.',
  ];

  let phraseIdx   = 0;
  let charIdx     = 0;
  let isDeleting  = false;
  let pauseTimer  = null;

  const SPEED_TYPE   = 60;   // ms per char
  const SPEED_DELETE = 35;   // ms per char delete
  const PAUSE_END    = 2400; // pause at end of phrase
  const PAUSE_START  = 500;  // pause before typing

  function renderText(text) {
    // Safe DOM construction — no innerHTML with user/external data
    el.textContent = '';
    const parts = text.split('\n');
    parts.forEach((part, i) => {
      el.appendChild(document.createTextNode(part));
      if (i < parts.length - 1) el.appendChild(document.createElement('br'));
    });
  }

  function tick() {
    const phrase = phrases[phraseIdx];

    if (!isDeleting) {
      charIdx++;
      renderText(phrase.slice(0, charIdx));

      if (charIdx === phrase.length) {
        // Finished typing — pause then start deleting
        isDeleting = true;
        el.classList.remove('done');
        pauseTimer = setTimeout(tick, PAUSE_END);
        return;
      }
    } else {
      charIdx--;
      renderText(phrase.slice(0, charIdx));

      if (charIdx === 0) {
        // Finished deleting — move to next phrase
        isDeleting  = false;
        phraseIdx   = (phraseIdx + 1) % phrases.length;
        pauseTimer  = setTimeout(tick, PAUSE_START);
        return;
      }
    }

    const delay = isDeleting ? SPEED_DELETE : SPEED_TYPE;
    pauseTimer = setTimeout(tick, delay);
  }

  // Start after a short delay (loader is still visible)
  setTimeout(tick, 1600);

  // Pause / resume on visibility change to save battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(pauseTimer);
    else tick();
  });
})();

/* ============================================================
   6. SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
(function initScrollReveal() {
  const els = $$('.reveal-up, .reveal-left, .reveal-right');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target); // animate once
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  els.forEach(el => obs.observe(el));
})();

/* ============================================================
   7. RIPPLE BUTTON EFFECT
   ============================================================ */
(function initRipple() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.ripple');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x    = e.clientX - rect.left - size / 2;
    const y    = e.clientY - rect.top  - size / 2;

    const wave = document.createElement('span');
    wave.className = 'ripple-wave';
    Object.assign(wave.style, {
      width:  `${size}px`,
      height: `${size}px`,
      left:   `${x}px`,
      top:    `${y}px`,
    });

    btn.appendChild(wave);
    wave.addEventListener('animationend', () => wave.remove(), { once: true });
  });
})();

/* ============================================================
   8. MENU TABS
   ============================================================ */
(function initMenuTabs() {
  const tabs   = $$('.menu__tab');
  const panels = $$('.menu__panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Deactivate all
      tabs.forEach(t => { t.classList.remove('menu__tab--active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.add('menu__panel--hidden'));

      // Activate selected
      tab.classList.add('menu__tab--active');
      tab.setAttribute('aria-selected', 'true');

      const panel = $(`#tab-${target}`);
      if (panel) panel.classList.remove('menu__panel--hidden');
    });
  });
})();

/* ============================================================
   9. ADD TO CART (Toast Notification)
   ============================================================ */
(function initCart() {
  // toast is now rendered at body level (outside any section) for correct fixed positioning
  const toast   = $('#cart-toast');
  let hideTimer = null;

  if (!toast) return;

  document.addEventListener('click', e => {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;

    // Use textContent (never innerHTML) to prevent XSS from data attributes
    const item  = btn.dataset.item  || 'Item';
    const price = parseFloat(btn.dataset.price || 0).toFixed(2);

    toast.textContent = `✓  ${item} — $${price}`;
    toast.classList.add('show');

    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  });
})();

/* ============================================================
   10. GALLERY LIGHTBOX
   ============================================================ */
(function initLightbox() {
  const lightbox  = $('#lightbox');
  const img       = $('#lightbox-img');
  const closeBtn  = $('#lightbox-close');
  const prevBtn   = $('#lightbox-prev');
  const nextBtn   = $('#lightbox-next');
  if (!lightbox || !img) return;

  const items  = Array.from($$('.gallery__item'));
  let current  = 0;

  // Collect image data from gallery items
  const images = items.map(item => {
    const i = item.querySelector('img');
    return { src: i ? i.src : '', alt: i ? i.alt : '' };
  });

  function show(idx) {
    current = (idx + images.length) % images.length;
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = images[current].src;
      img.alt = images[current].alt;
      img.style.opacity = '1';
    }, 150);
  }

  function open(idx) {
    show(idx);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Return focus to the clicked item
    if (items[current]) items[current].focus();
  }

  // Attach click to each gallery item
  items.forEach((item, idx) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View image: ${images[idx].alt}`);

    item.addEventListener('click', () => open(idx));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(idx); }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (prevBtn)  prevBtn.addEventListener('click', () => show(current - 1));
  if (nextBtn)  nextBtn.addEventListener('click', () => show(current + 1));

  // Close on backdrop click
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // Touch / swipe support
  let touchX = 0;
  lightbox.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(dx < 0 ? current + 1 : current - 1);
  });
})();

/* ============================================================
   11. TESTIMONIAL CAROUSEL (AUTO-SLIDE)
   ============================================================ */
(function initTestimonials() {
  const track    = $('#testimonial-track');
  const dotsWrap = $('#testimonial-dots');
  const prevBtn  = $('#prev-testimonial');
  const nextBtn  = $('#next-testimonial');
  if (!track) return;

  const slides   = Array.from($$('.testimonial__slide', track));
  const total    = slides.length;
  let current    = 0;
  let autoTimer  = null;

  // Build dots
  slides.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.className = `testimonial__dot${idx === 0 ? ' testimonial__dot--active' : ''}`;
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to testimonial ${idx + 1}`);
    dot.addEventListener('click', () => goTo(idx));
    dotsWrap && dotsWrap.appendChild(dot);
  });

  function updateDots() {
    $$('.testimonial__dot', dotsWrap).forEach((d, i) => {
      d.classList.toggle('testimonial__dot--active', i === current);
    });
  }

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });

  // Auto-slide every 5 s
  function startAuto() { autoTimer = setInterval(next, 5000); }
  function resetAuto()  { clearInterval(autoTimer); startAuto(); }

  startAuto();

  // Pause on hover / focus
  track.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.addEventListener('mouseleave', startAuto);

  // Touch swipe
  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; clearInterval(autoTimer); }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    startAuto();
  });
})();

/* ============================================================
   12. ANIMATED COUNTERS
   ============================================================ */
(function initCounters() {
  const counters = $$('.stats__num');
  if (!counters.length) return;

  const DURATION = 2200; // ms

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const start  = performance.now();

    // easeOutQuart easing
    const ease = t => 1 - Math.pow(1 - t, 4);

    function frame(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const value    = Math.round(ease(progress) * target);
      el.textContent = formatNum(value) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(el => obs.observe(el));
})();

/* ============================================================
   13. COUNTDOWN TIMERS (Three separate deadlines)
   ============================================================ */
(function initCountdowns() {
  // Define target deadlines (days from now)
  const now = new Date();

  function futureDate(daysFromNow, hours, minutes) {
    const d = new Date(now);
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  const deadlines = [
    futureDate(2,  9,  0),  // Timer 1 — 2 days out, 9am
    futureDate(5, 23, 59),  // Timer 2 — 5 days out, midnight
    futureDate(14, 8, 30),  // Timer 3 — 14 days out, 8:30am
  ];

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateTimer(deadline, ids) {
    const { d, h, m, s } = ids;
    const [elD, elH, elM, elS] = [$(d), $(h), $(m), $(s)];

    function tick() {
      const diff = deadline - Date.now();
      if (diff <= 0) {
        [elD, elH, elM, elS].forEach(el => { if (el) el.textContent = '00'; });
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const days    = Math.floor(totalSec / 86400);
      const hours   = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      if (elD) elD.textContent = pad(days);
      if (elH) elH.textContent = pad(hours);
      if (elM) elM.textContent = pad(minutes);
      if (elS) elS.textContent = pad(seconds);
    }

    tick();
    setInterval(tick, 1000);
  }

  updateTimer(deadlines[0], { d: '#timer-d1', h: '#timer-h1', m: '#timer-m1', s: '#timer-s1' });
  updateTimer(deadlines[1], { d: '#timer-d2', h: '#timer-h2', m: '#timer-m2', s: '#timer-s2' });
  updateTimer(deadlines[2], { d: '#timer-d3', h: '#timer-h3', m: '#timer-m3', s: '#timer-s3' });
})();

/* ============================================================
   14. RESERVATION FORM VALIDATION
   ============================================================ */
(function initReservationForm() {
  const form = $('#reservation-form');
  if (!form) return;

  const fields = {
    name:   { el: $('#res-name'),   err: $('#err-name'),   validate: v => v.trim().length >= 2   ? '' : 'Please enter your full name.' },
    phone:  { el: $('#res-phone'),  err: $('#err-phone'),  validate: v => /^[+\d\s\-().]{7,20}$/.test(v.trim()) ? '' : 'Enter a valid phone number.' },
    email:  { el: $('#res-email'),  err: $('#err-email'),  validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address.' },
    date:   { el: $('#res-date'),   err: $('#err-date'),   validate: v => { if (!v) return 'Please select a date.'; const d = new Date(v); return d >= new Date(new Date().setHours(0,0,0,0)) ? '' : 'Please choose a future date.'; } },
    time:   { el: $('#res-time'),   err: $('#err-time'),   validate: v => v ? '' : 'Please select a time.' },
    guests: { el: $('#res-guests'), err: $('#err-guests'), validate: v => v ? '' : 'Please select the number of guests.' },
  };

  // Set the minimum date to today
  const dateInput = $('#res-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  function validateField(key) {
    const f = fields[key];
    if (!f.el || !f.err) return true; // skip if element missing
    const msg = f.validate(f.el.value);
    f.err.textContent = msg;
    f.el.classList.toggle('error', !!msg);
    return !msg;
  }

  // Validate on blur (real-time feedback after first touch)
  Object.keys(fields).forEach(key => {
    const f = fields[key];
    if (!f.el) return;
    f.el.addEventListener('blur', () => validateField(key));
    f.el.addEventListener('input', debounce(() => validateField(key), 400));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const allValid = Object.keys(fields).map(validateField).every(Boolean);
    if (!allValid) return;

    // Simulate API call
    const submitBtn = form.querySelector('[type="submit"]');
    const success   = $('#form-success');

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Confirming…';

    setTimeout(() => {
      form.reset();
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Confirm Reservation';
      Object.keys(fields).forEach(k => {
        if (fields[k].el) fields[k].el.classList.remove('error');
        if (fields[k].err) fields[k].err.textContent = '';
      });

      if (success) {
        success.textContent = "\u2713 Your table has been reserved. We'll send a confirmation to your email shortly.";
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 6000);
      }
    }, 1200);
  });
})();

/* ============================================================
   15. NEWSLETTER FORM
   ============================================================ */
(function initNewsletter() {
  const form = $('#newsletter-form');
  const msg  = $('#newsletter-msg');
  if (!form || !msg) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const val   = input ? input.value.trim() : '';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg.style.color = '#e05c4a';
      msg.textContent = 'Please enter a valid email address.';
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    setTimeout(() => {
      form.reset();
      msg.style.color = 'var(--color-gold)';
      msg.textContent = "\u2713 You're on the list. Welcome to the inner circle.";
      if (btn) btn.disabled = false;
      setTimeout(() => { msg.textContent = ''; }, 5000);
    }, 800);
  });
})();

/* ============================================================
   16. FOOTER COPYRIGHT YEAR
   ============================================================ */
(function initYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ============================================================
   17. SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   18. LAZY LOADING IMAGES (native + polyfill)
   ============================================================ */
(function initLazyLoad() {
  // All images already have loading="lazy" in HTML.
  // For browsers without native support, use IntersectionObserver.
  if ('loading' in HTMLImageElement.prototype) return; // native support

  const images = $$('img[loading="lazy"]');
  if (!images.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) img.src = img.dataset.src;
        img.removeAttribute('loading');
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  images.forEach(img => obs.observe(img));
})();

/* ============================================================
   19. HERO PARALLAX (subtle, performance-safe)
   ============================================================ */
(function initHeroParallax() {
  const heroBg = $('.hero__bg');
  if (!heroBg) return;

  // Disable on mobile/touch (background-attachment:scroll is used there anyway)
  if (window.matchMedia('(max-width: 768px)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true; // set BEFORE rAF so subsequent scroll events are correctly throttled
    requestAnimationFrame(() => {
      heroBg.style.transform = `translateY(${window.scrollY * 0.35}px)`;
      ticking = false;
    });
  }, { passive: true });
})();

/* ============================================================
   20. OFFER CARDS — GLOW FOLLOW CURSOR
   ============================================================ */
(function initCardGlow() {
  const cards = $$('.offer-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--glow-x', `${x}%`);
      card.style.setProperty('--glow-y', `${y}%`);
      const glow = card.querySelector('.offer-card__glow');
      if (glow) {
        glow.style.left = `${e.clientX - rect.left - 100}px`;
        glow.style.top  = `${e.clientY - rect.top  - 100}px`;
      }
    });
  });
})();

/* ============================================================
   INIT LOG
   ============================================================ */
console.log('%cNoir & Bean ☕', 'color:#c9a84c;font-size:20px;font-weight:bold;');
console.log('%cAll systems go.', 'color:#9a8878;font-size:12px;');
