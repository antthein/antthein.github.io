/* =========================
   ANALYTICS (local event log, optional GA4)
========================= */

const ANALYTICS_CONFIG = {
  gaMeasurementId: '', // Add your GA4 Measurement ID (e.g. G-XXXXXXX)
  storageKey: 'portfolio.analytics.events',
  enabled: true
};

function initAnalytics() {
  if (!ANALYTICS_CONFIG.gaMeasurementId) return;
  const tagScript = document.createElement('script');
  tagScript.async = true;
  tagScript.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.gaMeasurementId}`;
  document.head.appendChild(tagScript);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', ANALYTICS_CONFIG.gaMeasurementId);
}

function trackEvent(name, params = {}) {
  if (!ANALYTICS_CONFIG.enabled) return;
  const eventData = { name, params, path: window.location.pathname, timestamp: new Date().toISOString() };
  try {
    const existing = JSON.parse(localStorage.getItem(ANALYTICS_CONFIG.storageKey) || '[]');
    existing.push(eventData);
    localStorage.setItem(ANALYTICS_CONFIG.storageKey, JSON.stringify(existing.slice(-200)));
  } catch (err) {
    /* storage unavailable (private mode etc.) */
  }
  if (window.gtag && ANALYTICS_CONFIG.gaMeasurementId) {
    window.gtag('event', name, params);
  }
}
initAnalytics();

/* =========================
   THEME: System / Light / Dark
========================= */

const THEME_KEY = 'theme-pref';
const darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
const themeButtons = document.querySelectorAll('[data-theme-pref]');

function readThemePref() {
  try {
    return localStorage.getItem(THEME_KEY) || localStorage.getItem('theme') || 'system';
  } catch (e) {
    return 'system';
  }
}

function applyTheme(pref) {
  const isDark = pref === 'dark' || (pref === 'system' && darkQuery?.matches);
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  themeButtons.forEach((btn) => {
    btn.setAttribute('aria-pressed', btn.dataset.themePref === pref ? 'true' : 'false');
  });
  const meta = document.getElementById('themeColorMeta');
  if (meta) meta.content = isDark ? '#0A0A0A' : '#FAFAFA';
}

let themePref = readThemePref();
applyTheme(themePref);

themeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    themePref = btn.dataset.themePref;
    try {
      localStorage.setItem(THEME_KEY, themePref);
      localStorage.removeItem('theme');
    } catch (e) {}
    applyTheme(themePref);
    trackEvent('theme_change', { theme: themePref });
  });
});

darkQuery?.addEventListener('change', () => {
  if (themePref === 'system') applyTheme('system');
});

/* =========================
   HEXAGON BACKGROUND: cursor spotlight + parallax
   (mouse/trackpad only; off for touch and reduced motion)
========================= */

(function initHexInteraction() {
  const wrap = document.querySelector('.hex-wrap');
  const spot = document.querySelector('.hex-spot');
  if (!wrap || !spot || !window.matchMedia) return;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!finePointer.matches || reducedMotion.matches) return;

  const PARALLAX_X = 14; // max px shift
  const PARALLAX_Y = 10;
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let x = targetX;
  let y = targetY;
  let frame = null;

  function tick() {
    x += (targetX - x) * 0.14;
    y += (targetY - y) * 0.14;

    const rect = spot.getBoundingClientRect();
    spot.style.setProperty('--mx', `${(x - rect.left).toFixed(1)}px`);
    spot.style.setProperty('--my', `${(y - rect.top).toFixed(1)}px`);
    wrap.style.setProperty('--px', `${((0.5 - x / window.innerWidth) * PARALLAX_X).toFixed(2)}px`);
    wrap.style.setProperty('--py', `${((0.5 - y / window.innerHeight) * PARALLAX_Y).toFixed(2)}px`);

    frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.5 ? requestAnimationFrame(tick) : null;
  }

  /* Hexagon under the cursor: a small pool of cells inside the drifting SVG,
     so a lit cell moves with the pattern. Grid matches the #hexTile pattern
     (52 x 90 tile; centres at (26 + 52i, 90j) and (52i, 45 + 90j)). */
  const hoverField = document.querySelector('.hex-hover .hex-field');
  const cellGroup = document.getElementById('hexHoverCells');
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const cells = [];
  let cellIndex = 0;
  let litCell = null;
  let litKey = '';

  for (let i = 0; i < 10; i += 1) {
    const poly = document.createElementNS(SVG_NS, 'polygon');
    poly.setAttribute('points', '0,-26 22.5,-13 22.5,13 0,26 -22.5,13 -22.5,-13');
    cellGroup?.appendChild(poly);
    cells.push(poly);
  }

  function nearestHexCentre(lx, ly) {
    const ja = Math.round(ly / 90);
    const ia = Math.round((lx - 26) / 52);
    const a = { x: 26 + 52 * ia, y: 90 * ja };
    const jb = Math.round((ly - 45) / 90);
    const ib = Math.round(lx / 52);
    const b = { x: 52 * ib, y: 45 + 90 * jb };
    return Math.hypot(lx - a.x, ly - a.y) <= Math.hypot(lx - b.x, ly - b.y) ? a : b;
  }

  function lightCellAt(clientX, clientY) {
    if (!hoverField || !cells.length) return;
    const r = hoverField.getBoundingClientRect();
    const c = nearestHexCentre(clientX - r.left, clientY - r.top);
    const key = `${c.x},${c.y}`;
    if (key === litKey) return;
    litKey = key;
    litCell?.classList.remove('on');
    litCell = cells[cellIndex];
    cellIndex = (cellIndex + 1) % cells.length;
    litCell.setAttribute('transform', `translate(${c.x} ${c.y})`);
    litCell.classList.add('on');
  }

  function clearCell() {
    litCell?.classList.remove('on');
    litCell = null;
    litKey = '';
  }

  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    targetX = e.clientX;
    targetY = e.clientY;
    spot.classList.add('is-on');
    spot.classList.toggle('is-big', !!e.target.closest?.('a, button, .tile'));
    lightCellAt(e.clientX, e.clientY);
    if (!frame) frame = requestAnimationFrame(tick);
  }, { passive: true });

  function hideAll() {
    spot.classList.remove('is-on', 'is-big');
    clearCell();
  }
  document.documentElement.addEventListener('mouseleave', hideAll);
  window.addEventListener('blur', hideAll);
})();

/* =========================
   CARDS → PANELS (open in place, hash-based)
========================= */

const home = document.getElementById('home');
const stage = document.getElementById('main');
const panels = [...document.querySelectorAll('.panel')];
const panelIds = panels.map((p) => p.id);
const BASE_TITLE = 'Antt Hein | Portfolio';

let openedFromHome = false;
let lastCard = null;

function currentPanelId() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return panelIds.includes(id) ? id : null;
}

function renderRoute() {
  const id = currentPanelId();
  home.hidden = !!id;
  panels.forEach((p) => { p.hidden = p.id !== id; });

  if (id) {
    const panel = document.getElementById(id);
    const heading = panel.querySelector('h2');
    document.title = `${heading.textContent} · ${BASE_TITLE}`;
    if (window.matchMedia('(max-width: 899px)').matches) {
      stage.scrollIntoView({ block: 'start' });
    }
    heading.focus({ preventScroll: true });
    trackEvent('panel_open', { panel: id });
  } else {
    document.title = BASE_TITLE;
    openedFromHome = false;
    if (lastCard) {
      lastCard.focus({ preventScroll: true });
      lastCard = null;
    }
  }
}

document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', () => {
    openedFromHome = true;
    lastCard = card;
  });
});

function goHome() {
  if (!currentPanelId()) return;
  if (openedFromHome) {
    history.back();
  } else {
    history.pushState('', document.title, window.location.pathname + window.location.search);
    renderRoute();
  }
}

document.querySelectorAll('[data-back]').forEach((btn) => btn.addEventListener('click', goHome));
window.addEventListener('hashchange', renderRoute);
renderRoute();

/* =========================
   MODAL HELPERS
========================= */

function getFocusableElements(root) {
  if (!root) return [];
  return [...root.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')]
    .filter((el) => !el.hidden && el.offsetParent !== null);
}

function trapModalFocus(e, modalRoot) {
  if (e.key !== 'Tab' || !modalRoot) return;
  const focusable = getFocusableElements(modalRoot);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

const modalReturnFocus = new Map();

function openModal(modal, focusEl) {
  modalReturnFocus.set(modal, document.activeElement);
  modal.hidden = false;
  modal.classList.add('open');
  document.body.classList.add('modal-open');
  (focusEl || getFocusableElements(modal)[0])?.focus();
}

function closeModal(modal) {
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  modal.classList.remove('open');
  if (!document.querySelector('.modal.open')) document.body.classList.remove('modal-open');
  const back = modalReturnFocus.get(modal);
  if (back && typeof back.focus === 'function') back.focus();
  modalReturnFocus.delete(modal);
}

document.querySelectorAll('.modal').forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
});

/* =========================
   CERTIFICATE GALLERY
========================= */

const certModal = document.getElementById('certModal');
const certImage = document.getElementById('certImage');
const certPrev = document.getElementById('certPrev');
const certNext = document.getElementById('certNext');
const certCount = document.getElementById('certCount');
let certImages = [];
let certIndex = 0;

function showCertImage(index) {
  certIndex = (index + certImages.length) % certImages.length;
  certImage.src = certImages[certIndex];
  const multi = certImages.length > 1;
  certPrev.hidden = !multi;
  certNext.hidden = !multi;
  certCount.textContent = multi ? `${certIndex + 1} / ${certImages.length}` : '';
}

document.querySelectorAll('.cert-item[data-cert-images]').forEach((item) => {
  item.addEventListener('click', () => {
    certImages = item.dataset.certImages.split(',').map((s) => s.trim());
    certImage.alt = item.querySelector('strong')?.textContent || 'Certificate';
    showCertImage(0);
    openModal(certModal, document.getElementById('certClose'));
    trackEvent('certificate_open', { certificate: certImage.alt });
  });
});

certPrev?.addEventListener('click', () => showCertImage(certIndex - 1));
certNext?.addEventListener('click', () => showCertImage(certIndex + 1));
document.getElementById('certClose')?.addEventListener('click', () => closeModal(certModal));

/* =========================
   PROJECT DETAIL MODAL
========================= */

const projectData = {
  flakehunter: {
    title: 'FlakeHunter',
    category: 'Hackathon · IBM Bob 2.0 · Sep 2026 · Team GuGuGaGa',
    description: 'Flaky tests pass and fail on the same code, wasting CI time and hiding real bugs. FlakeHunter turns the detective work into one command: it re-runs the suite in random order to prove which tests are flaky, then starts a headless IBM Bob agent per flaky test, in parallel, each in its own isolated copy of the project, to find the root cause and make a minimal fix.',
    tech: ['IBM Bob 2.0', 'Python', 'pytest', 'AST analysis', 'Parallel agents', 'Docker', 'Render'],
    achievements: [
      'Detects flakiness by proof: the suite runs N times in random order',
      'One IBM Bob agent per flaky test, in parallel, each in an isolated temp copy',
      'A fix is kept only if its test passes 50 out of 50 runs; otherwise the original is restored',
      'Demo suite: 4 flaky tests fixed, CI went from green in 15% of runs to 100%',
      'Self-contained HTML report with root causes, diffs and estimated CI time saved'
    ],
    github: 'https://github.com/antthein/Flake_Hunter',
    demo: 'https://flake-hunter.onrender.com/',
    submission: 'https://lablab.ai/ai-hackathons/ibm-bob-2-hackathon/gugugaga/flakehunter-find-and-fix-flaky-tests-with-ibm-bob'
  },
  starterkit: {
    title: 'Project Starter-kit',
    category: 'Hackathon · IBM Bob · May 2026 · Team Techspire',
    description: 'Every developer knows the blank-screen moment. Project Starter-kit turns an idea into a complete project blueprint in under two minutes: describe it in a 7-question form and get the recommended stack with reasoning, a folder structure, key starter files and six steps to run it locally.',
    tech: ['Next.js 16', 'TypeScript', 'Tailwind v4', 'IBM Bob', 'watsonx', 'Claude', 'Vercel'],
    achievements: [
      'Built with IBM Bob as the coding partner on every commit',
      'Pluggable AI engine: watsonx, Anthropic, OpenAI or an offline demo mode, switched with one environment variable',
      'Blueprint can be copied as Markdown or downloaded as a .md file',
      'Live, working proof of concept deployed on Vercel'
    ],
    github: 'https://github.com/antthein/project_starter-kit',
    demo: 'https://project-starter-kit-theta.vercel.app/',
    submission: 'https://lablab.ai/ai-hackathons/ibm-bob-hackathon/techspire/project-starter-kit'
  },
  crm: {
    title: 'Myanmar Insurance Company (CRM)',
    category: 'Power Platform',
    description: 'Provided ongoing support for a Model-Driven App built on Dataverse for a Myanmar insurance company. Diagnosed functional issues, implemented JavaScript customizations, and optimized business process workflows to improve operational efficiency and data integrity.',
    tech: ['Model-Driven App', 'Dataverse', 'JavaScript', 'Power Automate', 'Business Rules', 'Security Roles'],
    achievements: [
      'Diagnosed and resolved complex CRM functional issues, reducing support backlog',
      'Implemented targeted JavaScript customizations for improved user workflows',
      'Optimized Dataverse business rules to enhance data accuracy',
      'Improved workflow performance for insurance claim processing'
    ],
    github: null,
    demo: null
  },
  invoice: {
    title: 'Invoice Management App',
    category: 'Automation',
    description: 'A Power Apps solution using SharePoint as a backend database with automated multi-level approval workflows and auto-PDF generation, enabling streamlined invoice processing and consistent financial record-keeping across the organization.',
    tech: ['Power Apps', 'Power Automate', 'SharePoint', 'PDF Generation', 'Approval Flows', 'Email Notifications'],
    achievements: [
      'Automated end-to-end invoice approval process, eliminating manual follow-ups',
      'Auto PDF generation reduced manual document creation time significantly',
      'Multi-level approval flow with automatic escalation and notifications',
      'Streamlined review cycles across finance and management teams'
    ],
    github: null,
    demo: null
  },
  carbooking: {
    title: 'Car Booking App',
    category: 'Power Platform',
    description: 'A Canvas App for managing company vehicle booking requests with a SharePoint backend. Features an intuitive self-service booking interface, role-based access controls for requesters and approvers, and automated confirmation workflows.',
    tech: ['Canvas App', 'SharePoint', 'Power Automate', 'Role-Based Access', 'Email Notifications', 'Responsive UI'],
    achievements: [
      'Replaced manual booking process with a self-service Canvas App UI',
      'Implemented role-based access controls for requesters and fleet managers',
      'Automated booking confirmation and rejection email notifications',
      'Reduced vehicle scheduling conflicts through real-time availability tracking'
    ],
    github: null,
    demo: null
  },
  globalhr: {
    title: 'Global-HR Staffing Service',
    category: 'Web Development',
    description: 'Company website for Global-HR Staffing Service Pte Ltd, a Singapore employment agency. I built and maintain the live site, manage content updates and job postings, and support bilingual candidate outreach.',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Content Management', 'Canva'],
    achievements: [
      'Built and launched the live company website at globalhrss.com',
      'Manage ongoing content updates and job postings',
      'Designed flyers, marketing materials, and the company profile presentation in Canva',
      'Set up bilingual English/Burmese WhatsApp Business auto-replies for candidate enquiries'
    ],
    github: null,
    demo: 'https://www.globalhrss.com'
  },
  gie: {
    title: 'Global Infrastructure Engineering',
    category: 'Web Development',
    description: 'Live website for the affiliated training centre at giesg.com. I manage the site, publish updates, and keep content current alongside day-to-day operations support.',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Content Management'],
    achievements: [
      'Built and maintain the live company website at giesg.com',
      'Handle content updates and day-to-day publishing',
      'Support bilingual communications for Singapore and Myanmar audiences'
    ],
    github: null,
    demo: 'https://www.giesg.com'
  },
  trp: {
    title: 'TRP Kitchen Solutions',
    category: 'Web Development',
    description: 'A professional website built for TRP Kitchen Solutions P/L, a Singapore-based commercial kitchen provider serving the F&B industry. The site showcases their full range of services, completed project installations, and provides a clear path for client inquiries and quotation requests.',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'Netlify'],
    achievements: [
      'Designed and developed a complete client-facing website from scratch',
      'Showcased 5 core service categories with clear service descriptions',
      'Built a projects gallery highlighting completed commercial kitchen installations',
      'Implemented responsive layout optimised for all screen sizes',
      'Deployed on Netlify with fast global CDN delivery'
    ],
    github: null,
    demo: 'https://chipper-beijinho-4c24e9.netlify.app/'
  },
  ljy: {
    title: 'LJY Engineering Services',
    category: 'Web Development',
    description: 'A B2B corporate website for LJY Engineering Services, a Singapore-based company specialising in electrical installation, air-conditioning systems, and building construction. The site is designed to build professional credibility and drive client quotation requests.',
    tech: ['HTML5', 'JavaScript', 'Responsive Design', 'Netlify'],
    achievements: [
      'Built a professional B2B website that effectively communicates service credibility',
      'Structured 3 core service areas with clear capability descriptions',
      'Designed dark-blue professional aesthetic to match engineering industry standards',
      'Integrated contact and quotation request flow for lead generation',
      'Fully responsive across desktop, tablet, and mobile devices'
    ],
    github: null,
    demo: 'https://69bc9f55b70ae60e62a800b5--fluffy-dolphin-c8c6cb.netlify.app/'
  },
  checkers: {
    title: 'Checkers Game (CS50)',
    category: 'Web Development',
    description: 'A full-stack web implementation of the classic Checkers board game, submitted as the final project for Harvard University\'s CS50x Introduction to Computer Science. Features a rule-based AI opponent, local multiplayer, glassmorphism UI, and persistent game history using SQLite.',
    tech: ['Python', 'Flask', 'JavaScript', 'CSS3', 'HTML5', 'SQLite'],
    achievements: [
      'Built as the CS50x final project at Harvard University',
      'Implemented a rule-based AI opponent with mandatory capture logic and multi-jump support',
      'Full undo/redo functionality for both player moves and AI responses',
      'Glassmorphism dashboard UI with 3D CSS pieces and smooth animations',
      'Game history saved and retrieved from a local SQLite database',
      'Supports both Player vs AI and local Player vs Player modes'
    ],
    github: 'https://github.com/antthein/checkers',
    demo: null
  },
  cipherlab: {
    title: 'Cipher Lab',
    category: 'Lab',
    description: 'An interactive cipher playground for learning text transformations with Caesar, XOR, and Base64 methods. Built to make encryption concepts easy to explore through instant visual feedback.',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Text Processing', 'Interactive Visualizer'],
    achievements: [
      'Implemented three transformation methods in one simple interface',
      'Added method-specific explanations so users can learn while experimenting',
      'Built real-time character mapping visualization for quick understanding',
      'Added copy-to-clipboard support and validation for smoother UX'
    ],
    github: 'https://github.com/antthein/cipher-lab',
    demo: '/cipher-lab/'
  },
  readinglist: {
    title: 'Reading List',
    category: 'Lab',
    description: 'A minimalist personal reading tracker focused on clean visuals and a calm interaction flow. Users can mark books as completed, filter reading states, and track progress over time.',
    tech: ['HTML5', 'Inline CSS', 'Vanilla JavaScript', 'LocalStorage'],
    achievements: [
      'Designed a clean reading-focused interface with light and dark themes',
      'Implemented filtering by fiction, non-fiction, unread, and finished states',
      'Added completion tracking with live progress bar and stats',
      'Persisted reading state locally for a simple no-login experience'
    ],
    github: 'https://github.com/antthein/reading-list',
    demo: '/reading-list/'
  },
  writeandrelease: {
    title: 'Write & Release',
    category: 'Lab',
    description: 'A mindful micro-app for writing private thoughts and releasing them with calm animations. Redesigned with a softer visual language, rotating prompts, keyboard shortcuts, and a privacy-first flow — nothing is ever saved.',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'LocalStorage', 'Accessibility'],
    achievements: [
      'Redesigned UI with glass-style writing card, ambient glow, and refined typography',
      'Added Clear action, Ctrl/⌘+Enter release, Escape to clear, and rotating writing prompts',
      'Burst release animation with toast feedback and prefers-reduced-motion support',
      'Theme toggle with localStorage persistence and system dark-mode detection'
    ],
    github: 'https://github.com/antthein/write-and-release',
    demo: '/write-and-release/'
  }
};

const projectModal = document.getElementById('projectModal');

/* Tech tag text → brand colour key (see [data-tool] in style.css) */
const TOOL_BRANDS = [
  [/^html/i, 'html'], [/^(css|inline css|css animations)/i, 'css'], [/^(javascript|vanilla javascript)$/i, 'javascript'],
  [/^typescript/i, 'typescript'], [/^canva$/i, 'canva'], [/^(power apps|canvas app|model-driven app)$/i, 'powerapps'],
  [/^(power automate|approval flows)$/i, 'powerautomate'], [/^dataverse$/i, 'dataverse'], [/^sharepoint$/i, 'sharepoint'],
  [/^power bi$/i, 'powerbi'], [/^python$/i, 'python'], [/^django$/i, 'django'], [/^mysql$/i, 'mysql'],
  [/^next\.js/i, 'nextjs'], [/^tailwind/i, 'tailwind'], [/^vercel$/i, 'vercel'], [/^netlify$/i, 'netlify'],
  [/^flask$/i, 'flask'], [/^sqlite$/i, 'sqlite'], [/^claude$/i, 'claude'], [/^(ibm bob|watsonx)/i, 'ibm'], [/^docker$/i, 'docker'], [/^render$/i, 'render']
];
function toolBrand(name) {
  const hit = TOOL_BRANDS.find(([re]) => re.test(name.trim()));
  return hit ? hit[1] : null;
}

function makeEl(tag, text, className) {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (className) el.className = className;
  return el;
}

function makeExternalLink(href, label, className) {
  const a = makeEl('a', label + ' ', className);
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.insertAdjacentHTML('beforeend', '<svg class="icon" aria-hidden="true"><use href="#i-ext"/></svg><span class="sr-only">(opens in new tab)</span>');
  return a;
}

window.openProjectModal = function (id) {
  const project = projectData[id];
  if (!project) return;
  trackEvent('project_modal_open', { project_id: id, project_title: project.title });

  document.getElementById('projectModalTitle').textContent = project.title;
  document.getElementById('projectModalCategory').textContent = project.category;
  document.getElementById('projectModalDesc').textContent = project.description;
  document.getElementById('projectModalTech').replaceChildren(...project.tech.map((t) => {
    const li = makeEl('li', t);
    const brand = toolBrand(t);
    if (brand) li.dataset.tool = brand;
    return li;
  }));
  document.getElementById('projectModalAchievements').replaceChildren(...project.achievements.map((a) => makeEl('li', a)));

  const actions = document.getElementById('projectModalActions');
  actions.replaceChildren();
  if (project.demo) actions.appendChild(makeExternalLink(project.demo, 'Live demo', 'btn-primary'));
  if (project.github) actions.appendChild(makeExternalLink(project.github, 'GitHub', 'btn-outline'));
  if (project.submission) actions.appendChild(makeExternalLink(project.submission, 'Hackathon page', 'btn-outline'));

  openModal(projectModal, document.getElementById('projectModalClose'));
};

document.getElementById('projectModalClose')?.addEventListener('click', () => closeModal(projectModal));

/* =========================
   CONTACT FORM
========================= */

const FORM_ENDPOINT = ''; // Add a Formspree (or similar) endpoint to send without the email app

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const CONTACT_EMAIL = 'antthein.dev@gmail.com';

function setFormStatus(message, isSuccess = true) {
  formStatus.textContent = message;
  formStatus.classList.remove('ok', 'err');
  formStatus.classList.add(isSuccess ? 'ok' : 'err');
}

function validateForm() {
  let isValid = true;
  formStatus.textContent = '';
  contactForm.querySelectorAll('.error').forEach((error) => { error.textContent = ''; });

  const name = contactForm.name;
  const email = contactForm._replyto;
  const subject = contactForm.subject;
  const message = contactForm.message;

  if (!name.value || name.value.trim().length < 2) {
    name.nextElementSibling.textContent = 'Please enter your name (at least 2 characters).';
    isValid = false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value || !emailRegex.test(email.value.trim())) {
    email.nextElementSibling.textContent = 'Please enter a valid email address.';
    isValid = false;
  }
  if (!subject.value) {
    subject.nextElementSibling.textContent = 'Please choose a reason.';
    isValid = false;
  }
  if (!message.value || message.value.trim().length < 10) {
    message.nextElementSibling.textContent = 'Please enter a message (at least 10 characters).';
    isValid = false;
  }
  if (!isValid) contactForm.querySelector('.error:not(:empty)')?.previousElementSibling?.focus();
  return isValid;
}

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  trackEvent('contact_submit_attempt');
  if (!validateForm()) {
    trackEvent('contact_submit_validation_failed');
    return;
  }

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  try {
    if (FORM_ENDPOINT) {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(contactForm)
      });
      if (!response.ok) throw new Error('Form submission failed');
      trackEvent('contact_submit_success', { provider: 'form_endpoint' });
      setFormStatus('Thank you! Your message has been sent. I\'ll get back to you soon.', true);
      contactForm.reset();
    } else {
      const formData = new FormData(contactForm);
      const subjectLabel = contactForm.subject.selectedOptions[0]?.textContent || formData.get('subject');
      const subject = encodeURIComponent(`Portfolio Contact - ${subjectLabel}`);
      const body = encodeURIComponent(
        `Name: ${formData.get('name')}\r\nEmail: ${formData.get('_replyto')}\r\n\r\nMessage:\r\n${formData.get('message')}`
      );
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      trackEvent('contact_submit_success', { provider: 'mailto' });
      setFormStatus('Opening your email app… If nothing opens, email me at ' + CONTACT_EMAIL + '.', true);
    }
  } catch (error) {
    trackEvent('contact_submit_failed', { reason: error?.message || 'unknown' });
    setFormStatus('Sorry, the message could not be sent. Please use the email link instead.', false);
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
});

/* =========================
   ROBOT ASSISTANT
========================= */

const botData = {
  greeting: "Hi! I'm Antt's assistant. What would you like to know?",
  suggestions: ['Who is Antt?', 'Skills & tech', 'Projects', 'Contact', 'Fun fact'],
  responses: {
    'Who is Antt?': 'Antt Hein is an IT & Web Developer in Singapore. He builds and manages company websites at Global-HR Staffing Service, designs marketing materials in Canva, and handles IT support. Before that he spent 3+ years as a Microsoft-certified Power Platform developer at BIM Group.',
    'Skills & tech': 'Core stack:\n• Website design & management\n• Canva, bilingual English/Burmese content\n• L1/L2 IT support, hardware & networking\n• Power Platform (Apps, Automate, BI)\n• HTML, CSS, JavaScript, Python',
    'Projects': 'Notable work:\n• FlakeHunter (IBM Bob 2.0 Hackathon)\n• Project Starter-kit (IBM Bob Hackathon)\n• Global-HR (globalhrss.com)\n• GIE Singapore (giesg.com)\n• TRP Kitchen Solutions\n• LJY Engineering Services\n• Invoice Management App\n• Checkers AI game (Harvard CS50)\nOpen the Projects card for details.',
    'Contact': 'Reach Antt here:\n• antthein.dev@gmail.com\n• LinkedIn: antt-hein-bb1a81254\nHe usually replies within 24 hours.',
    'Fun fact': 'Antt studied Geology before switching to tech. He also completed Harvard\'s CS50x and built a full AI-powered Checkers game as his final project.'
  }
};

const botToggle = document.getElementById('botToggle');
const botPanel = document.getElementById('botPanel');
const botMessages = document.getElementById('botMessages');
const botSuggestions = document.getElementById('botSuggestions');

function showBotMessage(text, fromUser = false) {
  const msg = makeEl('p', text, fromUser ? 'bot-msg is-user' : 'bot-msg');
  botMessages.appendChild(msg);
  botMessages.scrollTop = botMessages.scrollHeight;
}

function openBot() {
  botPanel.hidden = false;
  botToggle.setAttribute('aria-expanded', 'true');
  if (!botMessages.childElementCount) {
    showBotMessage(botData.greeting);
    botData.suggestions.forEach((s) => {
      const btn = makeEl('button', s);
      btn.type = 'button';
      btn.addEventListener('click', () => {
        showBotMessage(s, true);
        setTimeout(() => showBotMessage(botData.responses[s]), 300);
        trackEvent('bot_question', { question: s });
      });
      botSuggestions.appendChild(btn);
    });
  }
  botSuggestions.querySelector('button')?.focus();
}

function closeBot() {
  botPanel.hidden = true;
  botToggle.setAttribute('aria-expanded', 'false');
}

botToggle?.addEventListener('click', () => (botPanel.hidden ? openBot() : closeBot()));
document.getElementById('botClose')?.addEventListener('click', () => {
  closeBot();
  botToggle.focus();
});

/* =========================
   CV EMAIL MODAL (EmailJS)
========================= */

const cvModal = document.getElementById('cvEmailModal');

function openCVModal() {
  trackEvent('cv_modal_open');
  document.getElementById('cvSuccessMsg').hidden = true;
  document.getElementById('cvErrorMsg').hidden = true;
  document.getElementById('cvEmailForm').hidden = false;
  openModal(cvModal, document.getElementById('cvEmailInput'));
}

function closeCVModal() {
  closeModal(cvModal);
  document.getElementById('cvEmailInput').value = '';
}

const EMAILJS_CONFIG = {
  publicKey: 'rxbFmMti3kk4abO8N',
  serviceId: 'service_1any6g9',
  templateId: 'template_y9v3p1m'
};
let emailJsReady = false;
if (window.emailjs && EMAILJS_CONFIG.publicKey) {
  window.emailjs.init(EMAILJS_CONFIG.publicKey);
  emailJsReady = true;
}

let cvLastSentAt = 0;
const CV_SEND_COOLDOWN_MS = 60 * 1000;

function sendCV(e) {
  e.preventDefault();
  const email = document.getElementById('cvEmailInput').value.trim();
  const errorMsg = document.getElementById('cvErrorMsg');
  const showError = (text) => {
    errorMsg.textContent = text;
    errorMsg.hidden = false;
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    trackEvent('cv_send_validation_failed');
    showError('Please enter a valid email address.');
    return;
  }
  const remaining = CV_SEND_COOLDOWN_MS - (Date.now() - cvLastSentAt);
  if (remaining > 0) {
    trackEvent('cv_send_rate_limited');
    showError(`Please wait ${Math.ceil(remaining / 1000)}s before sending again.`);
    return;
  }
  if (!emailJsReady) {
    trackEvent('cv_send_unavailable');
    showError('Email service is temporarily unavailable. Please try again later.');
    return;
  }

  const sendBtn = document.getElementById('cvSendBtn');
  const btnText = document.getElementById('cvBtnText');
  const btnLoading = document.getElementById('cvBtnLoading');
  sendBtn.disabled = true;
  btnText.hidden = true;
  btnLoading.hidden = false;
  errorMsg.hidden = true;

  emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
    to_email: email,
    cv_url: 'https://antthein.me/assets/Antt_Hein_CV_IT_Web_Designer_2026.pdf'
  })
    .then(() => {
      cvLastSentAt = Date.now();
      trackEvent('cv_send_success');
      document.getElementById('cvEmailForm').hidden = true;
      document.getElementById('cvSuccessMsg').hidden = false;
      setTimeout(closeCVModal, 3000);
    })
    .catch(() => {
      trackEvent('cv_send_failed');
      showError('Something went wrong. Please try again.');
    })
    .finally(() => {
      sendBtn.disabled = false;
      btnText.hidden = false;
      btnLoading.hidden = true;
    });
}

window.openCVModal = openCVModal;
window.closeCVModal = closeCVModal;
window.sendCV = sendCV;

/* =========================
   KEYBOARD: Escape and focus trap
========================= */

document.addEventListener('keydown', (e) => {
  const openModalEl = document.querySelector('.modal.open');

  if (openModalEl) {
    if (e.key === 'Escape') {
      if (openModalEl === cvModal) closeCVModal(); else closeModal(openModalEl);
    } else if (openModalEl === certModal && e.key === 'ArrowLeft' && certImages.length > 1) {
      showCertImage(certIndex - 1);
    } else if (openModalEl === certModal && e.key === 'ArrowRight' && certImages.length > 1) {
      showCertImage(certIndex + 1);
    } else {
      trapModalFocus(e, openModalEl);
    }
    return;
  }

  if (e.key !== 'Escape') return;
  if (!botPanel.hidden) {
    closeBot();
    botToggle.focus();
  } else if (currentPanelId()) {
    goHome();
  }
});
