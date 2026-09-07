(() => {
  const navStyle = document.querySelector('link[href*="nav-overlay.css"]');
  if (navStyle) navStyle.href = './nav-overlay.css?v=5';
  else {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './nav-overlay.css?v=5';
    document.head.appendChild(link);
  }

  const path = location.pathname.toLowerCase();
  const active = {
    game: path.endsWith('/game.html'),
    merch: path.endsWith('/merch.html'),
    token: path.endsWith('/token.html'),
    whitepaper: path.endsWith('/whitepaper.html'),
    conduct: path.endsWith('/code-of-conduct.html'),
    privacy: path.endsWith('/privacy.html'),
    terms: path.endsWith('/terms.html')
  };
  const moreActive = active.whitepaper || active.conduct || active.privacy || active.terms;

  document.querySelectorAll('.portal-play, .mobile-play').forEach(el => el.remove());

  const links = document.querySelector('.portal-links');
  if (links) {
    links.innerHTML = `
      <a ${active.game ? 'class="active"' : ''} href="./game.html">Game</a>
      <a ${active.merch ? 'class="active"' : ''} href="./merch.html">Merch</a>
      <a ${active.token ? 'class="active"' : ''} href="./token.html">$BabyT</a>
      <div class="nav-drop">
        <button class="nav-drop-trigger" type="button" aria-expanded="false">Social <span class="nav-caret" aria-hidden="true"></span></button>
        <div class="nav-dropdown" role="menu">
          <a href="https://x.com/BabyTonSol" target="_blank" rel="noreferrer">X / BabyT <small>↗</small></a>
          <a href="https://www.tiktok.com/@mythosmondays" target="_blank" rel="noreferrer">TikTok <small>↗</small></a>
        </div>
      </div>
      <div class="nav-drop" ${moreActive ? 'data-current="true"' : ''}>
        <button class="nav-drop-trigger ${moreActive ? 'active' : ''}" type="button" aria-expanded="false">More <span class="nav-caret" aria-hidden="true"></span></button>
        <div class="nav-dropdown" role="menu">
          <a ${active.whitepaper ? 'class="active"' : ''} href="./whitepaper.html">Whitepaper</a>
          <a ${active.conduct ? 'class="active"' : ''} href="./code-of-conduct.html">Code of Conduct</a>
          <a ${active.privacy ? 'class="active"' : ''} href="./privacy.html">Privacy Policy</a>
          <a ${active.terms ? 'class="active"' : ''} href="./terms.html">Terms of Use</a>
        </div>
      </div>`;
  }

  const mobileMenu = document.querySelector('.mobile-menu');
  if (mobileMenu) {
    mobileMenu.innerHTML = `
      <a href="./game.html">Game</a>
      <a href="./merch.html">Merch</a>
      <a href="./token.html">$BabyT</a>
      <span class="mobile-group">Social</span>
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
  const closeDrop = drop => {
    if (!drop) return;
    drop.dataset.open = 'false';
    drop.querySelector('.nav-drop-trigger')?.setAttribute('aria-expanded', 'false');
  };
  const openDrop = drop => {
    navDrops.forEach(other => { if (other !== drop) closeDrop(other); });
    drop.dataset.open = 'true';
    drop.querySelector('.nav-drop-trigger')?.setAttribute('aria-expanded', 'true');
  };

  navDrops.forEach(drop => {
    const trigger = drop.querySelector('.nav-drop-trigger');
    let leaveTimer;

    if (canHover) {
      drop.addEventListener('mouseenter', () => {
        clearTimeout(leaveTimer);
        openDrop(drop);
      });
      drop.addEventListener('mouseleave', () => {
        clearTimeout(leaveTimer);
        leaveTimer = setTimeout(() => closeDrop(drop), 110);
      });
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

  const trailer = document.querySelector('.portal-hero-video');
  if (trailer) {
    const reveal = () => document.documentElement.classList.add('has-trailer');
    trailer.addEventListener('canplay', reveal, { once: true });
    trailer.addEventListener('loadeddata', reveal, { once: true });
    trailer.play().catch(() => {});
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
