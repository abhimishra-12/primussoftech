document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  }));

  /* ---------- LED matrix heading: letters power on like a sign booting up ---------- */
  function buildMatrixHeading(el, delayStart) {
    const text = el.dataset.text || el.textContent;
    el.textContent = '';
    const chars = [];
    [...text].forEach(char => {
      const span = document.createElement('span');
      span.className = 'ch';
      span.textContent = char === ' ' ? '\u00A0' : char;
      el.appendChild(span);
      chars.push(span);
    });

    if (reduceMotion) {
      chars.forEach(c => c.classList.add('lit'));
      return;
    }

    let i = 0;
    function step() {
      if (i < chars.length) {
        chars[i].classList.add('lit');
        i++;
        setTimeout(step, 45 + Math.random() * 35);
      } else {
        // gentle ambient flicker after boot-up
        setInterval(() => {
          const idx = Math.floor(Math.random() * chars.length);
          const c = chars[idx];
          if (c.textContent.trim() === '') return;
          c.style.opacity = '0.5';
          setTimeout(() => { c.style.opacity = ''; }, 90);
        }, 700);
      }
    }
    setTimeout(step, delayStart);
  }

  buildMatrixHeading(document.getElementById('matrixHeading'), 200);
  buildMatrixHeading(document.getElementById('matrixHeading2'), 900);

  /* ---------- Hero panel: ambient dot grid ---------- */
  const panelGrid = document.getElementById('panelGrid');
  if (panelGrid) {
    const total = 16 * 12;
    const colors = ['#FFB627', '#2EE6A6', '#FF4757', '#4EA8FF'];
    const frag = document.createDocumentFragment();
    for (let n = 0; n < total; n++) {
      const dot = document.createElement('i');
      frag.appendChild(dot);
    }
    panelGrid.appendChild(frag);
    const dots = panelGrid.querySelectorAll('i');

    if (!reduceMotion) {
      setInterval(() => {
        const idx = Math.floor(Math.random() * dots.length);
        const dot = dots[idx];
        const color = colors[Math.floor(Math.random() * colors.length)];
        dot.style.background = color;
        dot.style.boxShadow = 0 0 8px ${color};
        setTimeout(() => {
          dot.style.background = '';
          dot.style.boxShadow = '';
        }, 900);
      }, 60);
    }
  }

  /* ---------- Count-up stats on scroll ---------- */
  const stats = document.querySelectorAll('.stat__num');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      if (reduceMotion) {
        el.textContent = target + suffix;
        statObserver.unobserve(el);
        return;
      }
      const duration = 1200;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.floor(progress * target);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  stats.forEach(el => statObserver.observe(el));

  /* ---------- Scroll reveal ---------- */
  const revealTargets = document.querySelectorAll('.product, .why_card, .gallerygrid figure, .aboutgrid, .contact_grid');
  revealTargets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
  });
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  if (!reduceMotion) {
    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    revealTargets.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
  }

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const nameField = form.querySelector('#name');
    const phoneField = form.querySelector('#phone');
    const emailField = form.querySelector('#email');
    const messageField = form.querySelector('#message');

    function setValidity(field, ok) {
      field.closest('.field').classList.toggle('invalid', !ok);
      if (!ok) valid = false;
    }

    setValidity(nameField, nameField.value.trim().length > 1);
    setValidity(phoneField, /^[0-9+\-\s()]{7,15}$/.test(phoneField.value.trim()));
    setValidity(emailField, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim()));
    setValidity(messageField, messageField.value.trim().length > 4);

    if (valid) {
      successMsg.classList.add('show');
      form.reset();
      setTimeout(() => successMsg.classList.remove('show'), 5000);
    }
  });

});