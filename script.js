const CONTRACT_ADDRESS = document.body.dataset.contractAddress || 'Bo3sVJY52FNDBxT3uDN92FcL277fXriy1Un7dXuQpump';
const TIKTOK_URL = document.body.dataset.tiktokUrl || 'https://www.tiktok.com/@mythosmondays';

const links = {
  x: document.body.dataset.xUrl || 'https://x.com/BabyTonSol',
  tiktok: TIKTOK_URL,
  pump: `https://pump.fun/coin/${CONTRACT_ADDRESS}`,
  jupiter: `https://jup.ag/tokens/${CONTRACT_ADDRESS}`,
  dex: `https://dexscreener.com/solana/${CONTRACT_ADDRESS}`
};

const HERO_CANDIDATES = [
  './assets/hero/babyt-hero.gif',
  './assets/hero/babyt-hero.gif.b64',
  './assets/hero/hero.gif',
  './assets/hero/hero.gif.b64',
  './assets/hero/hero-gif.gif',
  './assets/hero/Hero-Gif.gif',
  './assets/hero/baby-t-hero.gif',
  './assets/hero/babytung-hero.gif',
  './assets/hero/babyt-hero.webp',
  './assets/hero/babyt-hero.webp.b64'
];

function setHref(id, href) {
  const element = document.getElementById(id);
  if (element) element.href = href;
}

function setText(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

function setLinks() {
  document.querySelectorAll('.buy-link').forEach(element => {
    element.href = links.pump;
  });

  setHref('dexHeroLink', links.dex);
  setHref('storyPumpLink', links.pump);
  setHref('storyTiktokLink', links.tiktok);
  setHref('storyXLink', links.x);
  setHref('storyDexLink', links.dex);
  setHref('storyJupiterLink', links.jupiter);
  setText('caValue', CONTRACT_ADDRESS);
}

function setHeaderScrollState() {
  const update = () => {
    const atTop = window.scrollY < 18;
    document.body.classList.toggle('at-hero-top', atTop);
    document.body.classList.toggle('header-scrolled', !atTop);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
}

function preventMobileZoom() {
  let lastTouchEnd = 0;

  document.addEventListener('touchend', event => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });

  document.addEventListener('gesturestart', event => {
    event.preventDefault();
  }, { passive: false });
}

function mimeFromPath(src) {
  const clean = src.replace(/\.b64$/i, '').toLowerCase();
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
  if (clean.endsWith('.gif')) return 'image/gif';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.svg')) return 'image/svg+xml';
  return 'image/png';
}

async function b64FileToDataUrl(src) {
  const response = await fetch(src, { cache: 'force-cache' });
  if (!response.ok) return null;
  const b64 = (await response.text()).replace(/\s+/g, '');
  if (!b64) return null;
  return `data:${mimeFromPath(src)};base64,${b64}`;
}

function testImage(src) {
  return new Promise(resolve => {
    const image = new Image();
    const timer = setTimeout(() => resolve(false), 4500);
    image.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    image.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    image.src = src;
  });
}

async function initHeroMedia() {
  const hero = document.querySelector('.hero');
  const image = document.querySelector('.hero-bg-gif');
  if (!hero || !image) return;

  for (const candidate of HERO_CANDIDATES) {
    let source = candidate;

    if (candidate.toLowerCase().endsWith('.b64')) {
      source = await b64FileToDataUrl(candidate);
      if (!source) continue;
    } else {
      source = `${candidate}?v=15`;
    }

    const ok = await testImage(source);
    if (!ok) continue;

    image.src = source;
    hero.classList.add('has-hero-media');
    hero.classList.remove('no-hero-media');
    return;
  }

  image.removeAttribute('src');
  hero.classList.add('no-hero-media');
}

async function copyText(value, button, fallbackLabel) {
  const labelTarget = button.querySelector('em') || button;
  const originalText = labelTarget.textContent;

  try {
    await navigator.clipboard.writeText(value);
    labelTarget.textContent = 'Copied';
  } catch (error) {
    const area = document.createElement('textarea');
    area.value = value;
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.focus();
    area.select();
    document.execCommand('copy');
    area.remove();
    labelTarget.textContent = 'Copied';
  }

  setTimeout(() => {
    labelTarget.textContent = originalText || fallbackLabel;
  }, 1200);
}

function init() {
  preventMobileZoom();
  setHeaderScrollState();
  setLinks();
  initHeroMedia();

  document.getElementById('copyCaBtn')?.addEventListener('click', event => {
    copyText(CONTRACT_ADDRESS, event.currentTarget, 'Copy');
  });
}

init();
