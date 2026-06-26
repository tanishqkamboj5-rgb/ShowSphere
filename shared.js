/* ============================================================
   ShowSphere — shared.js
   Runs on every page: nav date, city selector, user greeting
   ============================================================ */

(function() {

  /* ── NAV DATE ───────────────────────────────────────────── */
  const navDate = document.querySelector('.nav-date');
  if (navDate) {
    navDate.textContent = new Date().toLocaleDateString('en-IN', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  /* ── INDIAN CITIES ──────────────────────────────────────── */
  const CITIES = [
    // Metros
    'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune',
    // Tier 2
    'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
    'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar',
    'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi',
    'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
    'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad',
    'Bareilly', 'Moradabad', 'Mysuru', 'Gurgaon', 'Aligarh', 'Jalandhar', 'Tiruchirappalli',
    'Bhubaneswar', 'Salem', 'Mira-Bhayandar', 'Thiruvananthapuram', 'Bhiwandi',
    'Saharanpur', 'Gorakhpur', 'Guntur', 'Bikaner', 'Amravati', 'Noida', 'Jamshedpur',
    'Bhilai', 'Warangal', 'Cuttack', 'Firozabad', 'Kochi', 'Bhavnagar', 'Dehradun',
    'Durgapur', 'Asansol', 'Nanded', 'Kolhapur', 'Ajmer', 'Gulbarga', 'Jamnagar',
    'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu', 'Sangli-Miraj',
    'Mangaluru', 'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli', 'Malegaon',
    'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala', 'Tiruppur', 'Davanagere', 'Kozhikode',
    'Akola', 'Kurnool', 'Rajpur Sonarpur', 'Bokaro', 'South Dumdum', 'Bellary',
    'Patiala', 'Gopalpur', 'Agartala', 'Bhagalpur', 'Muzaffarnagar', 'Bhatpara',
    'Panihati', 'Latur', 'Dhule', 'Rohtak', 'Korba', 'Bhilwara', 'Brahmapur',
    'Muzaffarpur', 'Ahmednagar', 'Mathura', 'Kollam', 'Avadi', 'Kadapa',
    'Anantapur', 'Kamarhati', 'Bilaspur', 'Shahjahanpur', 'Bijapur', 'Rampur',
    'Shambhajinagar', 'Shimoga', 'Chandrapur', 'Junagadh', 'Thrissur', 'Alwar',
    'Bardhaman', 'Kulti', 'Nizamabad', 'Parbhani', 'Tumkur', 'Kharagpur',
    'Bathinda', 'Panipat', 'Raurkela', 'Dewas', 'Ichalkaranji', 'Tirupati',
    'Karnal', 'Nellore', 'Kakinada', 'Darbhanga', 'Puducherry', 'Imphal'
  ].sort();

  /* ── POPULATE CITY DROPDOWN ─────────────────────────────── */
  const citySelect = document.getElementById('city-select');
  if (citySelect) {
    const saved = localStorage.getItem('ssCity') || '';
    CITIES.forEach(city => {
      const opt = document.createElement('option');
      opt.value = city;
      opt.textContent = city;
      if (city === saved) opt.selected = true;
      citySelect.appendChild(opt);
    });
    if (saved) citySelect.options[0].textContent = `📍 ${saved}`;

    citySelect.addEventListener('change', () => {
      const chosen = citySelect.value;
      if (chosen) {
        localStorage.setItem('ssCity', chosen);
        citySelect.options[0].textContent = `📍 ${chosen}`;
        showSharedToast(`📍 Location set to ${chosen}`, 'info');
      }
    });
  }

  /* ── USER NAV GREETING ──────────────────────────────────── */
  updateNavUser(JSON.parse(localStorage.getItem('ssUser') || 'null'));

})();

/* ── EXPORTED: update nav user state ────────────────────── */
function updateNavUser(user) {
  const loginLink    = document.getElementById('nav-login-link');
  const greetingEl   = document.getElementById('nav-user-greeting');
  if (!loginLink && !greetingEl) return;

  if (user) {
    if (loginLink)  loginLink.style.display = 'none';
    if (greetingEl) {
      greetingEl.textContent = `👤 ${user.fname}`;
      greetingEl.style.display = 'inline-block';
      greetingEl.title = `Signed in as ${user.email}`;
      greetingEl.style.cssText = `
        display:inline-block;font-family:var(--font-mono);font-size:0.72rem;
        letter-spacing:0.1em;color:var(--gold);cursor:pointer;
        text-decoration:none;border-bottom:1px solid transparent;
        transition:border-color 0.2s;`;
      greetingEl.setAttribute('onclick', "window.location.href='login.html'");
    }
  } else {
    if (loginLink)  loginLink.style.display = 'inline-block';
    if (greetingEl) greetingEl.style.display = 'none';
  }
}

/* ── SHARED TOAST ────────────────────────────────────────── */
function showSharedToast(msg, type = 'info') {
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
  toast.style.background = type === 'error' ? '#c0392b' : type === 'success' ? '#27ae60' : '#2c3e50';
  toast.style.color = '#fff';
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}
