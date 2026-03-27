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
const mobileNav = document.getElementById('mobileNav');

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
    const countdown = document.getElementById('countdown');
    if (countdown) {
      countdown.querySelector('.countdown__title').textContent = 'Концерт уже идёт!';
    }
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
   с учётом высоты фиксированного хедера
═══════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = header.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
