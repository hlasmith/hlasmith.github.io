// Nav toggle for mobile
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navLinks.id = navLinks.id || 'nav-links';
  navToggle.setAttribute('aria-controls', navLinks.id);
  navToggle.setAttribute('aria-expanded', 'false');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Close nav when a link is clicked (mobile)
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Set active nav link based on current page
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  const hrefPage = href.split('/').pop();
  if (hrefPage === currentPage || (currentPage === '' && hrefPage === 'index.html')) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
});

// Scroll-triggered fade-in animations
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => {
  observer.observe(el);
});

// Theme toggle (dark/light mode)
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function syncThemeColorMeta(isDark) {
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', isDark ? '#14161B' : '#F5F2EB');
  }
}

if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
  syncThemeColorMeta(savedTheme === 'dark');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? null : 'dark';

    if (next) {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    }
    syncThemeColorMeta(!!next);
  });

  themeToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      themeToggle.click();
    }
  });
}
