const CONTRACT_ADDRESS = document.body.dataset.contractAddress || '';

const setText = (id, value) => {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
};

const setHref = (id, value) => {
  const element = document.getElementById(id);
  if (element) element.href = value;
};

function setPageDetails() {
  setText('caValue', CONTRACT_ADDRESS);
  setText('tokenCaValue', CONTRACT_ADDRESS);
  setText('year', new Date().getFullYear());
  setHref('dexLink', `https://dexscreener.com/solana/${CONTRACT_ADDRESS}`);
  setHref('pumpLink', `https://pump.fun/coin/${CONTRACT_ADDRESS}`);
}

function setHeaderState() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 16);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

async function writeClipboard(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

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

function setCopyButton(button) {
  const label = button.querySelector('[data-copy-label]');
  if (!label) return;

  const defaultLabel = label.textContent;
  button.addEventListener('click', async () => {
    try {
      await writeClipboard(CONTRACT_ADDRESS);
      label.textContent = 'Copied';
      button.classList.add('is-copied');
    } catch {
      label.textContent = 'Try again';
    }

    window.setTimeout(() => {
      label.textContent = defaultLabel;
      button.classList.remove('is-copied');
    }, 1400);
  });
}

function init() {
  setPageDetails();
  setHeaderState();
  document.querySelectorAll('#copyCaBtn, #tokenCopyBtn').forEach(setCopyButton);
}

init();
