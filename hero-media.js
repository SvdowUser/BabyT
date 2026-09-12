(() => {
  const hero = document.querySelector('.portal-hero');
  const background = hero?.querySelector('.portal-hero-video');
  const toggle = hero?.querySelector('.hero-motion-toggle');
  const dock = document.querySelector('.trailer-dock');
  const trailerButton = document.querySelector('.hero-watch-trailer');

  // Keep the trailer reachable below the hero without covering the content with text.
  if (hero && dock) {
    let scheduled = false;
    const updateDock = () => {
      dock.classList.toggle('is-compact', window.scrollY > Math.min(160, hero.offsetHeight * 0.2));
      scheduled = false;
    };
    const requestDockUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(updateDock);
    };
    updateDock();
    window.addEventListener('scroll', requestDockUpdate, { passive: true });
    window.addEventListener('resize', requestDockUpdate, { passive: true });
    window.addEventListener('pageshow', requestDockUpdate);
  }

  // Restore the original trailer action. The current markup uses a button, so
  // explicitly open the trailer link instead of leaving the control inert.
  if (trailerButton) {
    trailerButton.addEventListener('click', event => {
      event.preventDefault();
      window.open('https://www.youtube.com/watch?v=4iVYylK0Vm4', '_blank', 'noopener,noreferrer');
    });
  }

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
    if (!wantsMotion || !inView || document.hidden) {
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
      // A hidden tab or scrolling away may have interrupted loading.
      if (!wantsMotion || !inView || document.hidden) background.pause();
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

  syncBackground();
})();