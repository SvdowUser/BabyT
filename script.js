const canvas = document.getElementById('pfpCanvas');
const ctx = canvas.getContext('2d');
const controlStack = document.getElementById('controlStack');
const renderStatus = document.getElementById('renderStatus');
const CONTRACT_ADDRESS = document.body.dataset.contractAddress;
const TIKTOK_URL = document.body.dataset.tiktokUrl;
const TIKTOK_HANDLE = document.body.dataset.tiktokHandle;
const SIZE = 1024;
const cache = new Map();
let renderId = 0;

const links = {
  x: document.body.dataset.xUrl,
  instagram: document.body.dataset.instagramUrl,
  tiktok: TIKTOK_URL,
  telegram: document.body.dataset.telegramUrl,
  pump: `https://pump.fun/coin/${CONTRACT_ADDRESS}`,
  jupiter: `https://jup.ag/tokens/${CONTRACT_ADDRESS}`,
  dex: `https://dexscreener.com/solana/${CONTRACT_ADDRESS}`,
  gecko: `https://www.geckoterminal.com/solana/tokens/${CONTRACT_ADDRESS}`
};

const layers = [
  {key:'background',title:'Background',options:[
    {name:'Valhalla Gold',src:'./assets/backgrounds/bg-01-valhalla-gold.png',fallback:'background',colors:['#f2b84b','#c46b32','#151115']},
    {name:'Solana Blue',src:'./assets/backgrounds/bg-02-solana-blue.png',fallback:'background',colors:['#8cecff','#715cff','#090b16']},
    {name:'Meme Green',src:'./assets/backgrounds/bg-03-meme-green.png',fallback:'background',colors:['#a8ff7a','#1d7f4e','#07120d']},
    {name:'Pink Chaos',src:'./assets/backgrounds/bg-04-pink-chaos.png',fallback:'background',colors:['#ff5b8a','#f2b84b','#160a10']},
    {name:'Night Mode',src:'./assets/backgrounds/bg-05-night-mode.png',fallback:'background',colors:['#28283a','#111116','#060609']},
    {name:'Clean White',src:'./assets/backgrounds/bg-06-clean-white.png',fallback:'background',colors:['#fff','#e7edf5','#d6dde8']}
  ]},
  {key:'character',title:'Character / Shoes',options:[
    {name:'Blue Sneakers',src:'./assets/characters/character-01-blue-sneakers.png',fallback:'character',shoe:'#248bff'},
    {name:'Red Sneakers',src:'./assets/characters/character-02-red-sneakers.png',fallback:'character',shoe:'#ff3e3e'},
    {name:'Black Sneakers',src:'./assets/characters/character-03-black-sneakers.png',fallback:'character',shoe:'#111'},
    {name:'Gold Sneakers',src:'./assets/characters/character-04-gold-sneakers.png',fallback:'character',shoe:'#d89b27'}
  ]},
  {key:'shirt',title:'T-Shirt',options:[
    {name:'None',type:'none'},
    {name:'BabyT Logo',src:'./assets/shirts/shirt-01-babyt-logo.png',fallback:'shirt',color:'#f7f2e8',logo:'BT'},
    {name:'Solana Tee',src:'./assets/shirts/shirt-02-solana.png',fallback:'shirt',color:'#191633',logo:'SOL'},
    {name:'Valhalla Tee',src:'./assets/shirts/shirt-03-valhalla.png',fallback:'shirt',color:'#7a4218',logo:'V'},
    {name:'Pink Hoodie',src:'./assets/shirts/shirt-04-pink-hoodie.png',fallback:'shirt',color:'#ff5b8a',logo:'BT'}
  ]},
  {key:'glasses',title:'Glasses / Mask',options:[
    {name:'None',type:'none'},
    {name:'Black Shades',src:'./assets/glasses/glasses-01-black-shades.png',fallback:'glasses',style:'black'},
    {name:'Rainbow Visor',src:'./assets/glasses/glasses-02-rainbow-visor.png',fallback:'glasses',style:'visor'},
    {name:'Blue Round',src:'./assets/glasses/glasses-03-blue-round.png',fallback:'glasses',style:'round'},
    {name:'Laser Eyes',src:'./assets/glasses/glasses-04-laser-eyes.png',fallback:'glasses',style:'laser'}
  ]},
  {key:'hand',title:'Hand Item',options:[
    {name:'None',type:'none'},
    {name:'Baseball Bat',src:'./assets/hand-accessories/hand-01-baseball-bat.png',fallback:'hand',style:'bat'},
    {name:'Solana Coin',src:'./assets/hand-accessories/hand-02-solana-coin.png',fallback:'hand',style:'coin'},
    {name:'BabyT Flag',src:'./assets/hand-accessories/hand-03-babyt-flag.png',fallback:'hand',style:'flag'},
    {name:'Diamond Hands',src:'./assets/hand-accessories/hand-04-diamond-hands.png',fallback:'hand',style:'diamond'}
  ]},
  {key:'hat',title:'Hat',options:[
    {name:'None',type:'none'},
    {name:'Viking Helmet',src:'./assets/hats/hat-01-viking.png',fallback:'hat',style:'viking'},
    {name:'Solana Cap',src:'./assets/hats/hat-02-solana-cap.png',fallback:'hat',style:'cap'},
    {name:'Golden Crown',src:'./assets/hats/hat-03-golden-crown.png',fallback:'hat',style:'crown'},
    {name:'Halo',src:'./assets/hats/hat-04-halo.png',fallback:'hat',style:'halo'},
    {name:'Beanie',src:'./assets/hats/hat-05-beanie.png',fallback:'hat',style:'beanie'}
  ]}
];

