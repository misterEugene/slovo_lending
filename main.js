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
   5. GALLERY — CAROUSEL + INFINITE SCROLL + LIGHTBOX
═══════════════════════════════════════ */

/* ══ CAROUSEL ════════════════════════════
   Слайдшоу с cross-fade, автоиграй, свайп
═════════════════════════════════════════ */
(function initCarousel() {
  const AUTO_MS   = 5000;   // интервал авто-смены, мс

  const carouselEl   = document.getElementById('galleryCarousel');
  const imgCurrent   = document.getElementById('carouselImg');
  const imgNext      = document.getElementById('carouselImgNext');
  const btnPrev      = document.getElementById('carouselPrev');
  const btnNext      = document.getElementById('carouselNext');
  const counterEl    = document.getElementById('carouselCounter');
  const progressBar  = document.getElementById('carouselProgress');
  const playArea     = document.getElementById('carouselPlayArea');

  // Создаём линию авто-прогресса
  const playLine = document.createElement('div');
  playLine.className = 'carousel__play-line';
  playLine.style.setProperty('--auto-duration', AUTO_MS + 'ms');
  playArea.appendChild(playLine);

  // Список фото берётся из общего PHOTOS (объявлен ниже)
  // Используем глобальную переменную, поэтому PHOTOS объявляем с var/let в глобальной области
  // Для доступа к PHOTOS, используем setTimeout(init, 0) после их объявления

  let carouselIndex = 0;
  let autoTimer     = null;
  let transitioning = false;

  function total() { return window._PHOTOS ? window._PHOTOS.length : 0; }

  function updateUI(index) {
    progressBar.style.width = `${((index + 1) / total()) * 100}%`;
    counterEl.textContent   = `${index + 1} / ${total()}`;
    carouselEl.setAttribute('aria-label', `Фото ${index + 1} из ${total()}`);
  }

  function showSlide(newIndex, dir) {
    if (transitioning || !window._PHOTOS) return;
    transitioning = true;

    const photos = window._PHOTOS;
    newIndex = ((newIndex % photos.length) + photos.length) % photos.length;

    // Готовим следующий кадр под текущим
    imgNext.src = photos[newIndex].src;
    imgNext.alt = photos[newIndex].alt;
    imgNext.style.opacity = '0';
    imgNext.style.zIndex  = '0';
    imgCurrent.style.zIndex = '1';

    // Небольшая задержка — дать браузеру поставить src
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        imgNext.style.transition  = 'opacity 0.45s ease';
        imgNext.style.opacity     = '1';
        imgCurrent.style.transition = 'opacity 0.45s ease';
        imgCurrent.style.opacity  = '0';

        setTimeout(() => {
          // Свапаем: next становится current
          imgCurrent.src     = photos[newIndex].src;
          imgCurrent.alt     = photos[newIndex].alt;
          imgCurrent.style.opacity    = '1';
          imgCurrent.style.transition = 'none';
          imgNext.style.opacity       = '0';
          imgNext.style.transition    = 'none';

          carouselIndex = newIndex;
          updateUI(carouselIndex);
          transitioning = false;
        }, 460);
      });
    });
  }

  function prev() { resetAuto(); showSlide(carouselIndex - 1, -1); }
  function next() { resetAuto(); showSlide(carouselIndex + 1,  1); }

  function startAuto() {
    clearInterval(autoTimer);
    // Анимация прогресса
    playLine.style.animation = 'none';
    playLine.offsetHeight; // reflow
    playLine.style.setProperty('--auto-duration', AUTO_MS + 'ms');
    playLine.classList.add('running');
    playLine.style.animation = '';

    autoTimer = setTimeout(() => {
      showSlide(carouselIndex + 1, 1);
      startAuto();
    }, AUTO_MS);
  }

  function resetAuto() {
    clearTimeout(autoTimer);
    playLine.style.animation = 'none';
    startAuto();
  }

  // Инициализация после того, как PHOTOS будет доступен
  function init() {
    if (!window._PHOTOS || !window._PHOTOS.length) {
      setTimeout(init, 50);
      return;
    }
    const photos = window._PHOTOS;
    imgCurrent.src = photos[0].src;
    imgCurrent.alt = photos[0].alt;
    updateUI(0);
    startAuto();
  }
  setTimeout(init, 0);

  // Кнопки
  btnPrev.addEventListener('click', e => { e.stopPropagation(); prev(); });
  btnNext.addEventListener('click', e => { e.stopPropagation(); next(); });

  // Клик по карусели → lightbox
  carouselEl.addEventListener('click', e => {
    if (e.target === btnPrev || e.target === btnNext) return;
    if (e.target.closest('.carousel__nav')) return;
    if (window._openLightbox) window._openLightbox(carouselIndex);
  });

  // Пауза при наведении
  carouselEl.addEventListener('mouseenter', () => clearTimeout(autoTimer));
  carouselEl.addEventListener('mouseleave', () => startAuto());

  // Свайп
  let touchX = 0, touchY = 0;
  carouselEl.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });
  carouselEl.addEventListener('touchend', e => {
    const dx = touchX - e.changedTouches[0].clientX;
    const dy = touchY - e.changedTouches[0].clientY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx > 0) next(); else prev();
    }
  }, { passive: true });

  // Клавиши (только когда не открыт lightbox)
  document.addEventListener('keydown', e => {
    if (document.getElementById('lightbox').classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });
})();

