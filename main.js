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
   Дата концерта: 9 мая 2026, 18:00 МСК (UTC+3)
═══════════════════════════════════════ */
const CONCERT_DATE = new Date('2026-05-09T18:00:00+03:00');

const cdDays    = document.getElementById('cd-days');
const cdHours   = document.getElementById('cd-hours');
const cdMinutes = document.getElementById('cd-minutes');
const cdSeconds = document.getElementById('cd-seconds');

function pad(n) {
  return String(n).padStart(2, '0');
}

function updateCountdown() {
  const now  = new Date();
  const diff = CONCERT_DATE - now;

  if (diff <= 0) {
    cdDays.textContent    = '00';
    cdHours.textContent   = '00';
    cdMinutes.textContent = '00';
    cdSeconds.textContent = '00';
    clearInterval(countdownInterval);
    return;
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  cdDays.textContent    = pad(days);
  cdHours.textContent   = pad(hours);
  cdMinutes.textContent = pad(minutes);
  cdSeconds.textContent = pad(seconds);
}

updateCountdown();
const countdownInterval = setInterval(updateCountdown, 1000);

/* ═══════════════════════════════════════
   4. MODAL — ПОКУПКА БИЛЕТА
═══════════════════════════════════════ */
const modalOverlay  = document.getElementById('modalOverlay');
const modalClose    = document.getElementById('modalClose');
const modalTicketName  = document.getElementById('modalTicketName');
const modalTicketPrice = document.getElementById('modalTicketPrice');
const modalTotal       = document.getElementById('modalTotal');
const fieldQty         = document.getElementById('fieldQty');
const orderForm        = document.getElementById('orderForm');

let currentPriceNum = 0;

function openModal(ticketName, ticketPrice) {
  modalTicketName.textContent  = ticketName;
  modalTicketPrice.textContent = ticketPrice;
  currentPriceNum = parseInt(ticketPrice.replace(/\s/g, ''), 10);
  updateTotal();
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  // focus на первое поле
  setTimeout(() => {
    document.getElementById('fieldName').focus();
  }, 100);
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  orderForm.reset();
  clearFormErrors();
}

function updateTotal() {
  const qty   = parseInt(fieldQty.value, 10) || 1;
  const total = (currentPriceNum * qty).toLocaleString('ru-RU');
  modalTotal.textContent = total;
}

// Открыть модальное окно при клике на кнопки билетов
document.querySelectorAll('[data-ticket]').forEach(btn => {
  btn.addEventListener('click', () => {
    const name  = btn.dataset.ticket;
    const price = btn.dataset.price;
    openModal(name, price);
  });
});

// Закрыть
modalClose.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// Пересчёт суммы при изменении кол-ва
fieldQty.addEventListener('change', updateTotal);

/* ═══════════════════════════════════════
   5. ВАЛИДАЦИЯ И ОТПРАВКА ФОРМЫ
═══════════════════════════════════════ */
function clearFormErrors() {
  orderForm.querySelectorAll('.form-input').forEach(i => i.classList.remove('error'));
}

function validateForm() {
  let valid = true;
  clearFormErrors();

  const name  = document.getElementById('fieldName');
  const email = document.getElementById('fieldEmail');

  if (!name.value.trim()) {
    name.classList.add('error');
    valid = false;
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim() || !emailRe.test(email.value.trim())) {
    email.classList.add('error');
    valid = false;
  }

  return valid;
}

orderForm.addEventListener('submit', e => {
  e.preventDefault();

  if (!validateForm()) {
    // тряска модального окна
    const modal = document.querySelector('.modal');
    modal.style.animation = 'none';
    modal.offsetHeight; // reflow
    modal.style.animation = 'shake 0.3s ease';
    return;
  }

  const name     = document.getElementById('fieldName').value.trim();
  const email    = document.getElementById('fieldEmail').value.trim();
  const qty      = fieldQty.value;
  const ticket   = modalTicketName.textContent;
  const total    = modalTotal.textContent;

  // Имитация отправки (в реальном проекте — fetch к API)
  closeModal();

  setTimeout(() => {
    alert(
      `✅ Заявка принята!\n\n` +
      `Билет: ${ticket}\n` +
      `Количество: ${qty} шт.\n` +
      `Сумма: ${total} ₽\n\n` +
      `Подтверждение отправлено на ${email}.\n` +
      `Ждём вас 9 мая 2026 в Парке Победы, ${name}!`
    );
  }, 200);
});

/* ═══════════════════════════════════════
   6. ПЛАВНАЯ ПРОКРУТКА ПО ЯКОРЯМ
   (дополнение к CSS scroll-behavior: smooth)
═══════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = header.offsetHeight + 8;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
