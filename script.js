/* ===== FINDIT — JavaScript ===== */

// ================================
// NAVBAR — Scroll Effect
// ================================
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function handleScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('transparent');
    } else {
      if (navbar.classList.contains('transparent') || document.body.classList.contains('preferences-page') || document.body.classList.contains('results-page')) {
        // For non-hero pages, keep it solid
      }
      if (document.querySelector('.hero')) {
        navbar.classList.remove('scrolled');
        navbar.classList.add('transparent');
      }
    }
  }

  // Initial state
  if (document.querySelector('.hero')) {
    navbar.classList.add('transparent');
  } else {
    navbar.classList.add('scrolled');
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
})();


// ================================
// MOBILE NAV
// ================================
(function () {
  const toggle = document.getElementById('navToggle');
  const overlay = document.getElementById('mobileOverlay');
  const mobileNav = document.getElementById('mobileNav');
  const closeBtn = document.getElementById('mobileNavClose');

  if (!toggle || !mobileNav) return;

  function openNav() {
    mobileNav.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    mobileNav.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', openNav);
  if (overlay) overlay.addEventListener('click', closeNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);

  // Close on link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });
})();


// ================================
// SCROLL REVEAL ANIMATION
// ================================
(function () {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger the animations
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
})();


// ================================
// AUTH PAGE — Toggle Sign In / Sign Up
// ================================
(function () {
  const signinView = document.getElementById('signinView');
  const signupView = document.getElementById('signupView');
  const signinForm = document.getElementById('signinForm');
  const signupForm = document.getElementById('signupForm');
  const showSignup = document.getElementById('showSignup');
  const showSignin = document.getElementById('showSignin');

  if (!signinView || !signupView) return;

  function switchToSignup() {
    signinView.style.display = 'none';
    signupView.style.display = 'block';
    signinForm.style.display = 'none';
    signupForm.style.display = 'block';
  }

  function switchToSignin() {
    signinView.style.display = 'block';
    signupView.style.display = 'none';
    signinForm.style.display = 'block';
    signupForm.style.display = 'none';
  }

  if (showSignup) showSignup.addEventListener('click', (e) => { e.preventDefault(); switchToSignup(); });
  if (showSignin) showSignin.addEventListener('click', (e) => { e.preventDefault(); switchToSignin(); });

  // Check hash for direct signup link
  if (window.location.hash === '#signup') {
    switchToSignup();
  }
})();


// ================================
// PASSWORD TOGGLE
// ================================
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  } else {
    input.type = 'password';
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }
}


// ================================
// SIGN IN HANDLER
// ================================
function handleSignIn(e) {
  e.preventDefault();
  // Frontend only — redirect to preferences
  const btn = e.target.querySelector('.form-submit');
  btn.textContent = 'Signing in...';
  btn.style.opacity = '0.7';
  btn.disabled = true;

  setTimeout(() => {
    window.location.href = 'preferences.html';
  }, 800);

  return false;
}


// ================================
// SIGN UP HANDLER
// ================================
function handleSignUp(e) {
  e.preventDefault();
  // Frontend only — redirect to preferences
  const btn = e.target.querySelector('.form-submit');
  btn.textContent = 'Creating account...';
  btn.style.opacity = '0.7';
  btn.disabled = true;

  setTimeout(() => {
    window.location.href = 'preferences.html';
  }, 800);

  return false;
}


// ================================
// SKILLS TAG INPUT
// ================================
(function () {
  const container = document.getElementById('skillsInput');
  const input = document.getElementById('skillTagInput');
  if (!container || !input) return;

  const skills = [];

  function addSkill(value) {
    const trimmed = value.trim();
    if (!trimmed || skills.includes(trimmed.toLowerCase())) return;

    skills.push(trimmed.toLowerCase());

    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `${trimmed} <button type="button" class="remove-tag" data-skill="${trimmed.toLowerCase()}">✕</button>`;
    container.insertBefore(tag, input);

    // Remove handler
    tag.querySelector('.remove-tag').addEventListener('click', function () {
      const idx = skills.indexOf(this.dataset.skill);
      if (idx > -1) skills.splice(idx, 1);
      tag.remove();
    });

    input.value = '';
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(this.value);
    }

    // Backspace to remove last tag
    if (e.key === 'Backspace' && this.value === '' && skills.length > 0) {
      const tags = container.querySelectorAll('.tag');
      if (tags.length > 0) {
        const lastTag = tags[tags.length - 1];
        skills.pop();
        lastTag.remove();
      }
    }
  });

  // Click on container focuses input
  container.addEventListener('click', () => input.focus());
})();


// ================================
// FILE UPLOAD — Drag & Drop
// ================================
(function () {
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('resumeFileInput');
  const fileInfo = document.getElementById('uploadFileInfo');
  const fileName = document.getElementById('uploadFileName');
  const removeBtn = document.getElementById('removeFile');

  if (!uploadZone || !fileInput) return;

  // Click to browse
  uploadZone.addEventListener('click', () => fileInput.click());

  // Drag events
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  // File input change
  fileInput.addEventListener('change', function () {
    if (this.files.length > 0) {
      handleFile(this.files[0]);
    }
  });

  function handleFile(file) {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!allowed.includes(file.type) && !['pdf', 'doc', 'docx'].includes(ext)) {
      alert('Please upload a PDF, DOC, or DOCX file.');
      return;
    }

    fileName.textContent = file.name;
    fileInfo.classList.add('active');
    uploadZone.style.display = 'none';
  }

  // Remove file
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      fileInput.value = '';
      fileInfo.classList.remove('active');
      uploadZone.style.display = '';
    });
  }
})();


// ================================
// PREFERENCES FORM HANDLER
// ================================
function handlePreferences(e) {
  e.preventDefault();

  const btn = e.target.querySelector('.form-submit');
  const originalText = btn.innerHTML;
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Submitting...
  `;
  btn.style.opacity = '0.7';
  btn.disabled = true;

  setTimeout(() => {
    window.location.href = 'results.html';
  }, 1200);

  return false;
}


// ================================
// SMOOTH SCROLL for anchor links
// ================================
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#signup') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();


// ================================
// COUNTER ANIMATION for stats
// ================================
(function () {
  const statNumbers = document.querySelectorAll('.hero-stat-number');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));

  function animateCounter(el) {
    const text = el.textContent;
    const match = text.match(/[\d,]+/);
    if (!match) return;

    const target = parseInt(match[0].replace(/,/g, ''));
    const suffix = text.replace(match[0], '');
    const duration = 1500;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);

      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }
})();
