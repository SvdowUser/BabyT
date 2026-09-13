(() => {
  /* Warm the two large transition artworks shortly before the user reaches them.
     Their CSS backgrounds stay unset until this finishes, so they no longer
     compete with the hero and first-screen content on initial load. */
  const transitionArtworkUrls = [
    './assets/world/adventure-panorama-artwork.png?v=2',
    './assets/world/community-world-background.png?v=3'
  ];
  const loadTransitionArtwork = src => new Promise(resolve => {
    const image = new Image();
    image.decoding = 'async';
    image.fetchPriority = 'auto';
    image.onload = () => {
      if (typeof image.decode === 'function') {
        image.decode().catch(() => {}).finally(resolve);
      } else {
        resolve();
      }
    };
    image.onerror = resolve;
    image.src = src;
  });

  let transitionArtworkStarted = false;
  const startTransitionArtworkLoad = () => {
    if (transitionArtworkStarted) return;
    transitionArtworkStarted = true;
    Promise.all(transitionArtworkUrls.map(loadTransitionArtwork)).then(() => {
      requestAnimationFrame(() => document.body?.classList.add('artworks-loaded'));
    });
  };

  const transitionSentinel = document.querySelector('.world-ecosystem') || document.querySelector('.world-panorama');
  if (transitionSentinel && 'IntersectionObserver' in window) {
    const transitionObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      transitionObserver.disconnect();
      startTransitionArtworkLoad();
    }, { rootMargin: '1400px 0px' });
    transitionObserver.observe(transitionSentinel);
  } else {
    startTransitionArtworkLoad();
  }

  /* Keep the marquee still until its current artwork is decoded, but do not
     eagerly download the whole gallery while the visitor is still at the hero. */
  const gallery = document.querySelector('#in-the-works');
  const galleryTracks = gallery ? [...gallery.querySelectorAll('.work-row-track')] : [];
  galleryTracks.forEach(track => {
    track.style.animationPlayState = 'paused';
    track.style.opacity = '0';
    track.style.transition = 'opacity .22s ease';
  });

  const preloadGalleryArtwork = src => new Promise(resolve => {
    const image = new Image();
    image.decoding = 'async';
    image.fetchPriority = 'auto';
    image.onload = () => {
      if (typeof image.decode === 'function') {
        image.decode().catch(() => {}).finally(resolve);
      } else {
        resolve();
      }
    };
    image.onerror = resolve;
    image.src = src;
  });

  let galleryArtworkStarted = false;
  const startGalleryArtworkLoad = () => {
    if (galleryArtworkStarted || !gallery) return;
    galleryArtworkStarted = true;

    const galleryImages = [...gallery.querySelectorAll('.work-row-track img')];
    galleryImages.forEach(img => {
      img.loading = 'eager';
      img.fetchPriority = 'auto';
    });

    const galleryArtworkUrls = [...new Set(
      galleryImages
        .map(img => img.getAttribute('src'))
        .filter(Boolean)
    )];

    Promise.all(galleryArtworkUrls.map(preloadGalleryArtwork)).then(() => {
      requestAnimationFrame(() => {
        galleryTracks.forEach(track => {
          track.style.opacity = '1';
          track.style.animationPlayState = 'running';
        });
        gallery.classList.add('gallery-ready');
      });
    });
  };

  if (gallery && 'IntersectionObserver' in window) {
    const galleryObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      galleryObserver.disconnect();
      startGalleryArtworkLoad();
    }, { rootMargin: '1000px 0px' });
    galleryObserver.observe(gallery);
  } else {
    startGalleryArtworkLoad();
  }

  const navStyle = document.querySelector('link[href*="nav-overlay.css"]');
  if (navStyle) navStyle.href = './nav-overlay.css?v=18';
  else {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './nav-overlay.css?v=18';
    document.head.appendChild(link);
  }

  document.querySelectorAll('.portal-play, .mobile-play').forEach(el => el.remove());

  const links = document.querySelector('.portal-links');
  if (links) {
    links.innerHTML = `
      <div class="nav-drop nav-games">
        <button class="nav-drop-trigger" type="button" aria-expanded="false">Games <span class="nav-caret" aria-hidden="true"></span></button>
        <div class="nav-dropdown nav-games-dropdown" role="menu">
          <span class="nav-menu-heading">Brainrot Games</span>
          <a class="nav-game-link" href="https://brainrotbattle.io/">
            <img class="nav-game-thumb" src="./assets/media/brainrot-games-alpha.jpg" alt="">
            <span>Brainrot Battles</span>
          </a>
        </div>
      </div>
      <a href="#" data-placeholder-link="merch">Merch</a>
      <a href="./#babyt-token">$BabyT</a>
      <div class="nav-drop">
        <button class="nav-drop-trigger" type="button" aria-expanded="false">Social <span class="nav-caret" aria-hidden="true"></span></button>
        <div class="nav-dropdown" role="menu">
          <a href="https://www.youtube.com/@PlayBrainrotGames" target="_blank" rel="noopener noreferrer">YouTube <small>↗</small></a>
          <a href="https://x.com/mythosmondaysog" target="_blank" rel="noopener noreferrer">X / Development <small>↗</small></a>
          <a href="https://x.com/BabyTonSol" target="_blank" rel="noreferrer">X / BabyT <small>↗</small></a>
          <a href="https://www.tiktok.com/@mythosmondays" target="_blank" rel="noreferrer">TikTok <small>↗</small></a>
        </div>
      </div>
      <div class="nav-drop">
        <button class="nav-drop-trigger" type="button" aria-expanded="false">More <span class="nav-caret" aria-hidden="true"></span></button>
        <div class="nav-dropdown" role="menu">
          <a href="./whitepaper.html">Whitepaper</a>
          <a href="./code-of-conduct.html">Code of Conduct</a>
          <a href="./privacy.html">Privacy Policy</a>
          <a href="./terms.html">Terms of Use</a>
        </div>
      </div>`;
  }

  const mobileMenu = document.querySelector('.mobile-menu');
  if (mobileMenu) {
    mobileMenu.innerHTML = `
      <span class="mobile-group">Brainrot Games</span>
      <a class="mobile-sub" href="https://brainrotbattle.io/">Brainrot Battles</a>
      <a href="#" data-placeholder-link="merch">Merch</a>
      <a href="./#babyt-token">$BabyT</a>
      <span class="mobile-group">Social</span>
      <a class="mobile-sub" href="https://www.youtube.com/@PlayBrainrotGames" target="_blank" rel="noopener noreferrer">YouTube ↗</a>
      <a class="mobile-sub" href="https://x.com/mythosmondaysog" target="_blank" rel="noopener noreferrer">X / Development ↗</a>
      <a class="mobile-sub" href="https://x.com/BabyTonSol" target="_blank" rel="noreferrer">X / BabyT ↗</a>
      <a class="mobile-sub" href="https://www.tiktok.com/@mythosmondays" target="_blank" rel="noreferrer">TikTok ↗</a>
      <span class="mobile-group">More</span>
      <a class="mobile-sub" href="./whitepaper.html">Whitepaper</a>
      <a class="mobile-sub" href="./code-of-conduct.html">Code of Conduct</a>
      <a class="mobile-sub" href="./privacy.html">Privacy Policy</a>
      <a class="mobile-sub" href="./terms.html">Terms of Use</a>`;
  }

  /* Merch is intentionally a live-looking placeholder until the presale destination is known. */
  document.querySelectorAll('[data-placeholder-link="merch"]').forEach(link => {
    link.addEventListener('click', event => event.preventDefault());
  });

  const navDrops = [...document.querySelectorAll('.nav-drop')];
  const canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const timers = new WeakMap();

  const closeDrop = drop => {
    if (!drop) return;
    const timer = timers.get(drop);
    if (timer) clearTimeout(timer);
    drop.dataset.open = 'false';
    drop.querySelector('.nav-drop-trigger')?.setAttribute('aria-expanded', 'false');
  };
  const closeOthers = current => navDrops.forEach(drop => { if (drop !== current) closeDrop(drop); });
  const openDrop = drop => {
    closeOthers(drop);
    const timer = timers.get(drop);
    if (timer) clearTimeout(timer);
    drop.dataset.open = 'true';
    drop.querySelector('.nav-drop-trigger')?.setAttribute('aria-expanded', 'true');
  };
  const scheduleClose = drop => {
    const old = timers.get(drop);
    if (old) clearTimeout(old);
    const timer = setTimeout(() => closeDrop(drop), 140);
    timers.set(drop, timer);
  };

  navDrops.forEach(drop => {
    const trigger = drop.querySelector('.nav-drop-trigger');
    if (canHover) {
      drop.addEventListener('mouseenter', () => openDrop(drop));
      drop.addEventListener('mouseleave', () => scheduleClose(drop));
      trigger?.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        openDrop(drop);
      });
    } else {
      trigger?.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = drop.dataset.open === 'true';
        navDrops.forEach(closeDrop);
        if (!isOpen) openDrop(drop);
      });
    }
  });

  document.addEventListener('pointermove', e => {
    const hoveredDrop = e.target.closest?.('.nav-drop');
    if (hoveredDrop) closeOthers(hoveredDrop);
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-drop')) navDrops.forEach(closeDrop);
  });

  const menuButton = document.querySelector('.nav-toggle');
  menuButton?.addEventListener('click', () => {
    const open = !menuButton.classList.contains('open');
    menuButton.classList.toggle('open', open);
    mobileMenu?.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  });
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menuButton?.classList.remove('open');
    mobileMenu?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  const heroTitle = document.querySelector('.hero-game-title');
  if (heroTitle) {
    heroTitle.src = './Brainrot_Battles_Header.png?v=1';
    heroTitle.style.visibility = 'visible';
  }

  const transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

  const loadChunkedArtwork = (selector, prefix, chunkCount) => {
    const images = [...document.querySelectorAll(selector)];
    if (!images.length) return;

    images.forEach(img => {
      img.src = transparentPixel;
      img.style.opacity = '0';
      img.style.transition = 'opacity .2s ease';
    });

    Promise.all(
      Array.from({ length: chunkCount }, (_, i) =>
        fetch(`./assets/gallery/${prefix}-${i}.txt?v=1`, { cache: 'force-cache' })
          .then(response => {
            if (!response.ok) throw new Error(`${prefix} chunk ${i} failed: ${response.status}`);
            return response.text();
          })
      )
    ).then(parts => {
      const source = `data:image/webp;base64,${parts.join('').replace(/\s+/g, '')}`;
      images.forEach(img => {
        img.onload = () => { img.style.opacity = '1'; };
        img.onerror = () => { img.style.opacity = '0'; };
        img.src = source;
      });
    }).catch(() => {
      images.forEach(img => { img.style.opacity = '0'; });
    });
  };

  loadChunkedArtwork('.work-card--concept img', 'concept-art', 6);
  loadChunkedArtwork('.work-card--character-concept img', 'character-concept', 6);
  loadChunkedArtwork('.work-card--orangutini-concept img', 'orangutini-v2', 1);

  /* Add the latest tree-trunk concept sheet to both marquee sets so the
     seamless gallery loop stays balanced. */
  document.querySelectorAll('#in-the-works .work-set').forEach((set, index) => {
    if (set.querySelector('img[src*="tree-trunk-concept-sheet.png"]')) return;
    const figure = document.createElement('figure');
    figure.className = 'work-card work-card--medium';
    const image = document.createElement('img');
    image.src = './assets/gallery/tree-trunk-concept-sheet.png?v=2';
    image.alt = index === 0 ? 'Brainrot Battles tree trunk concept sheet' : '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.fetchPriority = 'auto';
    image.style.objectFit = 'contain';
    image.style.background = '#f5e1c0';
    figure.appendChild(image);
    set.appendChild(figure);
  });

  /* Rebuild the creator's exact uploaded transparent footer star trail only
     shortly before the footer is needed. The chunks are immutable assets, so
     allow the browser cache to reuse them on future visits. */
  const footer = document.querySelector('.world-footer');
  let footerArtworkStarted = false;
  const loadFooterArtwork = () => {
    if (footerArtworkStarted || !footer) return;
    footerArtworkStarted = true;
    Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        fetch(`./assets/world/footer-startrail-exact-${i}.txt?v=2`, { cache: 'force-cache' })
          .then(response => {
            if (!response.ok) throw new Error(`footer startrail chunk ${i} failed: ${response.status}`);
            return response.text();
          })
      )
    ).then(parts => {
      const source = `data:image/webp;base64,${parts.join('').replace(/\s+/g, '')}`;
      footer.style.setProperty('--footer-startrail-image', `url("${source}")`);
    }).catch(() => {
      footer.style.removeProperty('--footer-startrail-image');
    });
  };

  if (footer && 'IntersectionObserver' in window) {
    const footerObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      footerObserver.disconnect();
      loadFooterArtwork();
    }, { rootMargin: '900px 0px' });
    footerObserver.observe(footer);
  } else {
    loadFooterArtwork();
  }

  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      const text = button.dataset.copy || '';
      try { await navigator.clipboard.writeText(text); }
      catch {
        const area = document.createElement('textarea');
        area.value = text; area.style.position='fixed'; area.style.opacity='0';
        document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
      }
      const toast = document.querySelector('.toast');
      toast?.classList.add('show');
      setTimeout(() => toast?.classList.remove('show'), 1300);
    });
  });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();