const state = Object.fromEntries(layers.map(layer => [layer.key,0]));

function initLinks(){
  document.querySelectorAll('.buy-link').forEach(el => el.href = links.pump);
  document.getElementById('xLink').href = links.x;
  document.getElementById('instagramLink').href = links.instagram;
  document.getElementById('tiktokLink').href = links.tiktok;
  document.getElementById('telegramLink').href = links.telegram;
  document.getElementById('jupiterLink').href = links.jupiter;
  document.getElementById('dexLink').href = links.dex;
  document.getElementById('geckoLink').href = links.gecko;
  document.getElementById('openChartBtn').href = links.dex;
  document.getElementById('tiktokProfileCard').href = links.tiktok;
  document.getElementById('tiktokHandle').textContent = TIKTOK_HANDLE;
  document.getElementById('caValue').textContent = CONTRACT_ADDRESS;
}

function renderControls(){
  controlStack.innerHTML = layers.map(layer => {
    const selected = layer.options[state[layer.key]];
    return `<div class="control-row" data-layer="${layer.key}">
      <button class="arrow-btn" type="button" data-dir="-1" aria-label="Previous ${layer.title}">‹</button>
      <div>
        <div class="control-label"><span>${layer.title}</span><span>${state[layer.key] + 1}/${layer.options.length}</span></div>
        <div class="control-value">${selected.name}</div>
      </div>
      <button class="arrow-btn" type="button" data-dir="1" aria-label="Next ${layer.title}">›</button>
    </div>`;
  }).join('');

  controlStack.querySelectorAll('.control-row').forEach(row => {
    row.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => changeLayer(row.dataset.layer, Number(button.dataset.dir)));
    });
  });
}

function changeLayer(key,dir){
  const layer = layers.find(item => item.key === key);
  state[key] = (state[key] + dir + layer.options.length) % layer.options.length;
  renderControls();
  drawPfp();
}

function randomize(){
  layers.forEach(layer => state[layer.key] = Math.floor(Math.random() * layer.options.length));
  renderControls();
  drawPfp();
}

function reset(){
  layers.forEach(layer => state[layer.key] = 0);
  renderControls();
  drawPfp();
}

function loadImage(src){
  if(!src) return Promise.resolve(null);
  if(cache.has(src)) return cache.get(src);
  const promise = new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
  cache.set(src,promise);
  return promise;
}

async function drawPfp(){
  const current = ++renderId;
  renderStatus.textContent = 'Rendering';
  ctx.clearRect(0,0,SIZE,SIZE);

  for(const layer of layers){
    const option = layer.options[state[layer.key]];
    if(option.type === 'none') continue;
    const image = await loadImage(option.src);
    if(current !== renderId) return;
    if(image) ctx.drawImage(image,0,0,SIZE,SIZE);
    else drawFallback(option);
  }
  renderStatus.textContent = 'Ready';
}

