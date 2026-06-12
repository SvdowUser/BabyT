const canvas = document.getElementById('pfpCanvas');
const ctx = canvas.getContext('2d', { alpha: true });
const controlStack = document.getElementById('controlStack');
const renderStatus = document.getElementById('renderStatus');
const SIZE = 1024;
const imageCache = new Map();

const CONTRACT_ADDRESS = document.body.dataset.contractAddress || 'FDN8ycmEo11HxCssiFZ1nTgdJxyuETvyEc3mD85Hpump';
const TIKTOK_URL = document.body.dataset.tiktokUrl || 'https://www.tiktok.com/@mythosmondays';
const TIKTOK_HANDLE = document.body.dataset.tiktokHandle || '@mythosmondays';

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
    {
      key: 'background', label: 'Background', folder: 'backgrounds', z: 10,
      options: [
        { id: 'bg-01-valhalla-gold', name: 'Valhalla Gold', file: 'bg-01-valhalla-gold.png', weight: 1, fallback: 'background', colors: ['#f2b84b', '#9b4f22', '#111318'] },
        { id: 'bg-02-solana-blue', name: 'Solana Blue', file: 'bg-02-solana-blue.png', weight: 1, fallback: 'background', colors: ['#8cecff', '#6257f6', '#090b16'] }
      ]
    },
    {
      key: 'character', label: 'Character / Shoes', folder: 'characters', z: 20,
      options: [
        { id: 'character-01-blue-sneakers', name: 'Blue Sneakers', file: 'character-01-blue-sneakers.png', weight: 1, fallback: 'character', shoe: '#248bff' }
      ]
    },
    { key: 'shirt', label: 'Shirt', folder: 'shirts', z: 30, options: [{ id: 'none', name: 'None', file: null, weight: 1 }] },
    { key: 'glasses', label: 'Glasses / Mask', folder: 'glasses', z: 40, options: [{ id: 'none', name: 'None', file: null, weight: 1 }] },
    { key: 'hand', label: 'Hand Item', folder: 'hand-accessories', z: 50, options: [{ id: 'none', name: 'None', file: null, weight: 1 }] },
    { key: 'hat', label: 'Hat', folder: 'hats', z: 60, options: [{ id: 'none', name: 'None', file: null, weight: 1 }] }
  ]
};

let layers = [];
let state = {};
let renderId = 0;

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setHref(id, value) {
  const el = document.getElementById(id);
  if (el) el.href = value;
}

function setLinks() {
  document.querySelectorAll('.buy-link').forEach(el => { el.href = links.pump; });
  setHref('xLink', links.x);
  setHref('instagramLink', links.instagram);
  setHref('tiktokLink', links.tiktok);
  setHref('telegramLink', links.telegram);
  setHref('jupiterLink', links.jupiter);
  setHref('dexLink', links.dex);
  setHref('geckoLink', links.gecko);
  setHref('openChartBtn', links.dex);
  setHref('tiktokProfileCard', links.tiktok);
  setText('tiktokHandle', TIKTOK_HANDLE);
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
    const response = await fetch('./assets/manifest.json?v=1', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Manifest not found');
    return await response.json();
  } catch (error) {
    return FALLBACK_MANIFEST;
  }
}

function prepareLayers(manifest) {
  const list = Array.isArray(manifest.layers) ? manifest.layers : FALLBACK_MANIFEST.layers;
  return list
    .filter(layer => layer && layer.key && Array.isArray(layer.options))
    .sort((a, b) => (a.z || 0) - (b.z || 0));
}

function resetState() {
  state = Object.fromEntries(layers.map(layer => [layer.key, 0]));
}

function selectedOption(layer) {
  return layer.options[state[layer.key]] || layer.options[0];
}

function selectedIds(partialState = state) {
  return Object.fromEntries(layers.map(layer => {
    const index = partialState[layer.key] ?? 0;
    return [layer.key, layer.options[index]?.id || null];
  }));
}

