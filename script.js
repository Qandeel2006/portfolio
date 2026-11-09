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

  playLampScene(nextTheme);
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
  const href = link.getAttribute('href');
  const section = href.startsWith('#') ? document.querySelector(href) : null;
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
// Cloudflare Worker that checks the Turnstile token, then forwards the message.
const FORM_ENDPOINT = 'https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev';

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

    // Cloudflare Turnstile spam check
    const tokenField = contactForm.querySelector('[name="cf-turnstile-response"]');
    const token = tokenField ? tokenField.value : '';
    const captchaError = contactForm.querySelector('#contact-captcha-error');
    captchaError.textContent = token ? '' : 'Please complete the spam check.';
    captchaError.hidden = Boolean(token);
    if (!token) return;

    submitButton.disabled = true;
    setFormStatus('Sending your message...', '');

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, message, token })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false || result.success === 'false') {
        throw new Error(result.message || 'Message could not be sent.');
      }

      contactForm.reset();
      window.location.href = 'thank-you.html';
      return;
    } catch (error) {
      if (window.turnstile) window.turnstile.reset();
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
  experiments: 'Small projects, honest practice.',
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

// Toolkit: tap a tool to read how it has been used.
document.querySelectorAll('.skill-group').forEach((group) => {
  const note = group.querySelector('.skill-note');

  group.querySelectorAll('.skill-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      group.querySelectorAll('.skill-chip').forEach((other) => {
        other.setAttribute('aria-pressed', String(other === chip));
      });
      note.textContent = chip.dataset.note;
    });
  });
});

// Project story pages
// -------------------
// Clickable screenshots open a larger preview.
const lightbox = document.querySelector('#lightbox');
const zoomable = document.querySelector('.zoomable');

if (lightbox && zoomable) {
  const lightboxImage = lightbox.querySelector('img');

  function openLightbox() {
    const source = zoomable.querySelector('img');

    lightboxImage.src = source.currentSrc || source.src;
    lightboxImage.alt = source.alt;
    lightbox.showModal();
  }

  zoomable.addEventListener('click', openLightbox);
  document.querySelectorAll('[data-zoom]').forEach((button) => button.addEventListener('click', openLightbox));
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
}

// The caption and chapter pills follow the chapter being read.
const storyChapters = document.querySelectorAll('.chapter');
const storyCaption = document.querySelector('#story-caption');