function drawFallback(option){
  if(option.fallback === 'background') drawBackground(option.colors);
  if(option.fallback === 'character') drawCharacter(option.shoe);
  if(option.fallback === 'shirt') drawShirt(option.color,option.logo);
  if(option.fallback === 'glasses') drawGlasses(option.style);
  if(option.fallback === 'hand') drawHand(option.style);
  if(option.fallback === 'hat') drawHat(option.style);
}

function round(x,y,w,h,r){
  const radius = Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+radius,y);
  ctx.arcTo(x+w,y,x+w,y+h,radius);
  ctx.arcTo(x+w,y+h,x,y+h,radius);
  ctx.arcTo(x,y+h,x,y,radius);
  ctx.arcTo(x,y,x+w,y,radius);
  ctx.closePath();
}

function drawBackground(colors){
  const c = colors || ['#f2b84b','#17171d','#0b0b0e'];
  const g = ctx.createLinearGradient(0,0,1024,1024);
  g.addColorStop(0,c[0]);g.addColorStop(.55,c[1]);g.addColorStop(1,c[2]);
  ctx.fillStyle = g;ctx.fillRect(0,0,1024,1024);
  ctx.globalAlpha = .18;ctx.fillStyle = '#fff';
  for(let i=0;i<9;i++){ctx.beginPath();ctx.arc(170+i*115,160+i*80,120+i*18,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha = 1;
}

function drawCharacter(shoe){
  const wood = ctx.createLinearGradient(360,210,680,760);
  wood.addColorStop(0,'#f0b46a');wood.addColorStop(.48,'#ba6b2f');wood.addColorStop(1,'#713915');
  ctx.save();ctx.shadowColor='rgba(0,0,0,.25)';ctx.shadowBlur=26;ctx.shadowOffsetY=20;
  round(340,185,350,555,82);ctx.fillStyle=wood;ctx.fill();ctx.shadowColor='transparent';
  ctx.strokeStyle='rgba(83,41,13,.28)';ctx.lineWidth=4;
  for(let x=388;x<=650;x+=54){ctx.beginPath();ctx.moveTo(x,220);ctx.bezierCurveTo(x-14,360,x+12,540,x-4,716);ctx.stroke();}
  ctx.fillStyle='#070708';ctx.beginPath();ctx.ellipse(435,395,42,56,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(595,395,42,56,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(448,374,10,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(608,374,10,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#2d170d';ctx.lineWidth=8;ctx.beginPath();ctx.arc(515,492,100,.18*Math.PI,.82*Math.PI);ctx.stroke();
  ctx.strokeStyle='#74401b';ctx.lineWidth=30;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(438,730);ctx.lineTo(418,845);ctx.stroke();ctx.beginPath();ctx.moveTo(588,730);ctx.lineTo(620,845);ctx.stroke();
  drawShoe(350,840,shoe || '#248bff',false);drawShoe(560,840,shoe || '#248bff',true);ctx.restore();
}

function drawShoe(x,y,color,flip){
  ctx.save();if(flip){ctx.translate(x+150,0);ctx.scale(-1,1);x=0;}
  ctx.fillStyle=color;round(x,y,152,66,30);ctx.fill();ctx.fillStyle='#f7f2e8';round(x+5,y+38,158,30,16);ctx.fill();ctx.restore();
}

function drawShirt(color,logo){
  ctx.save();ctx.fillStyle=color || '#f7f2e8';round(365,545,300,175,34);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=5;ctx.stroke();
  ctx.fillStyle = color === '#f7f2e8' ? '#111116' : '#fff';ctx.font='900 56px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(logo || 'BT',515,632);ctx.restore();
}

function drawGlasses(style){
  ctx.save();
  if(style === 'visor'){
    const g = ctx.createLinearGradient(330,370,700,430);g.addColorStop(0,'#f2b84b');g.addColorStop(.45,'#ff5b8a');g.addColorStop(1,'#8cecff');
    ctx.fillStyle=g;round(330,348,375,112,42);ctx.fill();ctx.strokeStyle='#111116';ctx.lineWidth=10;ctx.stroke();
  }else if(style === 'round'){
    ctx.strokeStyle='#8cecff';ctx.lineWidth=14;ctx.beginPath();ctx.arc(435,398,58,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(595,398,58,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(493,398);ctx.lineTo(537,398);ctx.stroke();
  }else if(style === 'laser'){
    ctx.strokeStyle='#ff345f';ctx.lineWidth=16;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(342,390);ctx.lineTo(484,412);ctx.stroke();ctx.beginPath();ctx.moveTo(548,412);ctx.lineTo(690,390);ctx.stroke();
  }else{
    ctx.fillStyle='#050507';round(352,360,150,84,26);ctx.fill();round(528,360,150,84,26);ctx.fill();ctx.strokeStyle='#050507';ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(502,396);ctx.lineTo(528,396);ctx.stroke();
  }
  ctx.restore();
}

function drawHand(style){
  ctx.save();
  if(style === 'coin'){ctx.fillStyle='#f2b84b';ctx.beginPath();ctx.arc(248,560,72,0,Math.PI*2);ctx.fill();ctx.fillStyle='#161616';ctx.font='900 34px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('SOL',248,562);}
  else if(style === 'flag'){ctx.strokeStyle='#74401b';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(250,370);ctx.lineTo(250,645);ctx.stroke();ctx.fillStyle='#ff5b8a';ctx.beginPath();ctx.moveTo(260,370);ctx.lineTo(430,420);ctx.lineTo(260,472);ctx.closePath();ctx.fill();}
  else if(style === 'diamond'){ctx.fillStyle='#8cecff';ctx.beginPath();ctx.moveTo(285,510);ctx.lineTo(358,565);ctx.lineTo(285,650);ctx.lineTo(212,565);ctx.closePath();ctx.fill();}
  else{ctx.strokeStyle='#8a4d22';ctx.lineWidth=48;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(200,315);ctx.lineTo(122,612);ctx.stroke();}
  ctx.restore();
}

function drawHat(style){
  ctx.save();
  if(style === 'halo'){ctx.strokeStyle='#f2b84b';ctx.lineWidth=18;ctx.shadowColor='#f2b84b';ctx.shadowBlur=24;ctx.beginPath();ctx.ellipse(515,170,176,34,0,0,Math.PI*2);ctx.stroke();}
  else if(style === 'crown'){ctx.fillStyle='#f2b84b';ctx.beginPath();ctx.moveTo(355,245);ctx.lineTo(390,130);ctx.lineTo(468,222);ctx.lineTo(520,120);ctx.lineTo(572,222);ctx.lineTo(650,130);ctx.lineTo(682,245);ctx.closePath();ctx.fill();}
  else if(style === 'viking'){ctx.fillStyle='#d3d7dc';ctx.beginPath();ctx.ellipse(517,235,205,82,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#f7f2e8';ctx.beginPath();ctx.ellipse(315,200,80,35,-.42,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(720,200,80,35,.42,0,Math.PI*2);ctx.fill();}
  else if(style === 'cap'){ctx.fillStyle='#171735';round(360,180,320,90,38);ctx.fill();ctx.beginPath();ctx.ellipse(642,257,145,34,.08,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8cecff';ctx.font='900 48px Arial';ctx.textAlign='center';ctx.fillText('S',520,245);}
  else{ctx.fillStyle='#413a54';round(345,150,350,122,54);ctx.fill();ctx.fillStyle='#8cecff';round(338,228,365,52,20);ctx.fill();}
  ctx.restore();
}

async function downloadPfp(){
  await drawPfp();
  canvas.toBlob(blob => {
    if(!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'BabyT-PFP.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },'image/png');
}

async function copyText(value,button,label){
  try{await navigator.clipboard.writeText(value);button.textContent='Copied';}
  catch(error){button.textContent='Copy failed';}
  setTimeout(() => button.textContent = label, 1200);
}

initLinks();
renderControls();
drawPfp();

document.getElementById('randomBtn').addEventListener('click',randomize);
document.getElementById('resetBtn').addEventListener('click',reset);
document.getElementById('downloadBtn').addEventListener('click',downloadPfp);
document.getElementById('copyCaBtn').addEventListener('click',event => copyText(CONTRACT_ADDRESS,event.currentTarget,'Copy'));
document.getElementById('copyCaBtn2').addEventListener('click',event => copyText(CONTRACT_ADDRESS,event.currentTarget,'Copy CA'));
