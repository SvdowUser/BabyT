(() => {
  const menuButton = document.getElementById('menuButton');
  const mobileNav = document.getElementById('mobileNav');
  const toast = document.getElementById('copyToast');
  const header = document.getElementById('siteHeader');
  const hero = document.querySelector('.hero');

  const closeMenu = () => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
  };

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileNav?.classList.toggle('open', !open);
  });

  mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copy || '';
      const label = button.querySelector('[data-copy-label]');
      const original = label?.textContent || 'Copy';

      try {
        await navigator.clipboard.writeText(value);
      } catch {
        const area = document.createElement('textarea');
        area.value = value;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }

      if (label) label.textContent = 'Copied';
      toast?.classList.add('show');
      window.setTimeout(() => {
        if (label) label.textContent = original;
        toast?.classList.remove('show');
      }, 1300);
    });
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  if (hero && finePointer && !reducedMotion) {
    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const paint = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      hero.style.setProperty('--hero-x', `${currentX.toFixed(2)}px`);
      hero.style.setProperty('--hero-y', `${currentY.toFixed(2)}px`);

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        frame = requestAnimationFrame(paint);
      } else {
        frame = 0;
      }
    };

    const requestPaint = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) - 0.5;
      const ny = ((event.clientY - rect.top) / rect.height) - 0.5;
      targetX = nx * 24;
      targetY = ny * 18;
      requestPaint();
    }, { passive: true });

    hero.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
      requestPaint();
    }, { passive: true });
  }

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
