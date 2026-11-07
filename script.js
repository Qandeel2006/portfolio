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
  if (isOpen) positionHelperPanel();
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

// Icon navigation: each icon bounces in a small circle when clicked.
document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    link.classList.remove('is-bouncing');
    void link.offsetWidth; // restart the animation if clicked twice
    link.classList.add('is-bouncing');
    setTimeout(() => link.classList.remove('is-bouncing'), 800);

    // Let the bounce play before the mobile menu folds away.
    setTimeout(closeMenu, window.innerWidth <= 680 ? 450 : 0);
  });
});

// Highlight the icon of the section currently on screen.
const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
const navSpy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${entry.target.id}`;

        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    });
  },
  { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
);

navLinks.forEach((link) => {
  const section = document.querySelector(link.getAttribute('href'));
  if (section) navSpy.observe(section);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 680) closeMenu();
});

// Contact form
// ------------
// Messages are sent straight to Qandeel's inbox through FormSubmit (a free
// form-to-email service), so visitors do not need an email app. If sending
// fails, the form falls back to opening the visitor's email app.
const CONTACT_EMAIL = 'qandeelqudsia@gmail.com';
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

if (contactForm) {
  const nameInput = contactForm.querySelector('#contact-name');
  const emailInput = contactForm.querySelector('#contact-email');
  const messageInput = contactForm.querySelector('#contact-message');
  const honeypot = contactForm.querySelector('#contact-company');
  const nameError = contactForm.querySelector('#contact-name-error');
  const emailError = contactForm.querySelector('#contact-email-error');
  const messageError = contactForm.querySelector('#contact-message-error');
  const formStatus = contactForm.querySelector('#contact-form-status');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showFormError(input, errorElement, message) {
    input.setAttribute('aria-invalid', String(Boolean(message)));
    errorElement.textContent = message;
    errorElement.hidden = !message;
  }

  function setFormStatus(message, type) {
    formStatus.textContent = message;
    formStatus.classList.toggle('is-success', type === 'success');
    formStatus.classList.toggle('is-error', type === 'error');
  }

  function openEmailApp(name, message) {
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`Hi Qandeel,\n\n${message}\n\nFrom,\n${name}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Bots fill hidden fields; pretend it worked and stop.
    if (honeypot && honeypot.value) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    const nameMessage = name.length < 2 ? 'Please enter your name.' : '';
    const emailMessage = emailPattern.test(email) ? '' : 'Please enter a valid email address.';
    const messageMessage = message.length < 10 ? 'Please write a message of at least 10 characters.' : '';

    showFormError(nameInput, nameError, nameMessage);
    showFormError(emailInput, emailError, emailMessage);
    showFormError(messageInput, messageError, messageMessage);
    setFormStatus('', '');

    if (nameMessage || emailMessage || messageMessage) return;

    submitButton.disabled = true;
    setFormStatus('Sending your message...', '');

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: `Portfolio message from ${name}`,
          _template: 'table',
          _captcha: 'false'
        })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false || result.success === 'false') {
        throw new Error(result.message || 'Message could not be sent.');
      }

      contactForm.reset();
      setFormStatus('Thank you! Your message was sent. I will reply soon.', 'success');
      petSay('Message sent! \u{1F389}', 4500);
    } catch (error) {
      setFormStatus('Could not send it right now. Opening your email app instead.', 'error');
      openEmailApp(name, message);
    } finally {
      submitButton.disabled = false;
    }
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

// Screen pet
// ----------
// Qandi walks along the bottom of the page, naps when nobody is around,
// comments on sections as you scroll, and hops and opens a panel when clicked.
const petBubble = helper.querySelector('.pet-bubble');
const petReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const petSpeed = 48; // pixels per second
const petMargin = 12;
const petSaid = new Set();
const petState = {
  x: 0,
  target: 0,
  facing: 1,
  dir: -1,
  mode: 'idle',
  idleUntil: 0,
  lastActive: Date.now(),
  hovering: false,
  bubbleTimer: null,
  lastFrame: 0
};

function petViewWidth() {
  return document.documentElement.clientWidth;
}

function petMaxX() {
  return Math.max(petMargin, petViewWidth() - helper.offsetWidth - petMargin);
}

// Keep a bubble or panel fully on screen while the pet moves.
function petFit(element) {
  const width = element.offsetWidth;
  const center = petState.x + helper.offsetWidth / 2;
  const left = Math.min(Math.max(center - width / 2, 8), petViewWidth() - width - 8);

  element.style.right = 'auto';
  element.style.left = `${left - petState.x}px`;
}

function positionHelperPanel() {
  petBubble.classList.remove('show');
  petFit(helperPanel);
}

function setPetMode(mode) {
  petState.mode = mode;
  helper.classList.toggle('is-walking', mode === 'walk');
  helper.classList.toggle('is-sleeping', mode === 'sleep');
}

function petSay(text, duration = 3800) {
  if (helper.classList.contains('is-open')) return;

  petBubble.textContent = text;
  petBubble.classList.add('show');
  petFit(petBubble);

  clearTimeout(petState.bubbleTimer);
  petState.bubbleTimer = setTimeout(() => petBubble.classList.remove('show'), duration);
}

function wakePet() {
  petState.lastActive = Date.now();

  if (petState.mode === 'sleep') {
    setPetMode('idle');
    petState.idleUntil = Date.now() + 1500;
    petSay('Oh, hi! \u{1F44B}', 2500);
  }
}

function choosePetAction(now) {
  if (now - petState.lastActive > 30000) {
    setPetMode('sleep');
    return;
  }

  // Walk all the way to the other end of the screen. The pet only turns
  // around once it gets there, never when it starts moving.
  petState.target = petState.dir > 0 ? petMaxX() : petMargin;
  setPetMode('walk');
}

