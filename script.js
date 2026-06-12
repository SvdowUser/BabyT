const canvas = document.getElementById('pfpCanvas');
const ctx = canvas.getContext('2d', { alpha: true });
const renderStatus = document.getElementById('renderStatus');
const layerTabs = document.getElementById('layerTabs');
const activeLayerLabel = document.getElementById('activeLayerLabel');
const activeTraitName = document.getElementById('activeTraitName');
const previewFrame = document.querySelector('.preview-frame');
const SIZE = 1024;
const imageCache = new Map();

const CONTRACT_ADDRESS = document.body.dataset.contractAddress || '4EL7nmuUrAJJmV6pKUWskYQTH3hsmdJQnUCP238Vpump';
const TIKTOK_URL = document.body.dataset.tiktokUrl || 'https://www.tiktok.com/@mythosmondays';
const TIKTOK_HANDLE = document.body.dataset.tiktokHandle || '@mythosmondays';

const links = {
  x: document.body.dataset.xUrl || 'https://x.com/babytung_sol',
  instagram: document.body.dataset.instagramUrl || 'https://www.instagram.com/babytung_sol',
  tiktok: TIKTOK_URL,
  pump: `https://pump.fun/coin/${CONTRACT_ADDRESS}`,
  jupiter: `https://jup.ag/tokens/${CONTRACT_ADDRESS}`,
  dex: `https://dexscreener.com/solana/${CONTRACT_ADDRESS}`,
  gecko: `https://www.geckoterminal.com/solana/tokens/${CONTRACT_ADDRESS}`
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

const FALLBACK_MANIFEST = {
  size: 1024,
  layers: [
    { key: 'background', label: 'Background', folder: 'backgrounds', z: 10, options: [{ id: 'none', name: 'No Background', file: null }] },
    { key: 'character', label: 'Shoes', folder: 'characters', z: 20, options: [{ id: 'none', name: 'Add shoes', file: null }] },
    { key: 'shirt', label: 'Shirt', folder: 'shirts', z: 30, options: [{ id: 'none', name: 'None', file: null }] },
    { key: 'glasses', label: 'Glasses', folder: 'glasses', z: 40, options: [{ id: 'none', name: 'None', file: null }] },
    { key: 'hand', label: 'Hand item', folder: 'hand-accessories', z: 50, options: [{ id: 'none', name: 'None', file: null }] },
    { key: 'hat', label: 'Hat', folder: 'hats', z: 60, options: [{ id: 'none', name: 'None', file: null }] }
  ]
};

let layers = [];
let state = {};
let activeLayerIndex = 0;
let renderId = 0;

function setHref(id, href) {
  const element = document.getElementById(id);
  if (element) element.href = href;
}

function setText(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

function updateAboutCopy() {
  const about = document.querySelector('.about-story');
  if (!about) return;

  const paragraphs = about.querySelectorAll('p');
  if (paragraphs[0]) {
    paragraphs[0].textContent = 'BabyT is the baby version of Tung Tung Sahur, the wooden TikTok brainrot character that went viral on TikTok.';
  }
  if (paragraphs[1]) {
    paragraphs[1].textContent = 'During the brainrot era, BabyT went viral as one of the first baby brainrots.';
  }
}

function setupDesktopNav() {
  const nav = document.querySelector('.top-actions');
  if (!nav || nav.dataset.ready === 'true') return;

  const getStarted = nav.querySelector('.top-cta') || document.createElement('a');
  getStarted.className = 'top-cta';
  getStarted.href = '#generator';
  getStarted.textContent = 'Get Started';

  const items = [
    ['About', '#about'],
    ['How to Buy', '#how-to-buy'],
    ['Studio', '#generator']
  ];

  nav.innerHTML = '';
  items.forEach(([label, href]) => {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    nav.appendChild(link);
  });
  nav.appendChild(getStarted);
  nav.dataset.ready = 'true';
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

function setLinks() {
  document.querySelectorAll('.buy-link').forEach(element => { element.href = links.pump; });
  setHref('xLink', links.x);
  setHref('instagramLink', links.instagram);
  setHref('tiktokLink', links.tiktok);
  setHref('jupiterLink', links.jupiter);
  setHref('dexLink', links.dex);
  setHref('geckoLink', links.gecko);
  setHref('openChartBtn', links.dex);
  setHref('dexHeroLink', links.dex);
  setHref('tiktokProfileCard', links.tiktok);
  setHref('storyXLink', links.x);
  setHref('storyTiktokLink', links.tiktok);
  setHref('storyInstagramLink', links.instagram);
  setHref('storyPumpLink', links.pump);
  setHref('storyDexLink', links.dex);
  setHref('storyJupiterLink', links.jupiter);
  setHref('storyGeckoLink', links.gecko);
  setText('caValue', CONTRACT_ADDRESS);
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

function statusClass(message) {
  const normalized = String(message || '').toLowerCase();
  if (normalized.includes('load') || normalized.includes('render')) return 'status-loading';
  if (normalized.includes('add')) return 'status-empty';
  if (normalized.includes('download') || normalized.includes('copied')) return 'status-done';
  return 'status-ready';
}

function announce(message) {
  if (!renderStatus) return;
  renderStatus.textContent = message;
  renderStatus.className = statusClass(message);
}

function setPreviewLoading(isLoading) {
  previewFrame?.classList.toggle('is-loading', Boolean(isLoading));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadManifest() {
  try {
    const response = await fetch('./assets/manifest.json?v=5', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Manifest not found');
    return await response.json();
  } catch (error) {
    return FALLBACK_MANIFEST;
  }
}

function prepareLayers(manifest) {
  const list = Array.isArray(manifest.layers) ? manifest.layers : FALLBACK_MANIFEST.layers;
  return list
    .filter(layer => layer && layer.key && Array.isArray(layer.options) && layer.options.length)
    .sort((a, b) => (a.z || 0) - (b.z || 0));
}

function resetState() {
  state = Object.fromEntries(layers.map(layer => [layer.key, 0]));
  activeLayerIndex = 0;
}

function activeLayer() {
  return layers[activeLayerIndex] || layers[0];
}

function selectedOption(layer) {
  const index = state[layer.key] ?? 0;
  return layer.options[index] || layer.options[0];
}

function optionPath(layer, option) {
  if (!option || !option.file) return null;
  return `./assets/${layer.folder}/${option.file}`;
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
    image.onload = () => { clearTimeout(timer); resolve(true); };
    image.onerror = () => { clearTimeout(timer); resolve(false); };
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
      source = `${candidate}?v=14`;
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

function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (imageCache.has(src)) return imageCache.get(src);

  const promise = new Promise(async resolve => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);

    if (src.toLowerCase().endsWith('.b64')) {
      const dataUrl = await b64FileToDataUrl(src);
      if (!dataUrl) return resolve(null);
      image.src = dataUrl;
    } else {
      image.src = src;
    }
  });

  imageCache.set(src, promise);
  return promise;
}

function renderLayerTabs() {
  if (!layerTabs) return;

  layerTabs.innerHTML = layers.map((layer, index) => {
    const isActive = index === activeLayerIndex ? ' active' : '';
    return `<button class="layer-tab${isActive}" type="button" data-index="${index}">${escapeHtml(layer.label || layer.key)}</button>`;
  }).join('');

  layerTabs.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      activeLayerIndex = Number(button.dataset.index) || 0;
      updateActiveTraitUI();
      renderLayerTabs();
    });
  });
}

