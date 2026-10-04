/* FARISERA — no build step. Open index.html in a browser.
   Internet access enables Google Fonts, GSAP, and the optional desktop orb.
   Content, navigation, and the CSS orb work if any CDN fails.

   BEFORE PUBLISHING:
   1. Set your verified contact information and social links below.
   2. Replace the visibly labeled sample counters/testimonials in index.html.
   3. Remove noindex and add your real canonical URL in index.html.
   4. Add a server-side endpoint only if you want direct form submissions.
*/
(() => {
  'use strict';
  const CONFIG = {
    phone: '+923151248441',
    phoneLabel: '+92 315 1248441',
    whatsapp: '923151248441',
    email: '', // Add a verified business email; blank keeps email links hidden.
    socialLinks: [
      // { name: 'LinkedIn', url: 'YOUR_VERIFIED_HTTPS_PROFILE_URL' },
      // { name: 'Facebook', url: 'YOUR_VERIFIED_HTTPS_PAGE_URL' }
    ],
    enable3D: true // Set false to use the lightweight CSS orb on every device.
  };

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 900px)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;

  // THEME: localStorage can be blocked on file://; every access is guarded.
  let storedTheme;
  try { storedTheme = localStorage.getItem('farisera-theme'); } catch (_) {}
  function setTheme(theme) {
    root.dataset.theme = theme;
    $('.theme-toggle').setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#0B1020' : '#f6f8ff';
    try { localStorage.setItem('farisera-theme', theme); } catch (_) {}
  }
  setTheme(storedTheme === 'light' ? 'light' : 'dark');
  $('.theme-toggle').addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
  $('#year').textContent = new Date().getFullYear();

  // MOBILE MENU: close after navigating, on Escape, and on outside click.
  const menu = $('.menu-toggle'), nav = $('#nav-links');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => { if (!event.target.closest('.nav')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menu.focus(); }
  });
  desktop.addEventListener('change', closeMenu);

  // SCROLL PROGRESS: at most one DOM write per animation frame while scrolling.
  let scrollQueued = false;
  function updateProgress() {
    const range = root.scrollHeight - innerHeight;
    $('.scroll-progress').style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0})`;
    scrollQueued = false;
  }
  addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); } }, { passive: true });
  addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        nav.querySelectorAll('a:not(.button)').forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -55% 0px' });
    $$('main section[id]').forEach(section => sectionObserver.observe(section));
  }

  // GSAP: progressive enhancement; content is never hidden by default CSS.
  let agentTimeline;
  const hasGSAP = Boolean(window.gsap && window.ScrollTrigger);
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      $$('.reveal').forEach((element, index) => {
        gsap.from(element, { y: 22, autoAlpha: 0, duration: .7, ease: 'power2.out',
          delay: element.classList.contains('service-card') ? (index % 4) * .06 : 0,
          scrollTrigger: { trigger: element, start: 'top 94%', once: true } });
      });
      $$('[data-count]').forEach(element => {
        const target = Number(element.dataset.count), counter = { value: 0 };
        gsap.to(counter, { value: target, duration: 1.3, ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 95%', once: true },
          onUpdate: () => { element.textContent = Math.round(counter.value); } });
      });
      agentTimeline = gsap.timeline({ paused: true }).from('.agent-demo .chat-message, .agent-demo .workflow-step', {
        autoAlpha: 0, y: 10, duration: .4, stagger: .35, ease: 'power2.out'
      });
      ScrollTrigger.create({ trigger: '.agent-demo', start: 'top 78%', once: true, onEnter: () => agentTimeline.play() });
      if (desktop.matches) gsap.to('.ambient-one', { y: 55, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .8 } });
      return () => { agentTimeline = null; };
    });
  }
  $('#replay-agent').addEventListener('click', () => {
    if (agentTimeline && !reducedMotion.matches) agentTimeline.restart();
    else { const button = $('#replay-agent'); button.textContent = 'Full workflow shown'; setTimeout(() => { button.textContent = 'Replay demo'; }, 1600); }
  });

  // TEXT MARQUEE: pause control; static under reduced-motion or on mobile.
  $('#tech-toggle').addEventListener('click', () => {
    const paused = $('.tech-section').classList.toggle('tech-paused');
    $('#tech-toggle').textContent = paused ? 'Play technologies' : 'Pause technologies';
    $('#tech-toggle').setAttribute('aria-pressed', String(paused));
  });
  function syncMotionLabels() {
    $('#tech-toggle').disabled = reducedMotion.matches;
    if (reducedMotion.matches) { $('#tech-toggle').textContent = 'Reduced motion enabled'; $$('[data-count]').forEach(el => { el.textContent = el.dataset.count; }); }
    else $('#tech-toggle').textContent = $('.tech-section').classList.contains('tech-paused') ? 'Play technologies' : 'Pause technologies';
  }
  reducedMotion.addEventListener('change', syncMotionLabels); syncMotionLabels();

  // TESTIMONIALS: explicitly labeled sample copy; no automatic advancing.
  const quotes = [
    ['The best part of good software is how naturally it fits into the working day.', 'Example perspective · business operations'],
    ['A clear process and thoughtful communication make a complex project feel manageable.', 'Example perspective · product development'],
    ['Automation is most useful when it gives people more time for the work that needs them.', 'Example perspective · intelligent workflows']
  ];
  let quoteIndex = 0;
  function showQuote(change) {
    quoteIndex = (quoteIndex + change + quotes.length) % quotes.length;
    $('#testimonial-quote').textContent = quotes[quoteIndex][0];
    $('#testimonial-author').textContent = quotes[quoteIndex][1];
    $('#testimonial-position').textContent = `${String(quoteIndex + 1).padStart(2, '0')} / 03`;
  }
  $('#testimonial-prev').addEventListener('click', () => showQuote(-1));
  $('#testimonial-next').addEventListener('click', () => showQuote(1));

  // CONTACT: use confirmed contact details; never invent social profile URLs.
  $('#phone-link').href = `tel:${CONFIG.phone}`; $('#phone-label').textContent = CONFIG.phoneLabel;
  $('#whatsapp-link').href = $('#footer-whatsapp').href = `https://wa.me/${CONFIG.whatsapp}`;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONFIG.email)) {
    $('#email-link').hidden = false; $('#email-link').href = `mailto:${CONFIG.email}`; $('#email-label').textContent = CONFIG.email;
  }
  CONFIG.socialLinks.forEach(social => {
    if (!/^https:\/\//.test(social.url)) return;
    const a = document.createElement('a'); a.href = social.url; a.textContent = social.name;
    a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = 'text-link'; $('#social-links').append(a);
  });
  $$('[data-service]').forEach(link => link.addEventListener('click', () => { $('#service').value = link.dataset.service; }));
  $('#contact-form').addEventListener('submit', event => {
    event.preventDefault(); const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name')).trim(), email = String(data.get('email')).trim();
    const service = String(data.get('service')), message = String(data.get('message')).trim();
    if (!name || !message) { $('#form-status').textContent = 'Please add your name and a short description of your project.'; $('#send-draft').hidden = true; return; }
    const text = `Hello Farisera!\n\nName: ${name}\nEmail: ${email}\nService: ${service}\n\n${message}`;
    $('#send-draft').href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
    $('#send-draft').hidden = false;
    $('#form-status').textContent = 'Your draft is ready. Open WhatsApp below, review your message, then press Send. Nothing has been sent yet.';
  });
  const privacy = $('#privacy-dialog');
  $('#privacy-open').addEventListener('click', () => privacy.showModal());
  privacy.querySelector('.dialog-close').addEventListener('click', () => privacy.close());
  privacy.addEventListener('click', event => { if (event.target === privacy) { const r = privacy.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) privacy.close(); } });

  // LIGHTWEIGHT THREE.JS HERO:
  // - loaded only on desktop, no modules/build tools needed for file://
  // - one wire sphere, one low-poly solid, and 90 points; no textures/shadows
  // - capped at 24fps and 1.25 pixel ratio; pauses off-screen/in background
  // - static fallback for reduced motion, small screens, data-saver, CDN failure
  let orbController = null, loadingOrb = false;
  function shouldUseOrb() { return CONFIG.enable3D && desktop.matches && !reducedMotion.matches && !navigator.connection?.saveData; }
  function loadOrb() {
    if (!shouldUseOrb() || orbController || loadingOrb) return;
    loadingOrb = true;
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.min.js';
    script.onload = () => { loadingOrb = false; if (shouldUseOrb() && window.THREE) setupOrb(); };
    script.onerror = () => { loadingOrb = false; };
    document.head.append(script);
  }
  function setupOrb() {
    const host = $('#orb-canvas'), visual = $('.hero-visual'), button = $('#motion-toggle');
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' }); } catch (_) { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.25));
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, .1, 30); camera.position.z = 5;
    const group = new THREE.Group(); scene.add(group);
    const geometry = new THREE.IcosahedronGeometry(1.35, 2);
    const material = new THREE.MeshPhongMaterial({ color: 0x7966d9, shininess: 75, transparent: true, opacity: .55, flatShading: false });
    group.add(new THREE.Mesh(geometry, material));
    const wireGeo = new THREE.IcosahedronGeometry(1.46, 2);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xb4aeff, wireframe: true, transparent: true, opacity: .2 });
    group.add(new THREE.Mesh(wireGeo, wireMat));
    scene.add(new THREE.AmbientLight(0xa9aaff, 1.4));
    const light = new THREE.DirectionalLight(0x8bf4ff, 3); light.position.set(2, 3, 4); scene.add(light);
    const back = new THREE.DirectionalLight(0xcf8fff, 2); back.position.set(-3, -1, 2); scene.add(back);
    const pointsGeo = new THREE.BufferGeometry(), positions = new Float32Array(90 * 3);
    for (let i = 0; i < 90; i++) { const y = 1 - i / 89 * 2, r = Math.sqrt(1 - y * y), a = i * 2.399963; positions.set([r * Math.cos(a) * 1.8, y * 1.8, r * Math.sin(a) * 1.8], i * 3); }
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pointsMat = new THREE.PointsMaterial({ color: 0xaebff8, size: .022, transparent: true, opacity: .65 });
    group.add(new THREE.Points(pointsGeo, pointsMat));
    host.append(renderer.domElement); visual.classList.add('has-webgl'); button.hidden = false;
    let frame = 0, last = 0, phase = 0, inView = true, paused = false, targetX = 0, targetY = 0, destroyed = false;
    function resize() { const rect = host.getBoundingClientRect(); if (!rect.width || !rect.height) return; renderer.setSize(rect.width, rect.height, false); camera.aspect = rect.width / rect.height; camera.updateProjectionMatrix(); renderer.render(scene, camera); }
    function stop() { if (frame) cancelAnimationFrame(frame); frame = 0; }
    function tick(now) {
      frame = 0;
      if (destroyed || paused || !inView || document.hidden || !shouldUseOrb()) return;
      if (now - last >= 1000 / 24) { const dt = Math.min((now - last) / 1000, .06); last = now; phase += dt;
        group.rotation.y += dt * .095; group.rotation.x += (targetY * .1 - group.rotation.x) * .04;
        group.position.x += (targetX * .1 - group.position.x) * .04; group.position.y = Math.sin(phase * .45) * .06;
        renderer.render(scene, camera);
      }
      frame = requestAnimationFrame(tick);
    }
    function resume() { stop(); if (!destroyed && !paused && inView && !document.hidden && shouldUseOrb()) { last = performance.now(); frame = requestAnimationFrame(tick); } }
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host);
    const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; resume(); }); observer.observe(visual);
    const pointer = event => { if (!finePointer.matches || paused) return; const r = visual.getBoundingClientRect(); targetX = (event.clientX - r.left) / r.width - .5; targetY = (event.clientY - r.top) / r.height - .5; };
    const leave = () => { targetX = targetY = 0; };
    const pause = () => { paused = !paused; button.textContent = paused ? 'Play motion' : 'Pause motion'; button.setAttribute('aria-pressed', String(paused)); resume(); };
    visual.addEventListener('pointermove', pointer, { passive: true }); visual.addEventListener('pointerleave', leave);
    button.addEventListener('click', pause); document.addEventListener('visibilitychange', resume);
    const contextLost = event => { event.preventDefault(); orbController?.destroy(); orbController = null; };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    orbController = { destroy() {
      destroyed = true; stop(); resizeObserver.disconnect(); observer.disconnect();
      visual.removeEventListener('pointermove', pointer); visual.removeEventListener('pointerleave', leave);
      button.removeEventListener('click', pause); document.removeEventListener('visibilitychange', resume);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      [geometry, wireGeo, pointsGeo, material, wireMat, pointsMat].forEach(resource => resource.dispose());
      renderer.dispose(); renderer.domElement.remove(); visual.classList.remove('has-webgl'); button.hidden = true;
    } };
    resize(); resume();
  }
  function syncOrb() { if (!shouldUseOrb()) { orbController?.destroy(); orbController = null; } else if (window.THREE && !orbController) setupOrb(); else loadOrb(); }
  reducedMotion.addEventListener('change', syncOrb); desktop.addEventListener('change', syncOrb);
  if ('requestIdleCallback' in window) requestIdleCallback(loadOrb, { timeout: 1800 }); else setTimeout(loadOrb, 600);
})();
