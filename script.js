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
