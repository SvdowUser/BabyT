const contractAddress = document.body.dataset.contractAddress || '';
const copyButton = document.getElementById('copyCaBtn');
const copyValue = document.getElementById('caValue');
const copyToast = document.getElementById('copyToast');
const year = document.getElementById('year');
const header = document.getElementById('siteHeader');

if (copyValue) copyValue.textContent = contractAddress;
if (year) year.textContent = new Date().getFullYear();

const updateHeader = () => {
  if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

async function copyText(value) {
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

if (copyButton) {
  const label = copyButton.querySelector('[data-copy-label]');

  copyButton.addEventListener('click', async () => {
    try {
      await copyText(contractAddress);
      copyButton.classList.add('is-copied');
      if (label) label.textContent = 'Copied';
      if (copyToast) copyToast.classList.add('is-visible');

      window.setTimeout(() => {
        copyButton.classList.remove('is-copied');
        if (label) label.textContent = 'Copy';
        if (copyToast) copyToast.classList.remove('is-visible');
      }, 1600);
    } catch {
      if (label) label.textContent = 'Try again';
    }
  });
}
