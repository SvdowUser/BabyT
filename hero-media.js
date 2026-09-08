(() => {
  const hero = document.querySelector('.portal-hero');
  const background = hero?.querySelector('.portal-hero-video');
  const toggle = hero?.querySelector('.hero-motion-toggle');
  const opener = document.querySelector('[data-trailer-open]');
  const dialog = document.querySelector('#trailer-dialog');
  const player = dialog?.querySelector('.trailer-player');
  const error = dialog?.querySelector('.trailer-error');
  if (!hero || !background || !toggle) return;

  background.id = 'hero-background-video';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let wantsMotion = !reducedMotion.matches && !connection?.saveData;
  let userOverride = false;
  let inView = true;
  let failed = false;

  const updateToggle = () => {
    const paused = background.paused;
    toggle.dataset.paused = String(paused);
    toggle.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
    toggle.querySelector('span').textContent = paused ? 'Play background' : 'Pause background';
  };

  const syncBackground = () => {
    if (failed) return;
    if (!wantsMotion || !inView || document.hidden || dialog?.open) {
      background.pause();
      updateToggle();
      return;
    }
    if (!background.getAttribute('src')) {
      background.src = window.matchMedia('(max-width: 680px)').matches
        ? background.dataset.mobileSrc : background.dataset.desktopSrc;
      background.muted = true;
      background.load();
    }
    background.play().then(() => {
      // A dialog or a hidden tab may have interrupted loading.
      if (!wantsMotion || !inView || document.hidden || dialog?.open) background.pause();
      updateToggle();
    }).catch(updateToggle);
  };

  background.addEventListener('playing', () => {
    document.documentElement.classList.add('has-trailer');
    updateToggle();
  });
  background.addEventListener('pause', updateToggle);
  background.addEventListener('error', () => {
    failed = true;
    background.pause();
    document.documentElement.classList.remove('has-trailer');
    toggle.hidden = true;
  });
  toggle.hidden = false;
  updateToggle();
  toggle.addEventListener('click', () => {
    wantsMotion = background.paused;
    userOverride = true;
    syncBackground();
  });
  document.addEventListener('visibilitychange', syncBackground);
  const updatePreference = () => {
    if (!userOverride) wantsMotion = !reducedMotion.matches && !connection?.saveData;
    syncBackground();
  };
  reducedMotion.addEventListener('change', updatePreference);
  connection?.addEventListener?.('change', updatePreference);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      syncBackground();
    }, { threshold: 0.1 }).observe(hero);
  }

  if (opener && dialog && player && typeof dialog.showModal === 'function') {
    opener.addEventListener('click', event => {
      event.preventDefault();
      dialog.showModal();
      document.body.classList.add('trailer-is-open');
      background.pause();
      error.hidden = true;
      if (!player.getAttribute('src')) player.src = player.dataset.src;
      player.currentTime = 0;
      player.muted = false;
      player.play().then(() => {
        if (!dialog.open) player.pause();
      }).catch(() => {
        // Native controls remain available if the browser requires another tap.
      });
    });
    dialog.querySelector('.trailer-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      player.pause();
      document.body.classList.remove('trailer-is-open');
      opener.focus({ preventScroll: true });
      syncBackground();
    });
    player.addEventListener('error', () => { error.hidden = false; });
  }
  syncBackground();
})();