function optionAllowed(option, currentIds) {
  const requires = Array.isArray(option.requires) ? option.requires : [];
  const excludes = Array.isArray(option.excludes) ? option.excludes : [];
  const hasRequirements = requires.every(([layerKey, optionId]) => currentIds[layerKey] === optionId);
  const hasNoExcludes = excludes.every(([layerKey, optionId]) => currentIds[layerKey] !== optionId);
  return hasRequirements && hasNoExcludes;
}

function weightedPickIndex(layer, currentIds) {
  const allowed = layer.options
    .map((option, index) => ({ option, index }))
    .filter(item => optionAllowed(item.option, currentIds));

  const pool = allowed.length ? allowed : layer.options.map((option, index) => ({ option, index }));
  const total = pool.reduce((sum, item) => sum + Math.max(0, item.option.weight ?? 1), 0) || pool.length;
  let cursor = Math.random() * total;

  for (const item of pool) {
    cursor -= Math.max(0, item.option.weight ?? 1) || 1;
    if (cursor <= 0) return item.index;
  }

  return pool.at(-1).index;
}

function renderControls() {
  if (!controlStack) return;

  controlStack.innerHTML = layers.map(layer => {
    const option = selectedOption(layer);
    const label = escapeHtml(layer.label || layer.key);
    const value = escapeHtml(option.name || option.id || 'None');
    const count = `${(state[layer.key] ?? 0) + 1}/${layer.options.length}`;

    return `
      <div class="control-row" data-layer="${escapeHtml(layer.key)}">
        <button class="arrow-btn" type="button" data-dir="-1" aria-label="Previous ${label}">‹</button>
        <div class="control-main">
          <div class="control-label"><span>${label}</span><span>${count}</span></div>
          <div class="control-value">${value}</div>
        </div>
        <button class="arrow-btn" type="button" data-dir="1" aria-label="Next ${label}">›</button>
      </div>`;
  }).join('');

  controlStack.querySelectorAll('.control-row').forEach(row => {
    row.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => changeLayer(row.dataset.layer, Number(button.dataset.dir)));
    });
  });
}

function changeLayer(key, direction) {
  const layer = layers.find(item => item.key === key);
  if (!layer) return;

  state[key] = ((state[key] ?? 0) + direction + layer.options.length) % layer.options.length;
  renderControls();
  renderPfp();
}

function randomize() {
  const nextState = {};

  for (const layer of layers) {
    const currentIds = selectedIds(nextState);
    nextState[layer.key] = weightedPickIndex(layer, currentIds);
  }

  state = nextState;
  renderControls();
  renderPfp();
}

function reset() {
  resetState();
  renderControls();
  renderPfp();
}

function assetSrc(layer, option) {
  if (!option || !option.file) return null;
  return `./assets/${layer.folder}/${option.file}`;
}

function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (imageCache.has(src)) return imageCache.get(src);

  const promise = new Promise(resolve => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

  imageCache.set(src, promise);
  return promise;
}

async function renderPfp() {
  const currentRender = ++renderId;
  announce('Rendering');
  ctx.clearRect(0, 0, SIZE, SIZE);

  for (const layer of layers) {
    const option = selectedOption(layer);
    if (!option || option.id === 'none') continue;

    const img = await loadImage(assetSrc(layer, option));
    if (currentRender !== renderId) return;

    if (img) ctx.drawImage(img, 0, 0, SIZE, SIZE);
    else drawFallback(option);
  }

  announce('Ready');
}

