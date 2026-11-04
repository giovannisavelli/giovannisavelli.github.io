// Clic su una foto: si apre ingrandita. Con le frecce ← → (o i pulsanti, o scorrendo col dito)
// si passa alla foto prima o dopo. Si chiude con la ×, con Esc o cliccando fuori.
(function () {
  const zoom = document.getElementById('zoom');
  if (!zoom || !zoom.showModal) return;
  const img = zoom.querySelector('img');
  const conta = zoom.querySelector('.zoom-conta');
  const foto = [...document.querySelectorAll('figure img, .sf-corpo > img')];
  let qui = 0;

  function mostra(i) {
    qui = (i + foto.length) % foto.length;
    img.src = foto[qui].currentSrc || foto[qui].src;
    img.alt = foto[qui].alt;
    if (conta) conta.textContent = `${qui + 1} / ${foto.length}`;
  }

  foto.forEach((f, i) => f.addEventListener('click', () => { mostra(i); zoom.showModal(); }));
  zoom.querySelector('.zoom-prima').addEventListener('click', e => { e.stopPropagation(); mostra(qui - 1); });
  zoom.querySelector('.zoom-dopo').addEventListener('click', e => { e.stopPropagation(); mostra(qui + 1); });
  zoom.querySelector('.zoom-chiudi').addEventListener('click', () => zoom.close());
  zoom.addEventListener('click', e => { if (e.target === zoom) zoom.close(); });
  document.addEventListener('keydown', e => {
    if (!zoom.open) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); mostra(qui - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); mostra(qui + 1); }
  });

  let inizioX = null;
  zoom.addEventListener('touchstart', e => { inizioX = e.touches[0].clientX; }, { passive: true });
  zoom.addEventListener('touchend', e => {
    if (inizioX === null) return;
    const dx = e.changedTouches[0].clientX - inizioX;
    if (Math.abs(dx) > 50) mostra(qui + (dx < 0 ? 1 : -1));
    inizioX = null;
  });
})();