if (storyChapters.length && storyCaption) {
  const storyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        storyCaption.textContent = entry.target.dataset.label;
        document.querySelectorAll('.story-dots a').forEach((dot) => {
          dot.classList.toggle('is-current', dot.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
  );

  storyChapters.forEach((chapter) => storyObserver.observe(chapter));
}

// Small questions: pick an option to read the answer.
document.querySelectorAll('.choice').forEach((box) => {
  const answer = box.querySelector('.choice-answer');

  box.querySelectorAll('.choice-option').forEach((option) => {
    option.addEventListener('click', () => {
      box.querySelectorAll('.choice-option').forEach((other) => {
        other.setAttribute('aria-pressed', String(other === option));
      });
      answer.textContent = option.dataset.answer;
      answer.classList.remove('is-shown');
      void answer.offsetWidth;
      answer.classList.add('is-shown');
    });
  });
});

// Theme switch animation
// ----------------------
// A little man walks in, pulls the lamp string, the theme changes, and he walks away.
let lampScene = null;
let lampBusy = false;
const lampRestArm = [[80, 210], [76, 228], [78, 244]];
const lampGrabArm = [[80, 210], [73, 192], [70, 174]];
const lampPullArm = [[80, 210], [68, 200], [70, 188]];

function lampTween(duration, update, done) {
  const start = performance.now();

  function step(now) {
    const t = Math.min((now - start) / duration, 1);

    update(t * t * (3 - 2 * t));
    if (t < 1) requestAnimationFrame(step);
    else if (done) done();
  }

  requestAnimationFrame(step);
}

function buildLampScene() {
  const scene = document.createElement('div');

  scene.className = 'lamp-scene';
  scene.setAttribute('aria-hidden', 'true');
  scene.innerHTML = `<svg viewBox="0 0 120 256" focusable="false">
    <path class="lamp-cone" d="M52 96 L88 96 L116 256 L24 256 Z"/>
    <line class="lamp-cord" x1="70" y1="0" x2="70" y2="52"/>
    <path class="lamp-shade" d="M44 90 Q70 40 96 90 Z"/>
    <circle class="lamp-bulb" cx="70" cy="94" r="6"/>
    <line class="lamp-string" x1="70" y1="98" x2="70" y2="173"/>
    <circle class="lamp-bead" cx="70" cy="176" r="3.5"/>
    <g class="lamp-man"><g class="lamp-bob">
      <line class="lamp-leg" x1="85" y1="236" x2="85" y2="251"/>
      <line class="lamp-leg" x1="95" y1="236" x2="95" y2="251"/>
      <ellipse class="lamp-shoe" cx="84" cy="254" rx="7" ry="3.2"/>
      <ellipse class="lamp-shoe" cx="96" cy="254" rx="7" ry="3.2"/>
      <rect class="lamp-body" x="79" y="202" width="22" height="34" rx="9"/>
      <path class="lamp-hair" d="M77 190 C75 176 83 169 90 169 C97 169 105 176 103 190 C106 200 104 212 108 221 C102 223 99 219 98 213 L82 213 C81 219 78 223 72 221 C76 212 74 200 77 190 Z"/>
      <circle class="lamp-head" cx="90" cy="190" r="10.5"/>
      <path class="lamp-hair" d="M79 189 C79 178 86 177 90 177 C95 177 101 179 101 189 C97 183 92 183 90 183 C86 183 82 185 79 189 Z"/>
      <circle class="lamp-clip" cx="98" cy="180" r="2.2"/>
      <circle class="lamp-eye" cx="85.5" cy="191" r="1.4"/>
      <path class="lamp-wink" d="M91 191 Q93 189.3 95 191"/>
      <circle class="lamp-blush" cx="83" cy="195" r="2"/>
      <circle class="lamp-blush" cx="97" cy="195" r="2"/>
      <path class="lamp-wink" d="M88 196 Q90 198 92 196"/>
      <polyline class="lamp-arm" points=""/>
    </g></g>
  </svg>`;
  document.body.appendChild(scene);

  return scene;
}

function playLampScene(nextTheme) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    applyTheme(nextTheme);
    return;
  }
  if (lampBusy) return;
  lampBusy = true;

  lampScene = lampScene || buildLampScene();
  const arm = lampScene.querySelector('.lamp-arm');
  const string = lampScene.querySelector('.lamp-string');
  const bead = lampScene.querySelector('.lamp-bead');
  const setArm = (pose) => arm.setAttribute('points', pose.map((point) => point.join(',')).join(' '));
  const mix = (from, to, t) => from.map((point, i) => [
    point[0] + (to[i][0] - point[0]) * t,
    point[1] + (to[i][1] - point[1]) * t
  ]);
  const setBead = (y) => {
    bead.setAttribute('cy', y);
    string.setAttribute('y2', y - 3);
  };

  setArm(lampRestArm);
  setBead(176);
  // The lamp is lit while the page is light.
  lampScene.classList.toggle('is-lit', !document.body.classList.contains('dark-theme'));
  void lampScene.offsetWidth;
  lampScene.classList.add('is-in', 'is-walking');

  setTimeout(() => {
    lampScene.classList.remove('is-walking');
    lampTween(250, (t) => setArm(mix(lampRestArm, lampGrabArm, t)), () => {
      lampTween(300, (t) => {
        setArm(mix(lampGrabArm, lampPullArm, t));
        setBead(176 + 14 * t);
      }, () => {
        applyTheme(nextTheme);
        lampScene.classList.toggle('is-lit', nextTheme === 'light');

        setTimeout(() => {
          lampTween(280, (t) => {
            setArm(mix(lampPullArm, lampGrabArm, t));
            setBead(190 - 14 * t);
          }, () => {
            lampTween(250, (t) => setArm(mix(lampGrabArm, lampRestArm, t)), () => {
              lampScene.classList.add('is-walking');
              lampScene.classList.remove('is-in');
              setTimeout(() => {
                lampScene.classList.remove('is-walking');
                lampBusy = false;
              }, 650);
            });
          });
        }, 250);
      });
    });
  }, 650);
}

// About cards: arrow buttons scroll the card row sideways.
document.querySelectorAll('.values-wrap').forEach((wrap) => {
  const row = wrap.querySelector('.values-grid');
  wrap.querySelectorAll('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      row.scrollBy({ left: Number(btn.dataset.scroll) * 280, behavior: 'smooth' });
    });
  });
});
