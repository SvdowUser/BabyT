const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const copyBtn = document.getElementById('copyBtn');
const contractText = document.getElementById('contractText');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    document.body.classList.toggle('menu-open');
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      document.body.classList.remove('menu-open');
    });
  });
}

if (copyBtn && contractText) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(contractText.textContent.trim());
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Copied';
      setTimeout(() => {
        copyBtn.textContent = original;
      }, 1400);
    } catch (error) {
      copyBtn.textContent = 'Failed';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 1400);
    }
  });
}
