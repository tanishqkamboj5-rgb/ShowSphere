/* ============================================================
   ShowSphere — booking.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── MOVIE DATA ──────────────────────────────────────────── */
  const MOVIES = {
    echoes:   { title: 'Hoppers',                  times: ['10:30 AM','1:45 PM','5:00 PM','8:15 PM'],  soldOut: ['5:00 PM'],  formats: ['Standard','IMAX'] },
    letter:   { title: 'Dhurandhar : The Revenge', times: ['11:00 AM','2:30 PM','6:00 PM','9:30 PM'],  soldOut: ['11:00 AM'], formats: ['Standard','Dolby'] },
    crown:    { title: 'The Kerala Story 2',        times: ['9:00 AM','12:15 PM','3:30 PM','7:00 PM'],  soldOut: ['7:00 PM'],  formats: ['Standard','4K'] },
    hollow:   { title: 'Project Hail Mary',         times: ['11:30 AM','3:00 PM','6:45 PM','10:00 PM'], soldOut: ['3:00 PM'],  formats: ['Standard','Surround'] },
    seasons:  { title: 'Ek Din',                    times: ['10:00 AM','1:00 PM','4:30 PM','7:45 PM'],  soldOut: [],           formats: ['Standard','4K'] },
    midnight: { title: 'Toxic',                     times: ['12:00 PM','3:15 PM','6:30 PM','9:45 PM'],  soldOut: ['6:30 PM'],  formats: ['Standard','IMAX'] },
  };

  const PRICES = { standard: 299, premium: 499 };
  const ADDON_PRICES = { popcorn: 199, nachos: 149, drink: 99, vip: 799 };
  const PROMO_CODES = { 'FIRST50': 50, 'SPHERE20': 20, 'WELCOME': 100 };

  /* ── READ URL PARAMS ────────────────────────────────────── */
  const params = new URLSearchParams(window.location.search);
  const preMovie = params.get('movie');
  const preTime  = params.get('time');

  /* ── DOM REFS ───────────────────────────────────────────── */
  const movieSelect  = document.getElementById('movie-select');
  const dateSelect   = document.getElementById('date-select');
  const timeGroup    = document.querySelector('.time-radio-group');
  const formatGroup  = document.querySelectorAll('[name="format"]');
  const seats        = document.querySelectorAll('input[name="seat"]');
  const seatLabels   = document.querySelectorAll('.seat:not(.taken)');
  const addonChecks  = document.querySelectorAll('input[name="addon"]');
  const promoInput   = document.getElementById('promo');
  const bookingForm  = document.querySelector('.booking-form');

  // Summary DOM
  const sumFilm      = document.querySelector('.summary-row:nth-child(2) span:last-child');
  const sumDateTime  = document.querySelector('.summary-row:nth-child(3) span:last-child');
  const sumFormat    = document.querySelector('.summary-row:nth-child(4) span:last-child');
  const sumSeats     = document.querySelector('.summary-row:nth-child(5) span:last-child');
  const sumTotal     = document.querySelector('.summary-row.total span:last-child');

  let selectedSeats = [];
  let appliedDiscount = 0;

  /* ── PRE-SELECT MOVIE FROM URL ──────────────────────────── */
  if (preMovie && movieSelect) {
    movieSelect.value = preMovie;
    updateShowtimes();
  }
  if (preTime) {
    // try to match time radio
    const radios = document.querySelectorAll('[name="showtime"]');
    radios.forEach(r => {
      const label = r.closest('label')?.querySelector('span')?.textContent.trim() || '';
      if (label === preTime) r.checked = true;
    });
  }

  /* ── SHOWTIME UPDATE ON MOVIE CHANGE ────────────────────── */
  if (movieSelect) {
    movieSelect.addEventListener('change', updateShowtimes);
  }

  function updateShowtimes() {
    const key = movieSelect.value;
    const movie = MOVIES[key];
    if (!movie || !timeGroup) return;

    // Rebuild time radios
    const radios = timeGroup.querySelectorAll('label.time-radio');
    radios.forEach((lbl, i) => {
      const time = movie.times[i] || '';
      const isSoldOut = movie.soldOut.includes(time);
      const input = lbl.querySelector('input');
      const span  = lbl.querySelector('span');
      if (input && span) {
        span.textContent = time;
        input.value = time.replace(/[^0-9]/g,'');
        if (isSoldOut) {
          lbl.classList.add('sold-out-time');
          lbl.style.opacity = '0.45';
          lbl.style.textDecoration = 'line-through';
          input.disabled = true;
          input.checked  = false;
        } else {
          lbl.classList.remove('sold-out-time');
          lbl.style.opacity = '';
          lbl.style.textDecoration = '';
          input.disabled = false;
        }
      }
    });

    // Select first available
    const firstAvail = timeGroup.querySelector('input:not([disabled])');
    if (firstAvail) firstAvail.checked = true;

    updateSummary();
  }

  /* ── SEAT SELECTION ─────────────────────────────────────── */
  seats.forEach(seat => {
    seat.addEventListener('change', () => {
      selectedSeats = [...document.querySelectorAll('input[name="seat"]:checked')].map(s => s.value);
      // Visual: add/remove selected class
      seats.forEach(s => {
        const lbl = s.closest('.seat');
        if (lbl) lbl.classList.toggle('selected', s.checked);
      });
      updateSummary();
    });
  });

  /* ── ADD-ON CHANGES ─────────────────────────────────────── */
  addonChecks.forEach(cb => cb.addEventListener('change', updateSummary));

  /* ── FORMAT CHANGE ──────────────────────────────────────── */
  formatGroup.forEach(r => r.addEventListener('change', updateSummary));

  /* ── DATE / TIME CHANGE ─────────────────────────────────── */
  if (dateSelect) dateSelect.addEventListener('change', updateSummary);
  document.querySelectorAll('[name="showtime"]').forEach(r => r.addEventListener('change', updateSummary));

  /* ── PROMO CODE ─────────────────────────────────────────── */
  const promoBtn = document.createElement('button');
  promoBtn.type = 'button';
  promoBtn.textContent = 'Apply';
  promoBtn.className = 'btn-promo';
  promoBtn.style.cssText = 'margin-left:8px;padding:6px 16px;cursor:pointer;background:var(--accent,#b8953f);color:#fff;border:none;font-family:inherit;font-size:0.85rem;letter-spacing:1px;';
  if (promoInput) {
    promoInput.parentElement.style.display = 'flex';
    promoInput.parentElement.style.alignItems = 'center';
    promoInput.after(promoBtn);

    const promoMsg = document.createElement('span');
    promoMsg.style.cssText = 'margin-left:10px;font-size:0.8rem;';
    promoBtn.after(promoMsg);

    promoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (PROMO_CODES[code]) {
        appliedDiscount = PROMO_CODES[code];
        promoMsg.textContent = `✓ ₹${appliedDiscount} discount applied!`;
        promoMsg.style.color = '#4caf50';
        updateSummary();
      } else {
        appliedDiscount = 0;
        promoMsg.textContent = '✗ Invalid promo code';
        promoMsg.style.color = '#e74c3c';
        updateSummary();
      }
    });

    promoInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); promoBtn.click(); }
    });
  }

  /* ── SUMMARY UPDATE ─────────────────────────────────────── */
  function updateSummary() {
    if (!sumFilm) return;

    // Film
    const movieKey = movieSelect?.value || '';
    const movieData = MOVIES[movieKey];
    const filmName  = movieData?.title || (movieSelect?.options[movieSelect.selectedIndex]?.text || '—');
    sumFilm.textContent = filmName;

    // Date & Time
    const dateText = dateSelect?.options[dateSelect.selectedIndex]?.text || '—';
    const timeEl   = document.querySelector('[name="showtime"]:checked');
    const timeText = timeEl?.closest('label')?.querySelector('span')?.textContent || '—';
    if (sumDateTime) sumDateTime.textContent = `${dateText} · ${timeText}`;

    // Format
    const fmtEl = document.querySelector('[name="format"]:checked');
    const fmtText = fmtEl?.value ? fmtEl.value.charAt(0).toUpperCase() + fmtEl.value.slice(1) : '—';
    if (sumFormat) sumFormat.textContent = fmtText;

    // Seats
    if (sumSeats) sumSeats.textContent = selectedSeats.length ? selectedSeats.join(', ') : 'Select from map above';

    // Total
    let total = 0;
    selectedSeats.forEach(s => {
      const isPremium = s.startsWith('D') || s.startsWith('E');
      total += isPremium ? PRICES.premium : PRICES.standard;
    });
    addonChecks.forEach(cb => {
      if (cb.checked) total += ADDON_PRICES[cb.value] || 0;
    });
    total -= appliedDiscount;
    if (total < 0) total = 0;
    if (sumTotal) sumTotal.textContent = selectedSeats.length ? `₹${total}` : '₹ —';

    // Store booking data for confirmation page
    if (selectedSeats.length > 0 && movieKey) {
      const addons = [...addonChecks].filter(c => c.checked).map(c => c.value);
      const booking = {
        id: '#CNR-' + Math.random().toString(36).substr(2,8).toUpperCase(),
        movie: filmName,
        date: dateText,
        time: timeText,
        format: fmtText,
        seats: selectedSeats,
        total,
        addons,
        movieKey
      };
      sessionStorage.setItem('pendingBooking', JSON.stringify(booking));
    }
  }

  // Run once on load
  updateSummary();

  /* ── FORM VALIDATION & SUBMIT ───────────────────────────── */
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fname = document.getElementById('fname')?.value.trim();
      const lname = document.getElementById('lname')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const phone = document.getElementById('phone')?.value.trim();
      const movie = movieSelect?.value;
      const date  = dateSelect?.value;

      let errors = [];
      if (!movie)   errors.push('Please select a film.');
      if (!date)    errors.push('Please select a date.');
      if (selectedSeats.length === 0) errors.push('Please select at least one seat.');
      if (!fname)   errors.push('First name is required.');
      if (!lname)   errors.push('Last name is required.');
      if (!email || !email.includes('@')) errors.push('A valid email is required.');
      if (!phone)   errors.push('Phone number is required.');

      if (errors.length > 0) {
        showToast(errors[0], 'error');
        return;
      }

      // Save full booking to sessionStorage
      const addons = [...addonChecks].filter(c => c.checked).map(c => c.value);
      const timeEl  = document.querySelector('[name="showtime"]:checked');
      const timeText = timeEl?.closest('label')?.querySelector('span')?.textContent || '';
      const dateText = dateSelect?.options[dateSelect.selectedIndex]?.text || '';
      const fmtEl = document.querySelector('[name="format"]:checked');
      const fmtText = fmtEl?.value ? fmtEl.value.charAt(0).toUpperCase() + fmtEl.value.slice(1) : '';

      let total = 0;
      selectedSeats.forEach(s => {
        total += (s.startsWith('D') || s.startsWith('E')) ? PRICES.premium : PRICES.standard;
      });
      addonChecks.forEach(cb => { if (cb.checked) total += ADDON_PRICES[cb.value] || 0; });
      total -= appliedDiscount;
      if (total < 0) total = 0;

      const ticketType = document.querySelector('[name="tickettype"]:checked')?.value || 'adult';

      const booking = {
        id: 'CNR-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000),
        movie: MOVIES[movie]?.title || movie,
        movieKey: movie,
        date: dateText,
        time: timeText,
        format: fmtText,
        seats: selectedSeats,
        total,
        addons,
        guestName: `${fname} ${lname}`,
        email,
        phone,
        ticketType,
        timestamp: new Date().toISOString()
      };

      // Save to session and localStorage history
      sessionStorage.setItem('currentBooking', JSON.stringify(booking));
      const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
      history.unshift(booking);
      localStorage.setItem('bookingHistory', JSON.stringify(history.slice(0, 20)));

      showToast('Booking confirmed! Redirecting…', 'success');
      setTimeout(() => window.location.href = 'confirmation.html', 1200);
    });
  }

  /* ── TOAST NOTIFICATIONS ────────────────────────────────── */
  function showToast(msg, type = 'info') {
    let toast = document.getElementById('ss-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ss-toast';
      toast.style.cssText = `
        position:fixed;bottom:30px;right:30px;z-index:9999;
        padding:14px 24px;border-radius:4px;font-family:inherit;font-size:0.9rem;
        letter-spacing:0.5px;box-shadow:0 4px 20px rgba(0,0,0,0.4);
        transition:opacity 0.4s;pointer-events:none;max-width:320px;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = type === 'error' ? '#c0392b' : type === 'success' ? '#27ae60' : '#333';
    toast.style.color = '#fff';
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
  }

  /* ── NAV DATE ───────────────────────────────────────────── */
  const navDate = document.querySelector('.nav-date');
  if (navDate) {
    navDate.textContent = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

});
