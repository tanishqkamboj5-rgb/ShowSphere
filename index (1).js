document.addEventListener('DOMContentLoaded', () => {

  const navDate = document.querySelector('.nav-date');
  if (navDate) {
    const now = new Date();
    navDate.textContent = now.toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  document.querySelectorAll('.time-tag:not(.sold-out)').forEach(tag => {
    tag.style.cursor = 'pointer';
    tag.addEventListener('click', (e) => {
      e.preventDefault();
      const card = tag.closest('.movie-card');
      const movieTitle = card.querySelector('.movie-title')?.textContent.trim() || '';
      const bookBtn = card.querySelector('.btn-book');
      if (!bookBtn) return;
      const href = bookBtn.getAttribute('href') || 'booking.html';
      const time = tag.textContent.trim();
      // Navigate to booking with movie + time pre-filled
      window.location.href = `${href}&time=${encodeURIComponent(time)}`;
    });
  });

  document.querySelectorAll('.btn-book').forEach(btn => {
    btn.addEventListener('click', (e) => {});
  });

  document.querySelectorAll('.time-tag.sold-out').forEach(tag => {
    tag.title = 'This show is sold out';
    tag.style.cursor = 'not-allowed';
  });

  const searchInput = document.getElementById('movie-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      document.querySelectorAll('.movie-card').forEach(card => {
        const title = card.querySelector('.movie-title')?.textContent.toLowerCase() || '';
        const genre = card.querySelector('.movie-genre')?.textContent.toLowerCase() || '';
        card.style.display = (title.includes(q) || genre.includes(q)) ? '' : 'none';
      });
    });
  }
  const ticker = document.querySelector('.hero-ticker span');
  if (ticker) {
    ticker.addEventListener('mouseenter', () => {
      ticker.style.animationDuration = '10s';
    });
    ticker.addEventListener('mouseleave', () => {
      ticker.style.animationDuration = '';
    });
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

});
