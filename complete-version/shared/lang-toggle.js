// Shared language-toggle + PNG-export helpers used by both boards/board.html
// and classes/class_cards/baseline.html, so the two generators don't each
// carry their own copy of this boilerplate.

// Wires up every [data-lang-btn] button: clicking one marks it active,
// sets <html lang>, and calls onChangeLang(lang) so the page can re-render.
function initLangToggle(onChangeLang) {
  const buttons = document.querySelectorAll('[data-lang-btn]');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang-btn');
      buttons.forEach(b => b.classList.toggle('active', b === btn));
      document.documentElement.lang = lang;
      onChangeLang(lang);
    });
  });
}

// Captures the element `nodeId` to a PNG and triggers a download named by
// filenameFn() (called at click time so it can reflect the current language).
function downloadPng(nodeId, filenameFn) {
  const node = document.getElementById(nodeId);

  return htmlToImage.toPng(node, { quality: 1.0, pixelRatio: 2 })
    .then(function (dataUrl) {
      const link = document.createElement('a');
      link.download = filenameFn();
      link.href = dataUrl;
      link.click();
    })
    .catch(function (error) {
      console.error('Image capture failed:', error);
    });
}
