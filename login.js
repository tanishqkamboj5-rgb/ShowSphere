/* ============================================================
   ShowSphere — login.js
   Handles login, signup, logout, session state
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── CHECK IF ALREADY LOGGED IN ─────────────────────────── */
  const user = JSON.parse(localStorage.getItem('ssUser') || 'null');
  if (user) {
    showLoggedInState(user);
  }

});

/* ── TAB SWITCHER ────────────────────────────────────────── */
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'signup'));
  });
  document.getElementById('form-login').classList.toggle('active', tab === 'login');
  document.getElementById('form-signup').classList.toggle('active', tab === 'signup');
}

/* ── LOGIN ───────────────────────────────────────────────── */
function loginUser() {
  const email    = document.getElementById('login-email')?.value.trim();
  const password = document.getElementById('login-password')?.value;

  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email.', 'error'); return;
  }
  if (!password || password.length < 4) {
    showToast('Please enter your password.', 'error'); return;
  }

  // Check if user exists in localStorage
  const allUsers = JSON.parse(localStorage.getItem('ssAllUsers') || '[]');
  const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (found && found.password === btoa(password)) {
    const { password: _p, ...safeUser } = found;
    localStorage.setItem('ssUser', JSON.stringify(safeUser));
    showToast('Welcome back, ' + found.fname + '! 🎬', 'success');
    setTimeout(() => { showLoggedInState(safeUser); updateNavUser(safeUser); }, 800);
  } else if (found) {
    showToast('Incorrect password. Try again.', 'error');
  } else {
    // Demo mode: accept any login
    const demoUser = { fname: email.split('@')[0], lname: '', email, phone: '' };
    localStorage.setItem('ssUser', JSON.stringify(demoUser));
    showToast('Signed in as ' + demoUser.fname + ' 🎬', 'success');
    setTimeout(() => { showLoggedInState(demoUser); updateNavUser(demoUser); }, 800);
  }
}

/* ── SIGNUP ──────────────────────────────────────────────── */
function signupUser() {
  const fname    = document.getElementById('signup-fname')?.value.trim();
  const lname    = document.getElementById('signup-lname')?.value.trim();
  const email    = document.getElementById('signup-email')?.value.trim();
  const phone    = document.getElementById('signup-phone')?.value.trim();
  const password = document.getElementById('signup-password')?.value;

  if (!fname) { showToast('First name is required.', 'error'); return; }
  if (!email || !email.includes('@')) { showToast('Valid email is required.', 'error'); return; }
  if (!password || password.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }

  const allUsers = JSON.parse(localStorage.getItem('ssAllUsers') || '[]');
  if (allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    showToast('An account with this email already exists. Please sign in.', 'error');
    switchTab('login');
    return;
  }

  const newUser = { fname, lname, email, phone, password: btoa(password), joined: new Date().toISOString() };
  allUsers.push(newUser);
  localStorage.setItem('ssAllUsers', JSON.stringify(allUsers));

  const { password: _p, ...safeUser } = newUser;
  localStorage.setItem('ssUser', JSON.stringify(safeUser));

  showToast('Account created! Welcome to ShowSphere 🎬', 'success');
  setTimeout(() => { showLoggedInState(safeUser); updateNavUser(safeUser); }, 900);
}

/* ── LOGOUT ──────────────────────────────────────────────── */
function logoutUser() {
  localStorage.removeItem('ssUser');
  showToast('You have been signed out.', 'info');
  setTimeout(() => {
    document.getElementById('logged-in-view').style.display = 'none';
    document.getElementById('auth-forms-view').style.display = '';
    updateNavUser(null);
  }, 600);
}

/* ── GOOGLE SIGN IN (simulated) ─────────────────────────── */
function googleSignIn() {
  showToast('Google Sign-In: Enter your details below to continue.', 'info');
}

/* ── SHOW LOGGED-IN UI ───────────────────────────────────── */
function showLoggedInState(user) {
  const loggedInView   = document.getElementById('logged-in-view');
  const authFormsView  = document.getElementById('auth-forms-view');
  if (!loggedInView) return;
  loggedInView.style.display = 'block';
  if (authFormsView) authFormsView.style.display = 'none';

  const nameEl  = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const phoneEl = document.getElementById('profile-phone');
  if (nameEl)  nameEl.textContent  = `${user.fname} ${user.lname || ''}`.trim();
  if (emailEl) emailEl.textContent = user.email;
  if (phoneEl && user.phone) phoneEl.textContent = `📞 ${user.phone}`;
}

/* ── PASSWORD STRENGTH ───────────────────────────────────── */
function checkStrength(val) {
  const fill  = document.getElementById('strength-fill');
  const label = document.getElementById('strength-label');
  if (!fill || !label) return;
  let score = 0;
  if (val.length >= 6)  score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val))  score++;
  if (/[0-9]/.test(val))  score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { w: '0%',  color: '#e74c3c', text: 'Too short' },
    { w: '25%', color: '#e74c3c', text: 'Weak' },
    { w: '50%', color: '#e67e22', text: 'Fair' },
    { w: '75%', color: '#f1c40f', text: 'Good' },
    { w: '90%', color: '#27ae60', text: 'Strong' },
    { w: '100%',color: '#27ae60', text: 'Very Strong' },
  ];

  const lvl = levels[Math.min(score, 5)];
  fill.style.width    = lvl.w;
  fill.style.background = lvl.color;
  label.textContent   = lvl.text;
  label.style.color   = lvl.color;
}

/* ── TOAST ───────────────────────────────────────────────── */
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
  toast.style.background = type === 'error' ? '#c0392b' : type === 'success' ? '#27ae60' : '#2c3e50';
  toast.style.color = '#fff';
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3500);
}
