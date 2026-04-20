/* =========================
   THEME & SIDEBAR MANAGEMENT
========================= */

// Dark/Light mode toggle with persistence
const modeBtn = document.getElementById('modeToggle');
const modeIcon = modeBtn.querySelector('.mode-icon');
const modeText = modeBtn.querySelector('.mode-text');

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark');
}

// Update mode button display
function updateModeButton() {
  const isDark = document.body.classList.contains('dark');
  modeIcon.textContent = isDark ? '☀️' : '🌙';
  modeText.textContent = isDark ? 'Light' : 'Dark';
}

updateModeButton();

modeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateModeButton();
});

// Sidebar collapse functionality
const sidebar = document.querySelector('.sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const savedSidebarState = localStorage.getItem('sidebarCollapsed');

// Load saved sidebar state
if (savedSidebarState === 'true') {
  sidebar.classList.add('collapsed');
  document.body.classList.add('sidebar-collapsed');
}

sidebarToggle.addEventListener('click', () => {
  const isCollapsed = sidebar.classList.toggle('collapsed');
  document.body.classList.toggle('sidebar-collapsed', isCollapsed);
  localStorage.setItem('sidebarCollapsed', isCollapsed);

  // Update tooltip
  sidebarToggle.title = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
});

/* =========================
   MOBILE NAVIGATION
========================= */

// Mobile/Tablet menu toggle
const navToggle = document.getElementById('navToggle');
navToggle?.addEventListener('click', () => {
  const isOpen = sidebar.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

// Close mobile menu after clicking a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (window.matchMedia('(max-width:1024px)').matches) {
      sidebar.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

/* =========================
   ACTIVE NAVIGATION & SCROLL
========================= */

// Get all sections for intersection observer
const sections = [...navLinks].map(link =>
  document.querySelector(link.getAttribute('href'))
).filter(Boolean);

const summaryEl = document.getElementById('sectionSummary');

// Intersection Observer for active navigation
const observerOptions = {
  rootMargin: '-40% 0px -50% 0px',
  threshold: 0.01
};

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = entry.target.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);

    if (entry.isIntersecting) {
      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove('active'));
      // Add active class to current link
      link?.classList.add('active');
      // Update summary (hidden by default)
      if (summaryEl) {
        summaryEl.textContent = link?.dataset.label || '';
      }
    }
  });
}, observerOptions);

// Observe all sections
sections.forEach(section => navObserver.observe(section));

// Smooth scroll for navigation links
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    const target = document.querySelector(targetId);

    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
});

/* =========================
   BACK TO TOP BUTTON
========================= */

const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  // Show/hide back to top button
  if (window.scrollY > 300) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }

  // Add elevation to sidebar on scroll
  sidebar.classList.toggle('elevated', window.scrollY > 8);
});

backToTop.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

/* =========================
   ANIMATED COUNTERS
========================= */

function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, 16);
}

// Intersection Observer for counter animation
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counter = entry.target;
      const target = parseInt(counter.dataset.target);
      animateCounter(counter, target);
      counterObserver.unobserve(counter);
    }
  });
}, { threshold: 0.5 });

// Observe all stat numbers
document.querySelectorAll('.stat-number').forEach(counter => {
  counterObserver.observe(counter);
});

/* =========================
   SKILL BARS ANIMATION
========================= */

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const skillBar = entry.target;
      const width = skillBar.dataset.width;
      setTimeout(() => {
        skillBar.style.width = width;
      }, 200);
      skillObserver.unobserve(skillBar);
    }
  });
}, { threshold: 0.5 });

// Observe all skill progress bars
document.querySelectorAll('.skill-progress').forEach(skill => {
  skillObserver.observe(skill);
});

/* =========================
   PROJECT FILTERING
========================= */

