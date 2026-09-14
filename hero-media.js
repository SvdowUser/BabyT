(() => {
  const hero = document.querySelector('.portal-hero');
  const background = hero?.querySelector('.portal-hero-video');
  const toggle = hero?.querySelector('.hero-motion-toggle');
  const dock = document.querySelector('.trailer-dock');
  const trailerButton = document.querySelector('.hero-watch-trailer');
  const isMobile = window.matchMedia('(max-width:760px)');

  /* Progressive loading fixes. The page used to keep whole sections invisible
     until every large image in a group had finished downloading and decoding.
     Instead, warm important below-fold assets gently and reveal each large
     background as soon as that specific file is ready. */
  const progressiveStyle = document.createElement('style');
  progressiveStyle.textContent = `
    .world-home.panorama-ready .world-panorama::before{
      background-image:url('./assets/world/adventure-panorama-artwork.png?v=2')!important;
      opacity:1!important;
    }
    .world-home.panorama-ready .world-panorama::after{opacity:1!important}
    .world-home.community-ready .world-community::before{
      background-image:url('./assets/world/community-world-background.png?v=3')!important;
      opacity:1!important;
    }
    .world-home.community-ready .world-community::after{opacity:1!important}
  `;
  document.head.appendChild(progressiveStyle);

  const warmImage = (src, readyClass) => {
    const image = new Image();
    image.decoding = 'async';
    image.fetchPriority = 'low';
    image.onload = () => requestAnimationFrame(() => document.body?.classList.add(readyClass));
    image.onerror = () => {};
    image.src = src;
  };

  let belowFoldWarmed = false;
  const warmBelowFold = () => {
    if (belowFoldWarmed) return;
    belowFoldWarmed = true;

    /* Ecosystem cards should already be ready when the visitor reaches them.
       Safari can defer loading="lazy" too aggressively on long pages. */
    const ecosystemImages = [...document.querySelectorAll('.world-ecosystem .world-game-card>img:not(.ecosystem-card-logo)')];
    ecosystemImages.forEach(img => {
      img.loading = 'eager';
      img.decoding = 'async';
      img.fetchPriority = 'low';
      if (isMobile.matches && /\/world-hub\.webp(?:\?|$)/.test(img.getAttribute('src') || '')) {
        img.src = './assets/world/world-hub-mobile.webp';
      }
    });

    /* The two huge transition artworks no longer block one another. */
    warmImage('./assets/world/community-world-background.png?v=3', 'community-ready');
    warmImage('./assets/world/adventure-panorama-artwork.png?v=2', 'panorama-ready');
  };

  /* Make the gallery visible progressively instead of keeping both tracks at
     opacity:0 until every gallery image has finished decoding. */
  const gallery = document.querySelector('#in-the-works');
  if (gallery) {
    const revealGallery = () => {
      gallery.querySelectorAll('.work-row-track').forEach(track => {
        track.style.opacity = '1';
        track.style.animationPlayState = 'running';
      });
      gallery.querySelectorAll('.work-row-track img').forEach(img => {
        img.loading = 'eager';
        img.decoding = 'async';
        img.fetchPriority = 'low';
      });
    };

    if ('IntersectionObserver' in window) {
      const galleryRevealObserver = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        galleryRevealObserver.disconnect();
        revealGallery();
      }, { rootMargin: '1800px 0px' });
      galleryRevealObserver.observe(gallery);
    } else {
      revealGallery();
    }
  }

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

  if (!hero || !background || !toggle) {
    setTimeout(warmBelowFold, 700);
    return;
  }

  background.id = 'hero-background-video';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let wantsMotion = !reducedMotion.matches && !connection?.saveData;
  let userOverride = false;
  let inView = true;
  let failed = false;

  /* Force a true centered crop on narrow screens. More importantly, use the
     dedicated mobile video that already exists instead of cropping the desktop
     file down to one side. */
  background.style.setProperty('object-position', '50% 50%', 'important');

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
      const source = isMobile.matches && background.dataset.mobileSrc
        ? background.dataset.mobileSrc
        : background.dataset.desktopSrc;
      background.src = source;
      background.muted = true;
      background.preload = 'auto';
      background.load();
    }
    background.play().then(() => {
      // A hidden tab or scrolling away may have interrupted loading.
      if (!wantsMotion || !inView || document.hidden) background.pause();
      updateToggle();
    }).catch(updateToggle);
  };

  background.addEventListener('canplay', warmBelowFold, { once: true });
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
    warmBelowFold();
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

  /* Never wait indefinitely for video readiness before preparing the rest of the page. */
  setTimeout(warmBelowFold, isMobile.matches ? 900 : 1300);
  syncBackground();
})();