// ── Список всех фото ──────────────────
// Чтобы добавить новые фото: увеличьте TOTAL или добавьте пути вручную
const TOTAL = 58;
// Делаем PHOTOS глобальным — карусель читает его через window._PHOTOS
const PHOTOS = Array.from({ length: TOTAL }, (_, i) => ({
  src: `images/${i + 1}.jpeg`,
  alt: `Фото с прошлого концерта, кадр ${i + 1}`
}));
window._PHOTOS = PHOTOS;

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
// Экспорт для карусели
window._openLightbox = openLightbox;

function closeLightbox() {
  if (window._resetLightboxZoom) window._resetLightboxZoom();
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function setPhoto(index) {
  if (window._resetLightboxZoom) window._resetLightboxZoom();
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
  if (document.getElementById('lightboxImgWrap').classList.contains('lb-zoomed')) return;
  const dx = swipeStartX - e.changedTouches[0].clientX;
  const dy = swipeStartY - e.changedTouches[0].clientY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
    if (dx > 0) nextPhoto(); else prevPhoto();
  }
}, { passive: true });

/* ══ LIGHTBOX ZOOM ═══════════════════════
   Колёсико / двойной клик — зум на десктопе
   Pinch-to-zoom + перетаскивание — мобильные
═════════════════════════════════════════ */
(function initLightboxZoom() {
  const wrap = document.getElementById('lightboxImgWrap');
  const img  = document.getElementById('lightboxImg');

  let scale = 1, tx = 0, ty = 0;
  const MIN_SCALE = 1, MAX_SCALE = 5;

  function apply(animate) {
    img.style.transition = animate
      ? 'transform 0.25s ease, opacity 0.15s ease'
      : 'opacity 0.15s ease';
    img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    wrap.classList.toggle('lb-zoomed', scale > 1);
  }

  function reset() {
    scale = 1; tx = 0; ty = 0;
    apply(false);
  }
  window._resetLightboxZoom = reset;

  // Двойной клик — переключение зума
  wrap.addEventListener('dblclick', e => {
    if (scale > 1) { reset(); return; }
    // Зум к точке клика
    const rect = img.getBoundingClientRect();
    const cx = e.clientX - (rect.left + rect.width / 2);
    const cy = e.clientY - (rect.top  + rect.height / 2);
    scale = 2.5;
    tx = -cx * (scale - 1);
    ty = -cy * (scale - 1);
    apply(true);
  });

  // Колёсико — плавный зум к курсору
  wrap.addEventListener('wheel', e => {
    e.preventDefault();
    const factor   = e.deltaY < 0 ? 1.15 : 0.87;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));

    if (newScale !== scale) {
      const rect = img.getBoundingClientRect();
      const cx = e.clientX - (rect.left + rect.width / 2);
      const cy = e.clientY - (rect.top  + rect.height / 2);
      tx += cx * (1 - newScale / scale);
      ty += cy * (1 - newScale / scale);
      scale = newScale;
    }

    if (scale <= 1) { scale = 1; tx = 0; ty = 0; }
    apply(false);
  }, { passive: false });

  // Перетаскивание мышью
  let dragging = false, ox = 0, oy = 0;

  wrap.addEventListener('mousedown', e => {
    if (scale <= 1 || e.button !== 0) return;
    e.preventDefault();
    dragging = true;
    ox = e.clientX - tx;
    oy = e.clientY - ty;
    wrap.classList.add('lb-dragging');
  });

  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    tx = e.clientX - ox;
    ty = e.clientY - oy;
    apply(false);
  });

  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    wrap.classList.remove('lb-dragging');
  });

  // Pinch-to-zoom + одиночный тач-пан
  let pinch0 = null, pinch1 = null, scaleAt = 1, txAt = 0, tyAt = 0;
  let panTouchId = null, panOx = 0, panOy = 0;

  wrap.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      pinch0 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      pinch1 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
      scaleAt = scale; txAt = tx; tyAt = ty;
      panTouchId = null;
    } else if (e.touches.length === 1 && scale > 1) {
      panTouchId = e.touches[0].identifier;
      panOx = e.touches[0].clientX - tx;
      panOy = e.touches[0].clientY - ty;
    }
  }, { passive: false });

  wrap.addEventListener('touchmove', e => {
    if (e.touches.length === 2 && pinch0 && pinch1) {
      e.preventDefault();
      const a = e.touches[0], b = e.touches[1];
      const d0 = Math.hypot(pinch1.x - pinch0.x, pinch1.y - pinch0.y);
      const d1 = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scaleAt * (d1 / d0)));

      // Пан по смещению мидпойнта
      const mx0 = (pinch0.x + pinch1.x) / 2;
      const my0 = (pinch0.y + pinch1.y) / 2;
      const mx1 = (a.clientX + b.clientX) / 2;
      const my1 = (a.clientY + b.clientY) / 2;

      scale = newScale;
      tx = txAt + (mx1 - mx0);
      ty = tyAt + (my1 - my0);
      if (scale <= 1) { scale = 1; tx = 0; ty = 0; }
      apply(false);
    } else if (e.touches.length === 1 && scale > 1 && panTouchId !== null) {
      const t = [...e.touches].find(t => t.identifier === panTouchId);
      if (!t) return;
      e.preventDefault();
      tx = t.clientX - panOx;
      ty = t.clientY - panOy;
      apply(false);
    }
  }, { passive: false });

  wrap.addEventListener('touchend', e => {
    if (e.touches.length < 2) { pinch0 = null; pinch1 = null; }
    if (e.touches.length === 0) { panTouchId = null; }
  });
})();
