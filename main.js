/* ═══════════════════════════════════════
   1. HEADER SCROLL EFFECT
═══════════════════════════════════════ */
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ═══════════════════════════════════════
   2. HAMBURGER / MOBILE NAV
═══════════════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('[data-close-nav]').forEach(el => {
  el.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ═══════════════════════════════════════
   3. COUNTDOWN TIMER
   Концерт: 8 мая 2026, 15:00 МСК (UTC+3)
═══════════════════════════════════════ */
const CONCERT_DATE = new Date('2026-05-08T15:00:00+03:00');

const cdDays    = document.getElementById('cd-days');
const cdHours   = document.getElementById('cd-hours');
const cdMinutes = document.getElementById('cd-minutes');
const cdSeconds = document.getElementById('cd-seconds');

function pad(n) {
  return String(Math.floor(n)).padStart(2, '0');
}

function updateCountdown() {
  const diff = CONCERT_DATE - new Date();

  if (diff <= 0) {
    cdDays.textContent = cdHours.textContent =
    cdMinutes.textContent = cdSeconds.textContent = '00';
    clearInterval(countdownInterval);
    const cdTitle = document.querySelector('.countdown__title');
    if (cdTitle) cdTitle.textContent = 'Концерт уже идёт!';
    return;
  }

  cdDays.textContent    = pad(diff / (1000 * 60 * 60 * 24));
  cdHours.textContent   = pad((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  cdMinutes.textContent = pad((diff % (1000 * 60 * 60)) / (1000 * 60));
  cdSeconds.textContent = pad((diff % (1000 * 60)) / 1000);
}

updateCountdown();
const countdownInterval = setInterval(updateCountdown, 1000);

/* ═══════════════════════════════════════
   4. ПЛАВНАЯ ПРОКРУТКА ПО ЯКОРЯМ
═══════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = header.offsetHeight + 16;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

/* ═══════════════════════════════════════
   5. GALLERY — INFINITE SCROLL + LIGHTBOX
═══════════════════════════════════════ */

// ── Список всех фото ──────────────────
// Чтобы добавить новые фото: увеличьте TOTAL или добавьте пути вручную
const TOTAL = 58;
const PHOTOS = Array.from({ length: TOTAL }, (_, i) => ({
  src: `images/${i + 1}.jpeg`,
  alt: `Фото с прошлого концерта, кадр ${i + 1}`
}));

const BATCH_SIZE   = 12;   // сколько фото грузить за раз
let loadedCount    = 0;
let currentIndex   = 0;    // индекс открытого в lightbox фото

const galleryGrid     = document.getElementById('galleryGrid');
const gallerySentinel = document.getElementById('gallerySentinel');

// ── Рендер следующей порции ───────────
function renderBatch() {
  const end      = Math.min(loadedCount + BATCH_SIZE, PHOTOS.length);
  const fragment = document.createDocumentFragment();

  for (let i = loadedCount; i < end; i++) {
    const item = document.createElement('div');
    item.className = 'gallery__item' + (i === 0 ? ' gallery__item--wide' : '');
    item.dataset.index = i;

    const img = document.createElement('img');
    img.src     = PHOTOS[i].src;
    img.alt     = PHOTOS[i].alt;
    img.className = 'gallery__img';
    img.loading   = i < 4 ? 'eager' : 'lazy';
    img.decoding  = 'async';

    const caption = document.createElement('div');
    caption.className   = 'gallery__caption';
    caption.textContent = `Фото с концерта`;

    item.append(img, caption);
    item.addEventListener('click', () => openLightbox(i));

    fragment.appendChild(item);
  }

  galleryGrid.appendChild(fragment);
  loadedCount = end;

  if (loadedCount >= PHOTOS.length) {
    sentinelObserver.unobserve(gallerySentinel);
    gallerySentinel.style.display = 'none';
  }
}

// Первая порция
renderBatch();

// ── IntersectionObserver ──────────────
const sentinelObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && loadedCount < PHOTOS.length) {
    renderBatch();
  }
}, { rootMargin: '300px' });

sentinelObserver.observe(gallerySentinel);

/* ══ LIGHTBOX ═══════════════════════════ */
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');

function openLightbox(index) {
  currentIndex = index;
  setPhoto(index);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function setPhoto(index) {
  // Лёгкая анимация смены фото
  lightboxImg.classList.add('loading');
  lightboxImg.onload = () => lightboxImg.classList.remove('loading');

  lightboxImg.src = PHOTOS[index].src;
  lightboxImg.alt = PHOTOS[index].alt;
  lightboxCounter.textContent = `${index + 1} / ${PHOTOS.length}`;

  lightboxPrev.disabled = index === 0;
  lightboxNext.disabled = index === PHOTOS.length - 1;

  // Если фото ещё не загружено в DOM — подгружаем
  if (index >= loadedCount) {
    const end = Math.min(index + BATCH_SIZE, PHOTOS.length);
    for (let i = loadedCount; i < end; i++) {
      const item = document.createElement('div');
      item.className = 'gallery__item';
      item.dataset.index = i;
      const img = document.createElement('img');
      img.src = PHOTOS[i].src; img.alt = PHOTOS[i].alt;
      img.className = 'gallery__img'; img.loading = 'lazy';
      const cap = document.createElement('div');
      cap.className = 'gallery__caption'; cap.textContent = 'Фото с концерта';
      item.append(img, cap);
      item.addEventListener('click', () => openLightbox(i));
      galleryGrid.appendChild(item);
    }
    loadedCount = end;
    if (loadedCount >= PHOTOS.length) {
      sentinelObserver.unobserve(gallerySentinel);
      gallerySentinel.style.display = 'none';
    }
  }
}

function prevPhoto() {
  if (currentIndex > 0) setPhoto(--currentIndex);
}

function nextPhoto() {
  if (currentIndex < PHOTOS.length - 1) setPhoto(++currentIndex);
}

// Кнопки
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', prevPhoto);
lightboxNext.addEventListener('click', nextPhoto);

// Клик по фону — закрыть
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// Клавиатура
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   prevPhoto();
  if (e.key === 'ArrowRight')  nextPhoto();
});

// Свайп (мобильные)
let swipeStartX = 0;
let swipeStartY = 0;

lightbox.addEventListener('touchstart', e => {
  swipeStartX = e.touches[0].clientX;
  swipeStartY = e.touches[0].clientY;
}, { passive: true });

lightbox.addEventListener('touchend', e => {
  const dx = swipeStartX - e.changedTouches[0].clientX;
  const dy = swipeStartY - e.changedTouches[0].clientY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
    if (dx > 0) nextPhoto(); else prevPhoto();
  }
}, { passive: true });