const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    // Update active filter button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Filter project cards
    projectCards.forEach(card => {
      const category = card.dataset.category;
      const shouldShow = filter === 'all' || category === filter;

      if (shouldShow) {
        card.style.display = 'block';
        card.style.animation = 'fadeInUp 0.5s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

/* =========================
   CONTACT FORM HANDLING
========================= */

const FORM_ENDPOINT = ''; // Add your Formspree endpoint here if needed

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

function setFormStatus(message, isSuccess = true) {
  formStatus.textContent = message;
  formStatus.classList.remove('ok', 'err');
  formStatus.classList.add(isSuccess ? 'ok' : 'err');
}

function validateForm() {
  let isValid = true;

  // Clear previous errors
  formStatus.textContent = '';
  contactForm.querySelectorAll('.error').forEach(error => {
    error.textContent = '';
  });

  // Get form fields
  const name = contactForm.name;
  const email = contactForm._replyto || contactForm.email;
  const subject = contactForm.subject;
  const message = contactForm.message;

  // Validate name
  if (!name.value || name.value.trim().length < 2) {
    name.nextElementSibling.textContent = 'Please enter your name (at least 2 characters).';
    isValid = false;
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value || !emailRegex.test(email.value.trim())) {
    email.nextElementSibling.textContent = 'Please enter a valid email address.';
    isValid = false;
  }

  // Validate subject
  if (!subject.value) {
    subject.nextElementSibling.textContent = 'Please select a project type.';
    isValid = false;
  }

  // Validate message
  if (!message.value || message.value.trim().length < 10) {
    message.nextElementSibling.textContent = 'Please enter a message (at least 10 characters).';
    isValid = false;
  }

  return isValid;
}

const contactEmailLink = document.querySelector('.contact-card a[href^="mailto:"]');
const CONTACT_EMAIL = contactEmailLink?.getAttribute('href')?.replace('mailto:', '') || 'antthein.dev@gmail.com';

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');

  // Show loading state
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  try {
    if (FORM_ENDPOINT) {
      // Use Formspree or similar service
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: new FormData(contactForm)
      });

      if (response.ok) {
        setFormStatus('Thank you! Your message has been sent successfully. I\'ll get back to you soon.', true);
        contactForm.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } else {
      // Fallback to mailto
      const formData = new FormData(contactForm);
      const name = encodeURIComponent(formData.get('name'));
      const email = encodeURIComponent(formData.get('_replyto') || formData.get('email'));
      const subject = encodeURIComponent(`Portfolio Contact - ${formData.get('subject')}`);
      const messageText = encodeURIComponent(formData.get('message'));

      const mailtoBody = `Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0AMessage:%0D%0A${messageText}`;
      const mailtoLink = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${mailtoBody}`;

      window.location.href = mailtoLink;
      setFormStatus('Opening your email client... If it doesn\'t open automatically, please copy the information and email me directly.', true);
    }
  } catch (error) {
    console.error('Form submission error:', error);
    setFormStatus('Sorry, there was an error sending your message. Please try using the email link instead.', false);
  } finally {
    // Reset loading state
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
});

/* =========================
   SCROLL ANIMATIONS
========================= */

// General scroll animation observer
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

// Add scroll animation to sections
document.querySelectorAll('section').forEach(section => {
  section.classList.add('animate-on-scroll');
  scrollObserver.observe(section);
});

// Also observe individual project cards for staggered entrance
document.querySelectorAll('.project-card.animate-on-scroll').forEach(card => {
  scrollObserver.observe(card);
});

/* =========================
   PERFORMANCE OPTIMIZATIONS
========================= */

// Debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle resize events
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Optimized scroll handler
const optimizedScrollHandler = debounce(() => {
  const scrollY = window.scrollY;

  // Update back to top button
  backToTop.classList.toggle('show', scrollY > 300);

  // Update sidebar elevation
  sidebar.classList.toggle('elevated', scrollY > 8);
}, 10);

window.addEventListener('scroll', optimizedScrollHandler);

/* =========================
   ACCESSIBILITY ENHANCEMENTS
========================= */

// Keyboard navigation for custom elements
document.addEventListener('keydown', (e) => {
  // ESC key closes mobile menu
  if (e.key === 'Escape' && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  // Enter/Space for custom buttons
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('filter-btn')) {
    e.preventDefault();
    e.target.click();
  }
});

// Focus management for sidebar collapse
sidebarToggle.addEventListener('click', () => {
  // Announce state change to screen readers
  const isCollapsed = sidebar.classList.contains('collapsed');
  const announcement = isCollapsed ? 'Sidebar collapsed' : 'Sidebar expanded';

  // Create temporary announcement for screen readers
  const announcement_el = document.createElement('div');
  announcement_el.setAttribute('aria-live', 'polite');
  announcement_el.setAttribute('aria-atomic', 'true');
  announcement_el.className = 'sr-only';
  announcement_el.textContent = announcement;

  document.body.appendChild(announcement_el);
  setTimeout(() => {
    document.body.removeChild(announcement_el);
  }, 1000);
});

/* =========================
   INITIALIZATION
========================= */

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio initialized successfully!');

  // Add any additional initialization code here

  // Preload critical animations
  document.body.classList.add('loaded');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden - pause animations if needed
  } else {
    // Page is visible - resume animations if needed
  }
});

/* =========================
   TYPING EFFECT
========================= */

document.addEventListener('DOMContentLoaded', () => {
  const text = "Mid-Senior Power Platform Developer | 3+ Years Experience | Myanmar";
  const element = document.getElementById('typing-text');

  if (element) {
    element.textContent = '';
    let index = 0;

    function typeWriter() {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(typeWriter, 50); // Faster speed
      }
    }

    // Start typing after a short delay
    setTimeout(typeWriter, 500);
  }
});

/* =========================
   CERTIFICATE MODAL & GALLERY
========================= */

const certModal = document.getElementById('certModal');
const certModalImg = document.getElementById('certImage');
const certCloseBtn = document.querySelector('.close-modal');
const prevBtn = document.querySelector('.modal-prev');
const nextBtn = document.querySelector('.modal-next');

let currentCertImages = [];
let currentCertIndex = 0;

function showCertImage(index) {
  if (index >= currentCertImages.length) index = 0;
  if (index < 0) index = currentCertImages.length - 1;

  currentCertIndex = index;
  certModalImg.src = currentCertImages[currentCertIndex];

  // Manage navigation buttons visibility
  if (currentCertImages.length > 1) {
    prevBtn.style.display = "block";
    nextBtn.style.display = "block";
  } else {
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
  }
}

// Global function for onclick events in HTML
window.changeSlide = function (n) {
  showCertImage(currentCertIndex + n);
};

if (certModal && certModalImg && certCloseBtn) {
  // Open modal when clicking on a certificate item
  document.querySelectorAll('.cert-item[data-cert-images]').forEach(item => {
    // Get all images
    const imagesAttr = item.dataset.certImages;
    const images = imagesAttr.split(',').map(img => img.trim());

    // Set background image variable for the hover effect (use first image)
    if (images.length > 0) {
      item.style.setProperty('--cert-bg', `url('${images[0]}')`);
    }

    item.addEventListener('click', () => {
      currentCertImages = images;
      currentCertIndex = 0;

      certModal.style.display = "block";
      showCertImage(0);

      // Disable scrolling on body
      document.body.style.overflow = "hidden";
    });
  });

  // Close modal when clicking on (x)
  certCloseBtn.addEventListener('click', () => {
    certModal.style.display = "none";
    document.body.style.overflow = "";
  });

  // Close modal when clicking anywhere outside of the image
  certModal.addEventListener('click', (e) => {
    if (e.target === certModal) {
      certModal.style.display = "none";
      document.body.style.overflow = "";
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (certModal.style.display === "block") {
      if (e.key === 'Escape') {
        certModal.style.display = "none";
        document.body.style.overflow = "";
      } else if (e.key === 'ArrowLeft') {
        changeSlide(-1);
      } else if (e.key === 'ArrowRight') {
        changeSlide(1);
      }
    }
  });
}

/* =========================
   PROJECT DETAIL MODAL
========================= */

const projectData = {
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
    image: null,
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
    image: null,
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
    image: null,
    github: null,
    demo: null
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
    image: null,
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
    image: null,
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
    image: null,
    github: 'https://github.com/antthein/checkers',
    demo: null
  }
};

const projectModal = document.getElementById('projectModal');
const projectModalClose = document.getElementById('projectModalClose');

window.openProjectModal = function (id) {
  const project = projectData[id];
  if (!project) return;

  document.getElementById('projectModalTitle').textContent = project.title;
  document.getElementById('projectModalCategory').textContent = project.category;
  document.getElementById('projectModalDesc').textContent = project.description;

  // Tech tags
  const techEl = document.getElementById('projectModalTech');
  techEl.innerHTML = project.tech.map(t => `<span class="pm-tag">${t}</span>`).join('');

  // Achievements
  const achEl = document.getElementById('projectModalAchievements');
  achEl.innerHTML = project.achievements.map(a => `<li><i class="fas fa-check-circle"></i><span>${a}</span></li>`).join('');

  // Image
  const imgEl = document.getElementById('projectModalImg');
  const placeholderEl = document.getElementById('projectModalPlaceholder');
  if (project.image) {
    imgEl.src = project.image;
    imgEl.alt = project.title;
    imgEl.style.display = 'block';
    placeholderEl.style.display = 'none';
  } else {
    imgEl.style.display = 'none';
    placeholderEl.style.display = 'flex';
  }

  // Action buttons
  const actionsEl = document.getElementById('projectModalActions');
  actionsEl.innerHTML = '';
  if (project.github) {
    actionsEl.innerHTML += `<a href="${project.github}" target="_blank" rel="noopener" class="pm-btn pm-btn-outline"><i class="fab fa-github"></i> GitHub</a>`;
  }
  if (project.demo) {
    actionsEl.innerHTML += `<a href="${project.demo}" target="_blank" rel="noopener" class="pm-btn pm-btn-primary"><i class="fas fa-external-link-alt"></i> Live Demo</a>`;
  }

  projectModal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

function closeProjectModal() {
  projectModal.classList.remove('open');
  document.body.style.overflow = '';
}

if (projectModalClose) {
  projectModalClose.addEventListener('click', closeProjectModal);
}

projectModal?.addEventListener('click', (e) => {
  if (e.target === projectModal) closeProjectModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && projectModal?.classList.contains('open')) {
    closeProjectModal();
  }
});

/* =========================
   ROBOT DOG BOT
========================= */

const botData = {
  greeting: "Hi there! 👋 I'm Antt's assistant bot. What would you like to know?",
  suggestions: ["Who is Antt?", "Skills & Tech", "Projects", "Contact", "Fun fact 🎲"],
  responses: {
    "Who is Antt?": "Antt Hein is a Microsoft-certified Mid-Senior Power Platform Developer 🚀 with 3+ years of experience building enterprise apps using Power Apps, Power Automate, Dataverse & Dynamics 365. Based in Myanmar, available remotely!",
    "Skills & Tech": "Antt's core stack:\n⚡ Power Platform (Apps, Automate, BI)\n🗄️ Dataverse, CRM & Security Roles\n💻 JavaScript, Python, Flask, Java\n🔗 SharePoint & System Integration\n📜 Currently prepping for PL-400!",
    "Projects": "Notable work:\n🏢 Myanmar Insurance CRM\n📄 Invoice Management App (auto PDF)\n🚗 Car Booking App\n🍳 TRP Kitchen Solutions\n⚡ LJY Engineering Services\n♟️ Checkers AI Game (Harvard CS50!)",
    "Contact": "Reach Antt here:\n📧 antthein.dev@gmail.com\n💼 LinkedIn: antt-hein-bb1a81254\n⏰ Replies within 24 hours!",
    "Fun fact 🎲": "Antt studied Geology before switching to tech! 🪨➡️💻 He also completed Harvard's CS50x and built a full AI-powered Checkers game as his final project. Quite the journey!"
  }
};

const siteBot        = document.getElementById('siteBot');
const botBubble      = document.getElementById('botBubble');
const botMessages    = document.getElementById('botMessages');
const botSuggestions = document.getElementById('botSuggestions');
const botBubbleClose = document.getElementById('botBubbleClose');

// Dog sits at bottom-right once walk animation finishes
siteBot?.addEventListener('animationend', () => {
  siteBot.classList.add('dog-sat');
  enableDrag();   // allow dragging once landed
});

/* =========================
   DRAGGABLE BOT
========================= */
function enableDrag() {
  if (!siteBot) return;

  let dragging = false;
  let startX, startY, origRight, origBottom;
  let moved = false;

  function dragStart(clientX, clientY) {
    if (!siteBot.classList.contains('dog-sat')) return;
    dragging = true;
    moved = false;
    const rect = siteBot.getBoundingClientRect();
    // Convert current position to right/bottom from viewport edge
    origRight  = window.innerWidth  - rect.right;
    origBottom = window.innerHeight - rect.bottom;
    startX = clientX;
    startY = clientY;
    siteBot.style.transition = 'none';
    siteBot.style.cursor = 'grabbing';
    // Switch from animation-based position to manual right/bottom
    siteBot.style.right  = origRight  + 'px';
    siteBot.style.bottom = origBottom + 'px';
  }

  function dragMove(clientX, clientY) {
    if (!dragging) return;
    const dx = clientX - startX;
    const dy = clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
    // right decreases when moving right, increases when moving left
    // bottom decreases when moving down, increases when moving up
    let newRight  = origRight  - dx;
    let newBottom = origBottom - dy;
    // Clamp to viewport
    newRight  = Math.max(0, Math.min(window.innerWidth  - siteBot.offsetWidth,  newRight));
    newBottom = Math.max(0, Math.min(window.innerHeight - siteBot.offsetHeight, newBottom));
    siteBot.style.right  = newRight  + 'px';
    siteBot.style.bottom = newBottom + 'px';
  }

  function dragEnd() {
    if (!dragging) return;
    dragging = false;
    siteBot.style.cursor = 'pointer';
    siteBot.style.transition = '';
    // Snap bubble position — if near left side, open bubble to the right
    const rect = siteBot.getBoundingClientRect();
    const nearLeft = rect.left < window.innerWidth / 2;
    botBubble.style.right = nearLeft ? 'auto' : '0';
    botBubble.style.left  = nearLeft ? '0'    : 'auto';
    botBubble.style.borderRadius = nearLeft
      ? '16px 16px 16px 4px'
      : '16px 16px 4px 16px';
  }

  // Mouse events
  siteBot.addEventListener('mousedown', (e) => {
    dragStart(e.clientX, e.clientY);
    e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => dragMove(e.clientX, e.clientY));
  document.addEventListener('mouseup', (e) => {
    if (dragging && !moved && !siteBot._suppressOpen) {
      if (!botBubble.classList.contains('open')) openBot();
    }
    dragEnd();
  });

  // Touch events
  siteBot.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    dragStart(t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    dragMove(t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (dragging && !moved && !siteBot._suppressOpen) {
      if (!botBubble.classList.contains('open')) openBot();
    }
    dragEnd();
  });
}

function openBot() {
  siteBot.classList.add('bot-stopped');
  botBubble.classList.add('open');
  botMessages.innerHTML = '';
  showBotMessage(botData.greeting);
  renderBotSuggestions();
}

function closeBot() {
  botBubble.classList.remove('open');
  setTimeout(() => {
    siteBot.classList.remove('bot-stopped'); // resume idle; dog-sat stays
    botMessages.innerHTML = '';
  }, 350);
}

function showBotMessage(text) {
  const msg = document.createElement('p');
  msg.className = 'bot-msg';
  msg.textContent = text;
  botMessages.appendChild(msg);
  botMessages.scrollTop = botMessages.scrollHeight;
}

function renderBotSuggestions() {
  botSuggestions.innerHTML = '';
  botData.suggestions.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'bot-suggestion-btn';
    btn.textContent = s;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showBotMessage('You: ' + s);
      setTimeout(() => showBotMessage(botData.responses[s]), 350);
    });
    botSuggestions.appendChild(btn);
  });
}

// Click handled inside enableDrag() to distinguish tap vs drag

botBubbleClose?.addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();
  siteBot._suppressOpen = true;   // tell dragEnd not to reopen
  closeBot();
  setTimeout(() => { siteBot._suppressOpen = false; }, 400);
});

/* Eyes follow the cursor */
document.addEventListener('mousemove', (e) => {
  document.querySelectorAll('.dog-iris').forEach(iris => {
    const eye = iris.parentElement;
    const r = eye.getBoundingClientRect();
    if (!r.width) return;
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const max = 3.5;
    const ratio = Math.min(dist, 80) / 80;
    iris.style.setProperty('--px', (dx / dist * max * ratio).toFixed(2) + 'px');
    iris.style.setProperty('--py', (dy / dist * max * ratio).toFixed(2) + 'px');
  });
});

/* =========================
   GUIDE DRAWER (inside sidebar)
========================= */

const guideNavBtn      = document.getElementById('guideNavBtn');
const guideNavBtnMobile = document.getElementById('guideNavBtnMobile');
const guideDrawer      = document.getElementById('guideDrawer');
const guideDrawerClose = document.getElementById('guideDrawerClose');
const guideMobileModal = document.getElementById('guideMobileModal');
const guideMobileClose = document.getElementById('guideMobileClose');

// Desktop sidebar guide button
guideNavBtn?.addEventListener('click', () => {
  const isOpen = guideDrawer.classList.toggle('open');
  guideNavBtn.classList.toggle('active', isOpen);
});

guideDrawerClose?.addEventListener('click', () => {
  guideDrawer.classList.remove('open');
  guideNavBtn.classList.remove('active');
});

// Mobile guide button (inside hamburger dropdown)
guideNavBtnMobile?.addEventListener('click', () => {
  // Close hamburger nav first
  const sidebar = document.querySelector('.sidebar');
  const navToggle = document.getElementById('navToggle');
  sidebar?.classList.remove('open');
  navToggle?.setAttribute('aria-expanded', 'false');
  // Open mobile bottom sheet
  guideMobileModal?.classList.add('open');
});

guideMobileClose?.addEventListener('click', () => {
  guideMobileModal.classList.remove('open');
});
// Tap backdrop to close
guideMobileModal?.addEventListener('click', (e) => {
  if (e.target === guideMobileModal) guideMobileModal.classList.remove('open');
});

/* =========================
   FOOTER
========================= */

const footerYear = document.getElementById('footerYear');
if (footerYear) footerYear.textContent = new Date().getFullYear();

/* =========================
   PROFILE PHOTO COIN FLIP
========================= */

const profileFlip = document.getElementById('profileFlip');
profileFlip?.addEventListener('click', () => {
  profileFlip.classList.toggle('flipped');
});

/* ── CV Email Modal ─────────────────────────────── */
function openCVModal() {
  const modal = document.getElementById('cvEmailModal');
  modal.classList.add('open');
  document.getElementById('cvEmailInput').focus();
  document.getElementById('cvSuccessMsg').style.display = 'none';
  document.getElementById('cvErrorMsg').style.display = 'none';
  document.getElementById('cvEmailForm').style.display = 'block';
}

function closeCVModal() {
  document.getElementById('cvEmailModal').classList.remove('open');
  document.getElementById('cvEmailInput').value = '';
}

// Close on backdrop click
document.getElementById('cvEmailModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeCVModal();
});

// Close on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeCVModal();
});

function sendCV(e) {
  e.preventDefault();
  const email = document.getElementById('cvEmailInput').value.trim();
  if (!email) return;

  const sendBtn = document.getElementById('cvSendBtn');
  const btnText = document.getElementById('cvBtnText');
  const btnLoading = document.getElementById('cvBtnLoading');
  const successMsg = document.getElementById('cvSuccessMsg');
  const errorMsg = document.getElementById('cvErrorMsg');

  // Show loading state
  sendBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline';
  errorMsg.style.display = 'none';

  emailjs.send("service_1any6g9", "template_y9v3p1m", { to_email: email })
    .then(() => {
      btnLoading.style.display = 'none';
      document.getElementById('cvEmailForm').style.display = 'none';
      successMsg.style.display = 'block';
      // Auto-close after 3s
      setTimeout(() => closeCVModal(), 3000);
    })
    .catch(() => {
      btnLoading.style.display = 'none';
      btnText.style.display = 'inline';
      sendBtn.disabled = false;
      errorMsg.style.display = 'block';
    });
}

/* ── Viewer Counter (hits.seeyoufarm.com image badge) ── */
(function () {
  const badge = document.getElementById('viewCounter');
  const img   = document.getElementById('viewBadgeImg');
  if (!badge || !img) return;
  // Show counter once badge image finishes loading
  img.addEventListener('load',  () => { badge.style.opacity = '1'; });
  img.addEventListener('error', () => { badge.style.display = 'none'; });
  badge.style.opacity = '0';
  badge.style.transition = 'opacity 0.5s ease';
})();

/* ── NUS Course Dynamic Progress ───────────────── */
(function () {
  const bar    = document.getElementById('courseProgressBar');
  const label  = document.getElementById('courseProgressLabel');
  const status = document.getElementById('courseStatus');
  if (!bar) return;

  const start = new Date('2026-01-06');  // January start
  const end   = new Date('2026-06-23');  // June 23 end date
  const now   = new Date();

  if (now < start) {
    // Not started yet
    bar.style.width = '0%';
    status.textContent = 'Starting soon';
    label.textContent  = 'Starts January 2026';
    return;
  }

  if (now >= end) {
    // Completed
    bar.style.width = '100%';
    bar.style.background = 'linear-gradient(90deg,#22c55e,#16a34a)';
    status.textContent = 'Completed ✓';
    label.textContent  = '100% · June 2026';
    return;
  }

  // In progress — calculate % between start and end
  const total   = end - start;
  const elapsed = now - start;
  const pct     = Math.min(Math.round((elapsed / total) * 100), 100);

  // Days remaining
  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

  bar.style.width      = pct + '%';
  status.textContent   = 'In progress';
  label.textContent    = `${pct}% complete · ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
})();

/* ── Brand name → scroll to top ─────────────────── */
document.getElementById('brandHome')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
