

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAV DATE ───────────────────────────────────────────── */
  const navDate = document.querySelector('.nav-date');
  if (navDate) {
    navDate.textContent = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  /* ── POSTER MAP ─────────────────────────────────────────── */
  const POSTER_MAP = {
    echoes:   'posters/hoppers2.jpg',
    letter:   'posters/dhurandar2.jpg',
    crown:    'posters/thekeralastory.avif',
    hollow:   'posters/hailmary2.webp',
    seasons:  'posters/ekdin.avif',
    midnight: 'posters/toxic.jpg',
  };

  const ADDON_LABELS = {
    popcorn: '🍿 Popcorn Combo',
    nachos:  '🧀 Nachos & Dip',
    drink:   '🥤 Large Drink',
    vip:     '⭐ Director\'s Lounge',
  };

  /* ── LOAD BOOKING ───────────────────────────────────────── */
  const booking = JSON.parse(sessionStorage.getItem('currentBooking') || 'null');

  if (booking) {
    populateTicket(booking);
  }
  // Always render history
  renderHistory();

  /* ── POPULATE TICKET CARD ───────────────────────────────── */
  function populateTicket(b) {
    // Poster
    const poster = document.querySelector('.ticket-movie-art');
    if (poster && POSTER_MAP[b.movieKey]) {
      poster.style.backgroundImage = `url(${POSTER_MAP[b.movieKey]})`;
      poster.style.textAlign="center";
      
    }

    // Booking ID
    const numEl = document.querySelector('.ticket-number');
    if (numEl) numEl.textContent = `#${b.id}`;

    // Title
    const titleEl = document.querySelector('.ticket-title');
    if (titleEl) titleEl.textContent = b.movie;

    // Genre / format
    const genreEl = document.querySelector('.ticket-genre');
    if (genreEl) genreEl.textContent = `${b.format}`;

    // Details grid
    const details = document.querySelectorAll('.ticket-detail');
    const map = {
      'DATE':       b.date,
      'TIME':       b.time,
      'SCREEN':     'Hall 3 — ShowSphere Cinemas',
      'SEATS':      b.seats.join(', '),
      'TYPE':       b.ticketType ? b.ticketType.charAt(0).toUpperCase() + b.ticketType.slice(1) + ` × ${b.seats.length}` : `Adult × ${b.seats.length}`,
      'TOTAL PAID': `₹${b.total}`,
    };

    details.forEach(det => {
      const label = det.querySelector('.detail-label')?.textContent?.trim();
      const value = det.querySelector('.detail-value');
      if (label && value && map[label] !== undefined) {
        value.textContent = map[label];
        if (label === 'TOTAL PAID') value.classList.add('gold');
      }
    });

    // Guest
    const guestEl = document.querySelector('.ticket-guest span:last-child');
    if (guestEl) guestEl.textContent = `${b.guestName}  ·  ${b.email}`;

    // Add-ons
    const addonEl = document.querySelector('.ticket-addons span:last-child');
    if (addonEl) {
      if (b.addons && b.addons.length > 0) {
        addonEl.textContent = b.addons.map(a => ADDON_LABELS[a] || a).join('  ·  ');
      } else {
        addonEl.textContent = 'None';
      }
    }

    // Update confirmation hero subtitle
    const heroP = document.querySelector('.confirm-hero p');
    if (heroP && b.email) {
      heroP.textContent = `A confirmation has been sent to ${b.email}. Enjoy the show!`;
    }

    // QR code: use a free API for a real QR
    const qrInner = document.querySelector('.qr-inner');
    if (qrInner) {
      const qrData = encodeURIComponent(`ShowSphere|${b.id}|${b.movie}|${b.seats.join(',')}`);
      const qrImg = document.createElement('img');
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;
      qrImg.width = 100;
      qrImg.alt = 'Booking QR';
      qrImg.style.display = 'block';
      qrInner.innerHTML = '';
      qrInner.appendChild(qrImg);
    }
  }

  /* ── RENDER BOOKING HISTORY ─────────────────────────────── */
  function renderHistory() {
    const tbody = document.querySelector('.bookings-table tbody');
    if (!tbody) return;

    const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
    if (history.length === 0) return; // keep static demo rows if no real data

    tbody.innerHTML = '';
    history.forEach(b => {
      const tr = document.createElement('tr');
      const status = 'confirmed';
      tr.innerHTML = `
        <td class="mono">#${b.id}</td>
        <td>${b.movie}</td>
        <td>${b.date}</td>
        <td>${b.seats ? b.seats.join(', ') : '—'}</td>
        <td>₹${b.total}</td>
        <td><span class="status ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* ── PRINT / DOWNLOAD TICKET ────────────────────────────── */
  // Add a print button near the ticket
  const ctaRow = document.querySelector('.cta-row');
  if (ctaRow) {
    const printBtn = document.createElement('button');
    printBtn.className = 'btn-outline';
    printBtn.textContent = '🖨 Print Ticket';
    printBtn.style.cursor = 'pointer';
    printBtn.addEventListener('click', () => window.print());
    ctaRow.appendChild(printBtn);
  }

  /* ── CONFETTI EFFECT (lightweight) ─────────────────────── */
  function launchConfetti() {
    const colors = ['#b8953f','#fff','#ffd700','#c0392b','#2980b9'];
    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        position:fixed;top:-10px;left:${Math.random()*100}vw;
        width:8px;height:8px;border-radius:50%;pointer-events:none;z-index:9999;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        animation:confettiFall ${1.5 + Math.random()*2}s ease forwards;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
  }

  
  if (!document.getElementById('confetti-style')) {
    const st = document.createElement('style');
    st.id = 'confetti-style';
    st.textContent = `
      @keyframes confettiFall {
        to { transform: translateY(110vh) rotate(720deg); opacity:0; }
      }
    `;
    document.head.appendChild(st);
  }

  // Only fire confetti if arriving from a real booking
  if (sessionStorage.getItem('currentBooking')) {
    launchConfetti();
  }

  /* ── FOOD ORDER BILL ────────────────────────────────────── */
  const FOOD_ITEM_NAMES = {
    f1:'Truffle Popcorn', f2:'Loaded Nachos', f3:'Soft Pretzel Bites',
    f4:'Crispy Wings', f5:'Black Angus Smash Burger', f6:'Margherita Flatbread',
    f7:'Caesar Salad Bowl', f8:'Molten Lava Cake', f9:'Artisan Ice Cream',
    f10:'Churros', f11:'Cold Brew Coffee', f12:'Signature Boba',
    f13:'Fresh Juice Flight', f14:'Cinema Lemonade',
    fc1:'Classic Duo', fc2:"Director's Meal", fc3:'Date Night Bundle'
  };

  const FOOD_ITEM_PRICES = {
    f1:299, f2:349, f3:199, f4:449, f5:649, f6:499, f7:399,
    f8:349, f9:249, f10:329, f11:199, f12:249, f13:299, f14:149,
    fc1:348, fc2:949, fc3:1148
  };

  const FOOD_ITEM_EMOJI = {
    f1:'🍿', f2:'🧀', f3:'🥨', f4:'🍗', f5:'🍔', f6:'🍕', f7:'🥗',
    f8:'🍫', f9:'🍦', f10:'🥐', f11:'☕', f12:'🧋', f13:'🍊', f14:'🥤',
    fc1:'🍿+🥤', fc2:'🍔+🍿+🧋', fc3:'🍕+🍫+🍊'
  };

  function renderFoodBill() {
    const foodOrder = JSON.parse(sessionStorage.getItem('foodOrder') || 'null');
    if (!foodOrder || !foodOrder.items || Object.keys(foodOrder.items).length === 0) return;

    const section = document.getElementById('food-bill-section');
    const itemsEl = document.getElementById('food-bill-items');
    const subtotalEl = document.getElementById('food-bill-subtotal');
    const serviceEl  = document.getElementById('food-bill-service');
    const totalEl    = document.getElementById('food-bill-total');

    if (!section || !itemsEl) return;
    section.style.display = 'block';

    let html = '';
    Object.entries(foodOrder.items).forEach(([id, qty]) => {
      const name  = FOOD_ITEM_NAMES[id] || id;
      const price = (FOOD_ITEM_PRICES[id] || 0) * qty;
      const emoji = FOOD_ITEM_EMOJI[id] || '🍽';
      html += `
        <div class="food-bill-item">
          <span class="food-bill-emoji">${emoji}</span>
          <span class="food-bill-name">${name}</span>
          <span class="food-bill-qty">×${qty}</span>
          <span class="food-bill-price">₹${price}</span>
        </div>`;
    });
    itemsEl.innerHTML = html;

    if (subtotalEl) subtotalEl.textContent = `₹${foodOrder.subtotal}`;
    if (serviceEl)  serviceEl.textContent  = `₹${foodOrder.service}`;
    if (totalEl)    totalEl.textContent    = `₹${foodOrder.total}`;
  }

  renderFoodBill();

});