function roundRect(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawFallback(option) {
  if (option.fallback === 'background') drawBackground(option.colors);
  if (option.fallback === 'character') drawCharacter(option.shoe);
  if (option.fallback === 'shirt') drawShirt(option.color, option.logo);
  if (option.fallback === 'glasses') drawGlasses(option.style);
  if (option.fallback === 'hand') drawHand(option.style);
  if (option.fallback === 'hat') drawHat(option.style);
}

function drawBackground(colors) {
  const c = colors || ['#f2b84b', '#17171d', '#0b0d10'];
  const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  gradient.addColorStop(0, c[0]);
  gradient.addColorStop(.58, c[1]);
  gradient.addColorStop(1, c[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.globalAlpha = .16;
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(170 + i * 128, 170 + i * 80, 120 + i * 20, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawCharacter(shoeColor) {
  const wood = ctx.createLinearGradient(360, 210, 680, 760);
  wood.addColorStop(0, '#f0b46a');
  wood.addColorStop(.48, '#ba6b2f');
  wood.addColorStop(1, '#713915');

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.25)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 20;

  roundRect(340, 185, 350, 555, 82);
  ctx.fillStyle = wood;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  ctx.strokeStyle = 'rgba(83,41,13,.28)';
  ctx.lineWidth = 4;
  for (let x = 388; x <= 650; x += 54) {
    ctx.beginPath();
    ctx.moveTo(x, 220);
    ctx.bezierCurveTo(x - 14, 360, x + 12, 540, x - 4, 716);
    ctx.stroke();
  }

  ctx.fillStyle = '#070708';
  ctx.beginPath(); ctx.ellipse(435, 395, 42, 56, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(595, 395, 42, 56, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(448, 374, 10, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(608, 374, 10, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = '#2d170d';
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(515, 492, 100, .18 * Math.PI, .82 * Math.PI); ctx.stroke();

  ctx.strokeStyle = '#74401b';
  ctx.lineWidth = 30;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(438, 730); ctx.lineTo(418, 845); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(588, 730); ctx.lineTo(620, 845); ctx.stroke();

  drawShoe(350, 840, shoeColor || '#248bff', false);
  drawShoe(560, 840, shoeColor || '#248bff', true);
  ctx.restore();
}

function drawShoe(x, y, color, flip) {
  ctx.save();
  if (flip) { ctx.translate(x + 150, 0); ctx.scale(-1, 1); x = 0; }
  ctx.fillStyle = color;
  roundRect(x, y, 152, 66, 30);
  ctx.fill();
  ctx.fillStyle = '#f7f2e8';
  roundRect(x + 5, y + 38, 158, 30, 16);
  ctx.fill();
  ctx.restore();
}

function drawShirt(color, logo) {
  ctx.save();
  ctx.fillStyle = color || '#f7f2e8';
  roundRect(365, 545, 300, 175, 34);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.18)';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = color === '#f7f2e8' ? '#111116' : '#fff';
  ctx.font = '900 56px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(logo || 'BT', 515, 632);
  ctx.restore();
}

function drawGlasses(style) {
  ctx.save();
  if (style === 'visor') {
    const gradient = ctx.createLinearGradient(330, 370, 700, 430);
    gradient.addColorStop(0, '#f2b84b');
    gradient.addColorStop(.45, '#ff5b8a');
    gradient.addColorStop(1, '#8cecff');
    ctx.fillStyle = gradient;
    roundRect(330, 348, 375, 112, 42);
    ctx.fill();
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 10;
    ctx.stroke();
  } else if (style === 'round') {
    ctx.strokeStyle = '#8cecff';
    ctx.lineWidth = 14;
    ctx.beginPath(); ctx.arc(435, 398, 58, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(595, 398, 58, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(493, 398); ctx.lineTo(537, 398); ctx.stroke();
  } else if (style === 'laser') {
    ctx.strokeStyle = '#ff345f';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(342, 390); ctx.lineTo(484, 412); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(548, 412); ctx.lineTo(690, 390); ctx.stroke();
  } else {
    ctx.fillStyle = '#050507';
    roundRect(352, 360, 150, 84, 26); ctx.fill();
    roundRect(528, 360, 150, 84, 26); ctx.fill();
    ctx.strokeStyle = '#050507';
    ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(502, 396); ctx.lineTo(528, 396); ctx.stroke();
  }
  ctx.restore();
}

function drawHand(style) {
  ctx.save();
  if (style === 'coin') {
    ctx.fillStyle = '#f2b84b';
    ctx.beginPath(); ctx.arc(248, 560, 72, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#161616';
    ctx.font = '900 34px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SOL', 248, 562);
  } else if (style === 'flag') {
    ctx.strokeStyle = '#74401b';
    ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(250, 370); ctx.lineTo(250, 645); ctx.stroke();
    ctx.fillStyle = '#ff5b8a';
    ctx.beginPath(); ctx.moveTo(260, 370); ctx.lineTo(430, 420); ctx.lineTo(260, 472); ctx.closePath(); ctx.fill();
  } else if (style === 'diamond') {
    ctx.fillStyle = '#8cecff';
    ctx.beginPath(); ctx.moveTo(285, 510); ctx.lineTo(358, 565); ctx.lineTo(285, 650); ctx.lineTo(212, 565); ctx.closePath(); ctx.fill();
  } else {
    ctx.strokeStyle = '#8a4d22';
    ctx.lineWidth = 48;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(200, 315); ctx.lineTo(122, 612); ctx.stroke();
  }
  ctx.restore();
}

function drawHat(style) {
  ctx.save();
  if (style === 'halo') {
    ctx.strokeStyle = '#f2b84b';
    ctx.lineWidth = 18;
    ctx.shadowColor = '#f2b84b';
    ctx.shadowBlur = 24;
    ctx.beginPath(); ctx.ellipse(515, 170, 176, 34, 0, 0, Math.PI * 2); ctx.stroke();
  } else if (style === 'crown') {
    ctx.fillStyle = '#f2b84b';
    ctx.beginPath(); ctx.moveTo(355, 245); ctx.lineTo(390, 130); ctx.lineTo(468, 222); ctx.lineTo(520, 120); ctx.lineTo(572, 222); ctx.lineTo(650, 130); ctx.lineTo(682, 245); ctx.closePath(); ctx.fill();
  } else if (style === 'viking') {
    ctx.fillStyle = '#d3d7dc';
    ctx.beginPath(); ctx.ellipse(517, 235, 205, 82, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f7f2e8';
    ctx.beginPath(); ctx.ellipse(315, 200, 80, 35, -.42, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(720, 200, 80, 35, .42, 0, Math.PI * 2); ctx.fill();
  } else if (style === 'cap') {
    ctx.fillStyle = '#171735';
    roundRect(360, 180, 320, 90, 38); ctx.fill();
    ctx.beginPath(); ctx.ellipse(642, 257, 145, 34, .08, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8cecff';
    ctx.font = '900 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('S', 520, 245);
  } else {
    ctx.fillStyle = '#413a54';
    roundRect(345, 150, 350, 122, 54); ctx.fill();
    ctx.fillStyle = '#8cecff';
    roundRect(338, 228, 365, 52, 20); ctx.fill();
  }
  ctx.restore();
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
  try {
    await navigator.clipboard.writeText(value);
    button.textContent = 'Copied';
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
    button.textContent = 'Copied';
  }
  setTimeout(() => { button.textContent = label; }, 1200);
}

async function init() {
  setLinks();
  const manifest = await loadManifest();
  layers = prepareLayers(manifest);
  resetState();
  renderControls();
  await renderPfp();

  document.getElementById('randomBtn')?.addEventListener('click', randomize);
  document.getElementById('resetBtn')?.addEventListener('click', reset);
  document.getElementById('downloadBtn')?.addEventListener('click', downloadPfp);
  document.getElementById('copyCaBtn')?.addEventListener('click', event => copyText(CONTRACT_ADDRESS, event.currentTarget, 'Copy'));
  document.getElementById('copyCaBtn2')?.addEventListener('click', event => copyText(CONTRACT_ADDRESS, event.currentTarget, 'Copy CA'));
}

init();
