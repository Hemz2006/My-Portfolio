(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  /* Image placeholders: show a labelled box until the real image is added */
  $$('.ph img').forEach((img) => {
    const fig = img.closest('.ph');
    const missing = () => fig.classList.add('is-missing');
    if (img.complete && img.naturalWidth === 0) missing();
    img.addEventListener('error', missing);
  });

  /* Toast */
  const toast = $('#toast');
  let toastTimer;
  function showToast(msg) {
    $('p', toast).textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
  }

  /* Boot sequence — plays on every load. Any key, click or tap skips it. */
  const intro = $('#intro');
  const bootLog = $('#boot-log');
  const bootFill = $('#boot-fill');
  const bootPct = $('#boot-pct');
  const bootStatus = $('#boot-status');
  const BOOT_LINES = [
    ['HVK ENGINE 2026.10', 'starting'],
    ['checking memory', 'ok'],
    ['loading textures', 'ok'],
    ['initialising renderer', 'ok'],
    ['compiling shaders', 'done'],
    ['building world', 'done'],
    ['spawning player', 'ready']
  ];
  const LINE_WIDTH = 34;
  let bootRun = 0;
  let leaveTimer;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function setProgress(p, status) {
    bootFill.style.width = p + '%';
    bootPct.textContent = Math.round(p) + '%';
    if (status) bootStatus.textContent = status;
  }

  async function runBoot(run) {
    const alive = () => run === bootRun && !intro.hidden;
    const done = [];
    const caret = '<span class="caret"></span>';
    for (let i = 0; i < BOOT_LINES.length; i++) {
      const [task, result] = BOOT_LINES[i];
      const dots = Math.max(3, LINE_WIDTH - task.length);
      // dots fill in a few frames, then the result appears
      for (let d = 0; d <= dots; d += 6) {
        if (!alive()) return;
        const partial = '&gt; ' + task + ' <span class="dim">' + '.'.repeat(Math.min(d, dots)) + '</span>';
        bootLog.innerHTML = done.concat(partial + caret).join('\n');
        await wait(28);
      }
      done.push('&gt; ' + task + ' <span class="dim">' + '.'.repeat(dots) + '</span> <span class="ok">' + result + '</span>');
      bootLog.innerHTML = done.concat(caret).join('\n');
      setProgress(((i + 1) / BOOT_LINES.length) * 100, task);
      await wait(90);
    }
    if (!alive()) return;
    setProgress(100, 'Ready');
    await wait(250);
    if (!alive()) return;
    $('#boot').hidden = true;
    $('#splash').hidden = false;
    $('#intro-enter').focus();
    await wait(1600);
    if (alive()) closeIntro();
  }

  function openIntro() {
    clearTimeout(leaveTimer);
    bootRun++;
    bootLog.innerHTML = '';
    setProgress(0, 'Initialising');
    $('#boot').hidden = false;
    $('#splash').hidden = true;
    intro.classList.remove('is-leaving');
    intro.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#intro-skip').focus();
    runBoot(bootRun);
  }
  function closeIntro() {
    if (intro.hidden || intro.classList.contains('is-leaving')) return;
    bootRun++;
    intro.classList.add('is-leaving');
    leaveTimer = setTimeout(() => {
      intro.hidden = true;
      document.body.style.overflow = '';
    }, reducedMotion ? 0 : 450);
  }
  intro.addEventListener('click', closeIntro);
  $('#replay-intro').addEventListener('click', (e) => { e.stopPropagation(); openIntro(); });
  if (!reducedMotion) openIntro();

  /* Mobile menu */
  const menuBtn = $('#menu-btn');
  const menu = $('#mobile-menu');
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close ✕' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (window.innerWidth > 1180 && !menu.hidden) setMenu(false); });

  /* Scroll progress + active section in the nav */
  const progress = $('#progress');
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navLinks = $$('.nav [data-section]');
  const sections = $$('main > section');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => {
        if (a.dataset.section === entry.target.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));

  /* Achievements "unlock" as they scroll into view */
  const unlocks = $$('.unlock');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    unlocks.forEach((el) => el.classList.add('is-unlocked'));
  } else {
    const unlocker = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-unlocked');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    unlocks.forEach((el) => unlocker.observe(el));
  }

  /* Projects: tabs + filters. Without JS every project shows, stacked. */
  const tabs = $$('#proj-cards [role="tab"]');
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  function selectTab(tab, focus) {
    tabs.forEach((t, i) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => selectTab(tab, false));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const visible = tabs.filter((t) => !t.classList.contains('is-hidden'));
      const i = visible.indexOf(tab);
      const next = visible[(i + (e.key === 'ArrowRight' ? 1 : -1) + visible.length) % visible.length];
      selectTab(next, true);
    });
  });
  selectTab(tabs[0], false);

  const filters = $$('.filter');
  filters.forEach((btn) => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filters.forEach((b) => {
      b.classList.toggle('is-on', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    tabs.forEach((t) => t.classList.toggle('is-hidden', f !== 'all' && !t.dataset.tags.split(' ').includes(f)));
    const current = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    if (current.classList.contains('is-hidden')) selectTab(tabs.find((t) => !t.classList.contains('is-hidden')), false);
  }));

  /* Résumé + email */
  $('#resume-dl').addEventListener('click', () => showToast('Downloading résumé.pdf ✓'));
  const copyBtn = $('#copy-email');
  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email copied to clipboard ✓');
    } catch {
      window.location.href = 'mailto:' + email;
    }
  });

  /* Keyboard: 1–9 jump to a section, R for résumé, any key skips the intro */
  const order = ['home', 'grades', 'achievements', 'publications', 'projects', 'internships', 'hobbies', 'interests', 'resume'];
  const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiPos = 0;
  document.addEventListener('keydown', (e) => {
    if (!intro.hidden) { closeIntro(); return; }
    if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); return; }

    konamiPos = e.key === konami[konamiPos] ? konamiPos + 1 : (e.key === konami[0] ? 1 : 0);
    if (konamiPos === konami.length) {
      konamiPos = 0;
      root.classList.toggle('konami');
      showToast('You found the secret. Nice.');
      return;
    }

    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    let id = null;
    if (/^[1-9]$/.test(e.key)) id = order[Number(e.key) - 1];
    else if (e.key === 'r' || e.key === 'R') id = 'resume';
    if (id) goTo(document.getElementById(id));
  });

  /* In-page links scroll without adding #section to the address bar */
  function goTo(target) {
    const offset = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    const top = target === document.body ? 0 : target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
    if (!target.matches('a, button, input, [tabindex]')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const target = a.getAttribute('href') === '#top' ? document.body : document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    goTo(target);
  });
  // an old shared link like /#resume still lands on the section, then the URL is tidied
  if (location.hash) window.addEventListener('load', () => history.replaceState(null, '', location.pathname + location.search));

  $('#year').textContent = new Date().getFullYear();
})();