function updateActiveTraitUI() {
  const layer = activeLayer();
  if (!layer) return;

  const option = selectedOption(layer);
  if (activeLayerLabel) activeLayerLabel.textContent = layer.label || layer.key;
  if (activeTraitName) activeTraitName.textContent = option?.name || 'None';
}

function changeActiveTrait(direction) {
  const layer = activeLayer();
  if (!layer) return;

  const total = layer.options.length;
  state[layer.key] = ((state[layer.key] ?? 0) + direction + total) % total;
  updateActiveTraitUI();
  renderPfp();
}

function weightedPickIndex(layer) {
  const total = layer.options.reduce((sum, option) => sum + Math.max(1, Number(option.weight || 1)), 0);
  let cursor = Math.random() * total;

  for (let index = 0; index < layer.options.length; index += 1) {
    cursor -= Math.max(1, Number(layer.options[index].weight || 1));
    if (cursor <= 0) return index;
  }

  return 0;
}

function randomize() {
  layers.forEach(layer => {
    state[layer.key] = weightedPickIndex(layer);
  });
  updateActiveTraitUI();
  renderLayerTabs();
  renderPfp();
}

async function renderPfp() {
  const currentRender = ++renderId;
  let renderedImages = 0;

  announce('Loading');
  setPreviewLoading(true);

  const draftCanvas = document.createElement('canvas');
  draftCanvas.width = SIZE;
  draftCanvas.height = SIZE;
  const draftCtx = draftCanvas.getContext('2d', { alpha: true });

  try {
    for (const layer of layers) {
      const option = selectedOption(layer);
      const src = optionPath(layer, option);
      if (!src) continue;

      const image = await loadImage(src);
      if (currentRender !== renderId) return;

      if (image) {
        draftCtx.drawImage(image, 0, 0, SIZE, SIZE);
        renderedImages += 1;
      }
    }

    if (currentRender !== renderId) return;

    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.drawImage(draftCanvas, 0, 0, SIZE, SIZE);
    previewFrame?.classList.toggle('has-assets', renderedImages > 0);
    announce(renderedImages ? 'Ready' : 'Add assets');
  } finally {
    if (currentRender === renderId) setPreviewLoading(false);
  }
}

async function downloadPfp() {
  await renderPfp();
  canvas.toBlob(blob => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'BabyT-PFP.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    announce('Downloaded');
    setTimeout(() => announce('Ready'), 1200);
  }, 'image/png');
}

async function copyText(value, button, label) {
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

  setTimeout(() => { labelTarget.textContent = originalText || label; }, 1200);
}

async function init() {
  preventMobileZoom();
  setupDesktopNav();
  setHeaderScrollState();
  setLinks();
  updateAboutCopy();
  initHeroMedia();

  const manifest = await loadManifest();
  layers = prepareLayers(manifest);
  resetState();
  renderLayerTabs();
  updateActiveTraitUI();
  await renderPfp();

  document.getElementById('prevTraitBtn')?.addEventListener('click', () => changeActiveTrait(-1));
  document.getElementById('nextTraitBtn')?.addEventListener('click', () => changeActiveTrait(1));
  document.getElementById('randomBtn')?.addEventListener('click', randomize);
  document.getElementById('downloadBtn')?.addEventListener('click', downloadPfp);
  document.getElementById('copyCaBtn')?.addEventListener('click', event => copyText(CONTRACT_ADDRESS, event.currentTarget, 'Copy'));
  document.getElementById('copyCaBtn2')?.addEventListener('click', event => copyText(CONTRACT_ADDRESS, event.currentTarget, 'CA'));
}

init();