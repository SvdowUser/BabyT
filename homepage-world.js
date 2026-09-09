(() => {
  const gallery = document.querySelector('.works-marquee');
  const toggle = document.querySelector('.gallery-motion');
  if (!gallery || !toggle) return;
  toggle.addEventListener('click', () => {
    const paused = gallery.classList.toggle('gallery-paused');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Play gallery' : 'Pause gallery';
  });
})();
