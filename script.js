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
const TIKTOK_URL = document.body.dataset.tiktokUrl || 'https://vm.tiktok.com/ZGd9NYLDm/';
const TIKTOK_HANDLE = document.body.dataset.tiktokHandle || 'BabyT TikTok video';

const links = {
  x: document.body.dataset.xUrl || 'https://x.com/babytcoinsol',
  instagram: document.body.dataset.instagramUrl || 'https://www.instagram.com/babytung_sol',
  tiktok: TIKTOK_URL,
  telegram: document.body.dataset.telegramUrl || 'https://t.me/BabyTCommunity',
  pump: `https://pump.fun/coin/${CONTRACT_ADDRESS}`,
  jupiter: `https://jup.ag/tokens/${CONTRACT_ADDRESS}`,
  dex: `https://dexscreener.com/solana/${CONTRACT_ADDRESS}`,
  gecko: `https://www.geckoterminal.com/solana/tokens/${CONTRACT_ADDRESS}`
};

const FALLBACK_MANIFEST = {
  size: 1024,
  layers: [
    { key: 'background', label: 'Background', folder: 'backgrounds', z: 10, options: [{ id: 'none', name: 'No Background', file: null }] },
    { key: 'character', label: 'Character / Shoes', folder: 'characters', z: 20, options: [{ id: 'none', name: 'Add character', file: null }] },
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

function setLinks() {
  document.querySelectorAll('.buy-link').forEach(element => { element.href = links.pump; });
  setHref('xLink', links.x);
  setHref('instagramLink', links.instagram);
  setHref('tiktokLink', links.tiktok);
  setHref('telegramLink', links.telegram);
  setHref('jupiterLink', links.jupiter);
  setHref('dexLink', links.dex);
  setHref('geckoLink', links.gecko);
  setHref('openChartBtn', links.dex);
  setHref('dexHeroLink', links.dex);
  setHref('tiktokProfileCard', links.tiktok);
  setText('caValue', CONTRACT_ADDRESS);
}

function announce(message) {
  if (renderStatus) renderStatus.textContent = message;
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
    const response = await fetch('./assets/manifest.json?v=3', { cache: 'no-cache' });
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

function reset() {
  resetState();
  updateActiveTraitUI();
  renderLayerTabs();
  renderPfp();
}

async function renderPfp() {
  const currentRender = ++renderId;
  let renderedImages = 0;

  announce('Rendering');
  ctx.clearRect(0, 0, SIZE, SIZE);

  for (const layer of layers) {
    const option = selectedOption(layer);
    const src = optionPath(layer, option);
    if (!src) continue;

    const image = await loadImage(src);
    if (currentRender !== renderId) return;

    if (image) {
      ctx.drawImage(image, 0, 0, SIZE, SIZE);
      renderedImages += 1;
    }
  }

  previewFrame?.classList.toggle('has-assets', renderedImages > 0);
  announce(renderedImages ? 'Ready' : 'Add assets');
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
  setLinks();
  const manifest = await loadManifest();
  layers = prepareLayers(manifest);
  resetState();
  renderLayerTabs();
  updateActiveTraitUI();
  await renderPfp();

  document.getElementById('prevTraitBtn')?.addEventListener('click', () => changeActiveTrait(-1));
  document.getElementById('nextTraitBtn')?.addEventListener('click', () => changeActiveTrait(1));
  document.getElementById('randomBtn')?.addEventListener('click', randomize);
  document.getElementById('resetBtn')?.addEventListener('click', reset);
  document.getElementById('downloadBtn')?.addEventListener('click', downloadPfp);
  document.getElementById('copyCaBtn')?.addEventListener('click', event => copyText(CONTRACT_ADDRESS, event.currentTarget, 'Copy'));
  document.getElementById('copyCaBtn2')?.addEventListener('click', event => copyText(CONTRACT_ADDRESS, event.currentTarget, 'Copy contract'));
}

init();