function renderPet() {
  helper.style.transform = `translateX(${petState.x.toFixed(1)}px)`;
  helper.classList.toggle('is-facing-left', petState.facing < 0);

  if (petBubble.classList.contains('show')) petFit(petBubble);
  if (helper.classList.contains('is-open')) petFit(helperPanel);
}

function petFrame(timestamp) {
  const dt = Math.min((timestamp - petState.lastFrame) / 1000, 0.05);
  const now = Date.now();
  petState.lastFrame = timestamp;

  const busy = helper.classList.contains('is-open') || petState.hovering;

  if (busy) {
    // Stand still while someone is clicking or hovering over the pet.
    if (petState.mode === 'walk') {
      setPetMode('idle');
      petState.idleUntil = now + 1500;
    }
  } else if (petState.mode === 'walk') {
    const distance = petState.target - petState.x;
    const step = petSpeed * dt;

    if (Math.abs(distance) <= step) {
      petState.x = petState.target;
      setPetMode('idle');
      petState.idleUntil = now + 1500 + Math.random() * 3000;
      // Reached the other end: now turn around.
      petState.dir *= -1;
      petState.facing = -petState.dir;
    } else {
      petState.x += Math.sign(distance) * step;
    }
  } else if (petState.mode === 'idle' && now >= petState.idleUntil) {
    choosePetAction(now);
  }

  petState.x = Math.min(Math.max(petState.x, petMargin), petMaxX());
  renderPet();
  requestAnimationFrame(petFrame);
}

// Start in the bottom-right corner, then wander.
petState.x = petMaxX();
petState.target = petState.x;
renderPet();

if (!petReducedMotion) {
  petState.idleUntil = Date.now() + 3000;
  requestAnimationFrame(petFrame);
  setTimeout(() => petSay("Hi, I'm Qandi! Click me \u{1F43E}", 4500), 1800);
}

// Clicking the pet: a little hop, and it wakes up.
helperTrigger.addEventListener('click', () => {
  helper.classList.add('is-hopping');
  setTimeout(() => helper.classList.remove('is-hopping'), 600);

  petState.lastActive = Date.now();
  if (petState.mode === 'sleep') setPetMode('idle');
  if (helper.classList.contains('is-open')) petBubble.classList.remove('show');
});

helperTrigger.addEventListener('pointerenter', () => {
  petState.hovering = true;
  wakePet();
});
helperTrigger.addEventListener('pointerleave', () => {
  petState.hovering = false;
});
helperTrigger.addEventListener('focus', () => {
  petState.hovering = true;
});
helperTrigger.addEventListener('blur', () => {
  petState.hovering = false;
});

// Any activity on the page keeps the pet awake.
['pointerdown', 'keydown', 'scroll'].forEach((type) => {
  window.addEventListener(type, wakePet, { passive: true });
});

window.addEventListener('resize', () => {
  const max = petMaxX();

  petState.x = Math.min(petState.x, max);
  petState.target = Math.min(petState.target, max);
  renderPet();
});

// The pet comments on each section the first time you reach it.
const petSectionLines = {
  about: 'That is Qandeel! Nice to meet you.',
  experience: 'Teaching, leading, coordinating... busy person!',
  education: 'Studying data science, graduating in 2028.',
  skills: 'Python, SQL, Power BI... lots to explore.',
  projects: 'These dashboards are my favourites!',
  learning: 'Always learning something new.',
  certificates: 'So many certificates!',
  contact: 'Say hi! Your message goes straight to my inbox.'
};

const petSectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id;

      if (!entry.isIntersecting || petSaid.has(id) || !petSectionLines[id]) return;
      petSaid.add(id);

      if (petState.mode !== 'sleep') petSay(petSectionLines[id]);
    });
  },
  { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
);

Object.keys(petSectionLines).forEach((id) => {
  const section = document.getElementById(id);
  if (section) petSectionObserver.observe(section);
});

// 404 safety net
// --------------
// If an internal link or file cannot be opened, show the custom 404 page
// instead of the browser's default error.
document.addEventListener('click', async (event) => {
  const link = event.target.closest && event.target.closest('a[href]');

  if (!link || event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const url = new URL(link.href, window.location.href);

  // Only http(s) links on this site can be checked; email and outside links are left alone.
  if (!/^https?:$/.test(url.protocol) || url.origin !== window.location.origin) return;

  // Links to a section on this page: make sure the section exists.
  if (url.pathname === window.location.pathname && url.hash) {
    const id = decodeURIComponent(url.hash.slice(1));

    if (id && !document.getElementById(id)) {
      event.preventDefault();
      window.location.href = '404.html';
    }
    return;
  }

  // Links to other pages or files (certificates, resume): check they exist first.
  event.preventDefault();
  const opensInNewTab = link.target === '_blank';
  const newTab = opensInNewTab ? window.open('', '_blank') : null;
  let destination = url.href;

  try {
    const response = await fetch(url.href, { method: 'HEAD' });
    if (response.status === 404 || response.status === 410) destination = '404.html';
  } catch (error) {
    // Network problem: let the browser try the original link.
  }

  if (newTab) newTab.location.href = destination;
  else window.location.href = destination;
});

// Project pictures: if the first guess (.png) is not found, try other common file types.
document.querySelectorAll('img[data-exts]').forEach((image) => {
  const types = image.dataset.exts.split(',');

  image.addEventListener('error', () => {
    const next = types.shift();
    if (next) image.src = image.src.replace(/\.[a-z]+$/i, `.${next}`);
  });
});
