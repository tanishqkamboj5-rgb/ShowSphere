/* ============================================================
   ShowSphere — food.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAV DATE ───────────────────────────────────────────── */
  const navDate = document.querySelector('.nav-date');
  if (navDate) {
    navDate.textContent = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  /* ── MENU ITEM PRICE MAP ────────────────────────────────── */
  const ITEM_PRICES = {
    f1: 299,  // Truffle Popcorn
    f2: 349,  // Loaded Nachos
    f3: 199,  // Soft Pretzel Bites
    f4: 449,  // Crispy Wings
    f5: 649,  // Black Angus Smash Burger
    f6: 499,  // Margherita Flatbread
    f7: 399,  // Caesar Salad Bowl
    f8: 349,  // Molten Lava Cake
    f9: 249,  // Artisan Ice Cream
    f10: 179, // Churros
    f11: 399, // Gin & Tonic
    f12: 249, // Fresh Juice
    f13: 149, // Sparkling Water
    f14: 799, // Cinema Combo
    f15: 999, // The Ultimate Feast
  };

  const ITEM_NAMES = {
    f1:'Truffle Popcorn', f2:'Loaded Nachos', f3:'Soft Pretzel Bites',
    f4:'Crispy Wings', f5:'Black Angus Smash Burger', f6:'Margherita Flatbread',
    f7:'Caesar Salad Bowl', f8:'Molten Lava Cake', f9:'Artisan Ice Cream',
    f10:'Churros', f11:'Gin & Tonic', f12:'Fresh Juice',
    f13:'Sparkling Water', f14:'Cinema Combo', f15:'The Ultimate Feast'
  };

  /* ── CART STATE ─────────────────────────────────────────── */
  let cart = {}; // { f1: qty, f2: qty, ... }

  /* ── DOM REFS ───────────────────────────────────────────── */
  const foodChecks   = document.querySelectorAll('.food-check');
  const orderList    = document.querySelector('.order-list');
  const orderEmpty   = document.querySelector('.order-empty');
  const priceRows    = document.querySelectorAll('.price-row span:last-child');
  const placeOrderBtn = document.querySelector('a[href="confirmation.html"]');

  /* ── FOOD CARD CHECK/UNCHECK ────────────────────────────── */
  foodChecks.forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.value;
      if (cb.checked) {
        const qty = getQty(id);
        cart[id] = qty;
      } else {
        delete cart[id];
      }
      // Update add indicator text
      const card = cb.closest('.food-card');
      const addIndicator = card?.querySelector('.add-indicator');
      if (addIndicator) {
        addIndicator.textContent = cb.checked ? '✓ Added' : '+ Add';
        addIndicator.style.color = cb.checked ? '#4caf50' : '';
      }
      renderCart();
    });
  });

  /* ── QTY RADIO CHANGE ───────────────────────────────────── */
  document.querySelectorAll('.qty-selector input[type="radio"]').forEach(r => {
    r.addEventListener('change', () => {
      const match = r.name.match(/qty-(.+)/);
      if (!match) return;
      const id = match[1];
      if (cart[id] !== undefined) {
        cart[id] = parseInt(r.value) || 1;
        renderCart();
      }
    });
  });

  function getQty(id) {
    const checked = document.querySelector(`input[name="qty-${id}"]:checked`);
    return parseInt(checked?.value || '1');
  }

  /* ── RENDER CART SIDEBAR ────────────────────────────────── */
  function renderCart() {
    if (!orderList) return;
    const items = Object.keys(cart);

    if (items.length === 0) {
      orderList.innerHTML = `
        <div class="order-empty">
          <span class="order-empty-icon">🛒</span>
          <p>Select items from the menu to add them to your order.</p>
        </div>`;
      updatePriceBreakdown(0);
      return;
    }

    let subtotal = 0;
    let html = '';
    items.forEach(id => {
      const qty  = cart[id];
      const price = (ITEM_PRICES[id] || 0) * qty;
      subtotal += price;
      html += `
        <div class="order-item" style="display:flex;justify-content:space-between;align-items:center;
          padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:0.85rem;">
          <div>
            <span style="display:block;font-weight:500;">${ITEM_NAMES[id] || id}</span>
            <span style="opacity:0.55;font-size:0.78rem;">×${qty}</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <span>₹${price}</span>
            <button onclick="removeItem('${id}')" style="background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;font-size:1rem;padding:0;line-height:1;">✕</button>
          </div>
        </div>`;
    });

    orderList.innerHTML = html;
    updatePriceBreakdown(subtotal);
  }

  window.removeItem = function(id) {
    delete cart[id];
    // Uncheck corresponding food card
    const cb = document.getElementById(id);
    if (cb) {
      cb.checked = false;
      const addIndicator = cb.closest('.food-card')?.querySelector('.add-indicator');
      if (addIndicator) { addIndicator.textContent = '+ Add'; addIndicator.style.color = ''; }
    }
    renderCart();
  };

  function updatePriceBreakdown(subtotal) {
    const service = Math.round(subtotal * 0.05);
    const total = subtotal + service;
    const rows = document.querySelectorAll('.price-row');
    rows.forEach(row => {
      const label = row.querySelector('span:first-child')?.textContent?.trim();
      const valueEl = row.querySelector('span:last-child');
      if (!valueEl) return;
      if (label === 'Subtotal')             valueEl.textContent = subtotal > 0 ? `₹${subtotal}` : '—';
      if (label?.includes('Service'))       valueEl.textContent = subtotal > 0 ? `₹${service}` : '—';
      if (label === 'Total') {
        valueEl.textContent = subtotal > 0 ? `₹${total}` : '—';
        valueEl.classList.toggle('gold-text', subtotal > 0);
      }
    });

    // Save food order to session for confirmation
    if (subtotal > 0) {
      const foodOrder = { items: cart, subtotal, service, total };
      sessionStorage.setItem('foodOrder', JSON.stringify(foodOrder));
    }
  }

  /* ── MENU TABS (category filter) ───────────────────────── */
  const tabLinks = document.querySelectorAll('.tab-link');
  const categories = document.querySelectorAll('.menu-category');

  tabLinks.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const target = tab.getAttribute('href')?.replace('#','') || 'all';

      tabLinks.forEach(t => t.classList.remove('active-tab'));
      tab.classList.add('active-tab');

      categories.forEach(cat => {
        if (target === 'all' || cat.id === target) {
          cat.style.display = '';
          cat.style.animation = 'fadeInUp 0.3s ease both';
        } else {
          cat.style.display = 'none';
        }
      });
    });
  });

  /* ── DIETARY FILTERS ────────────────────────────────────── */
  const dietToggles = document.querySelectorAll('input[name="diet"]');
  dietToggles.forEach(tog => tog.addEventListener('change', applyDietFilter));

  function applyDietFilter() {
    const vegOnly   = document.querySelector('input[value="veg"]')?.checked;
    const gfOnly    = document.querySelector('input[value="gf"]')?.checked;
    const spicyOnly = document.querySelector('input[value="spicy"]')?.checked;

    document.querySelectorAll('.food-card').forEach(card => {
      const tags = [...card.querySelectorAll('.ftag')].map(t => t.textContent);
      const isVeg   = tags.some(t => t.includes('Veg'));
      const isGf    = tags.some(t => t.toLowerCase().includes('gluten'));
      const isSpicy = tags.some(t => t.toLowerCase().includes('spicy') || t.includes('🌶'));

      let show = true;
      if (vegOnly   && !isVeg)   show = false;
      if (gfOnly    && !isGf)    show = false;
      if (spicyOnly && !isSpicy) show = false;

      card.style.display = show ? '' : 'none';
    });
  }

  /* ── PLACE ORDER: save + redirect ──────────────────────── */
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', (e) => {
      const items = Object.keys(cart);
      if (items.length === 0) {
        e.preventDefault();
        showToast('Your order is empty. Add items before placing an order.', 'error');
        return;
      }
      showToast('Order placed! Redirecting…', 'success');
      // Allow navigation
    });
  }

  /* ── TOAST ──────────────────────────────────────────────── */
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

  /* ── SEAT INFO FROM BOOKING ─────────────────────────────── */
  const booking = JSON.parse(sessionStorage.getItem('currentBooking') || 'null');
  const seatLabel = document.querySelector('.sidebar-seat');
  if (seatLabel && booking?.seats?.length) {
    seatLabel.textContent = `Seat: ${booking.seats[0]} · Hall 3`;
  }

  /* ── ADD FADE-IN ANIMATION CSS ─────────────────────────── */
  if (!document.getElementById('food-anim-style')) {
    const st = document.createElement('style');
    st.id = 'food-anim-style';
    st.textContent = `@keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }`;
    document.head.appendChild(st);
  }

});
