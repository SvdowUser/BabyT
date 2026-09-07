(() => {
  // Load the shared overlay-nav styling on every page that uses this script.
  if (!document.querySelector('link[href*="nav-overlay.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './nav-overlay.css?v=1';
    document.head.appendChild(link);
  }

  const path = location.pathname.toLowerCase();
  const active = {
    game: path.endsWith('/game.html'),
    merch: path.endsWith('/merch.html'),
    token: path.endsWith('/token.html')
  };

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
      <a class="mobile-sub" href="./terms.html">Terms of Use</a>
      <a class="mobile-play" href="https://brainrotbattle.io/" target="_blank" rel="noreferrer">Play alpha ↗</a>`;
  }

  document.querySelectorAll('.nav-drop').forEach(drop => {
    const trigger = drop.querySelector('.nav-drop-trigger');
    trigger?.addEventListener('click', e => {
      e.stopPropagation();
      const open = drop.dataset.open === 'true';
      document.querySelectorAll('.nav-drop[data-open="true"]').forEach(other => {
        if (other !== drop) {
          other.dataset.open = 'false';
          other.querySelector('.nav-drop-trigger')?.setAttribute('aria-expanded', 'false');
        }
      });
      drop.dataset.open = String(!open);
      trigger.setAttribute('aria-expanded', String(!open));
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-drop[data-open="true"]').forEach(drop => {
      drop.dataset.open = 'false';
      drop.querySelector('.nav-drop-trigger')?.setAttribute('aria-expanded', 'false');
    });
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

  // A future assets/media/gameplay-trailer.mp4 automatically replaces the homepage poster.
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
