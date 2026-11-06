// Portfolio interactions
// ----------------------
// This file keeps the page lightweight: there are no frameworks or build
// tools. Each function below handles one small piece of page behavior.

const progressBar = document.querySelector('#progress-bar');
const menuButton = document.querySelector('.menu-button');
const navigationPanel = document.querySelector('.nav-panel');
const themeButton = document.querySelector('.theme-toggle');
const helper = document.querySelector('.portfolio-helper');
const helperTrigger = document.querySelector('.helper-trigger');
const helperPanel = document.querySelector('.helper-panel');
const helperClose = document.querySelector('.helper-close');
const heroVideo = document.querySelector('#hero-video');
const contactForm = document.querySelector('#contact-form');

// Show the visitor's position on the page in the thin bar at the top.
function updateScrollProgress() {
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = pageHeight > 0 ? (window.scrollY / pageHeight) * 100 : 0;

  progressBar.style.width = `${progress}%`;
}

// Apply a theme and remember it for the next visit.
function applyTheme(theme) {
  const isDarkTheme = theme === 'dark';

  document.body.classList.toggle('dark-theme', isDarkTheme);
  themeButton.querySelector('span').textContent = isDarkTheme ? '\u263e' : '\u2726';
  themeButton.setAttribute(
    'aria-label',
    isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'
  );

  localStorage.setItem('portfolio-theme', theme);
}

const savedTheme = localStorage.getItem('portfolio-theme');

if (savedTheme) {
  applyTheme(savedTheme);
}

// Use HLS.js where native HLS playback is unavailable, keeping the hero video
// compatible with Chromium-based browsers as well as Safari.
if (heroVideo) {
  const heroVideoSource = heroVideo.dataset.hlsSrc;

  if (window.Hls && window.Hls.isSupported()) {
    const hls = new window.Hls();
    hls.loadSource(heroVideoSource);
    hls.attachMedia(heroVideo);
  } else if (heroVideo.canPlayType('application/vnd.apple.mpegurl')) {
    heroVideo.src = heroVideoSource;
  }
}

themeButton.addEventListener('click', () => {
  const nextTheme = document.body.classList.contains('dark-theme')
    ? 'light'
    : 'dark';

  applyTheme(nextTheme);
});

// Open and close the mobile navigation.
menuButton.addEventListener('click', () => {
  const isOpen = navigationPanel.classList.toggle('open');

  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.querySelector('.sr-only').textContent = isOpen
    ? 'Close menu'
    : 'Open menu';
});

function closeMenu() {
  navigationPanel.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('.sr-only').textContent = 'Open menu';
}

// Open and close the small on-page helper without interrupting navigation.
function setHelperState(isOpen) {
  helper.classList.toggle('is-open', isOpen);
  helperTrigger.setAttribute('aria-expanded', String(isOpen));
  helperPanel.setAttribute('aria-hidden', String(!isOpen));
}

helperTrigger.addEventListener('click', () => {
  setHelperState(!helper.classList.contains('is-open'));
});

helperClose.addEventListener('click', () => setHelperState(false));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && helper.classList.contains('is-open')) {
    setHelperState(false);
    helperTrigger.focus();
  }
  if (event.key === 'Escape' && navigationPanel.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});

document.addEventListener('click', (event) => {
  if (helper.classList.contains('is-open') && !helper.contains(event.target)) {
    setHelperState(false);
  }
});

document.querySelectorAll('.helper-actions a').forEach((link) => {
  link.addEventListener('click', () => setHelperState(false));
});

// Close the mobile navigation after choosing a section.
document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    closeMenu();
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 680) closeMenu();
});

// Validate the short contact form before handing the message to the visitor's
// preferred email app. Clear feedback keeps the form useful without a backend.
if (contactForm) {
  const nameInput = contactForm.querySelector('#contact-name');
  const messageInput = contactForm.querySelector('#contact-message');
  const nameError = contactForm.querySelector('#contact-name-error');
  const messageError = contactForm.querySelector('#contact-message-error');
  const formStatus = contactForm.querySelector('#contact-form-status');

  function showFormError(input, errorElement, message) {
    input.setAttribute('aria-invalid', String(Boolean(message)));
    errorElement.textContent = message;
    errorElement.hidden = !message;
  }

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const nameMessage = name.length < 2 ? 'Please enter your name.' : '';
    const messageMessage = message.length < 10 ? 'Please write a message of at least 10 characters.' : '';

    showFormError(nameInput, nameError, nameMessage);
    showFormError(messageInput, messageError, messageMessage);
    formStatus.textContent = '';

    if (nameMessage || messageMessage) return;

    formStatus.textContent = 'Opening your email app with your message.';
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`Hi Qandeel,\n\n${message}\n\nFrom,\n${name}`);
    window.location.href = `mailto:qandeelqudsia@gmail.com?subject=${subject}&body=${body}`;
  });
}

// Fade sections into view as they enter the viewport.
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((element) => {
  revealObserver.observe(element);
});

window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();
