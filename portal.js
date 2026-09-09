(() => {
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
      <a href="./merch.html">Merch</a>
      <a href="./token.html">$BabyT</a>
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
      <a href="./merch.html">Merch</a>
      <a href="./token.html">$BabyT</a>
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