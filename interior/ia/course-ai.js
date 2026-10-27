const calendariIA = {
  '3A': {
    orario: '14:00–18:00',
    date: [
      ['2026-12-03', 'Giovedì 3 dicembre 2026'],
      ['2026-12-10', 'Giovedì 10 dicembre 2026'],
      ['2026-12-17', 'Giovedì 17 dicembre 2026'],
      ['2027-01-14', 'Giovedì 14 gennaio 2027'],
      ['2027-01-21', 'Giovedì 21 gennaio 2027']
    ]
  },
  '3B': {
    orario: '09:00–13:00',
    date: [
      ['2026-12-03', 'Giovedì 3 dicembre 2026'],
      ['2026-12-10', 'Giovedì 10 dicembre 2026'],
      ['2026-12-17', 'Giovedì 17 dicembre 2026'],
      ['2027-01-14', 'Giovedì 14 gennaio 2027'],
      ['2027-01-21', 'Giovedì 21 gennaio 2027']
    ]
  },
  '3C': {
    orario: '14:00–18:00',
    date: [
      ['2026-11-23', 'Lunedì 23 novembre 2026'],
      ['2026-11-30', 'Lunedì 30 novembre 2026'],
      ['2026-12-21', 'Lunedì 21 dicembre 2026'],
      ['2027-01-11', 'Lunedì 11 gennaio 2027'],
      ['2027-01-25', 'Lunedì 25 gennaio 2027']
    ]
  }
};

const elencoIA = document.getElementById('calendar-list');
const pulsantiClassiIA = [...document.querySelectorAll('.class-switch button[data-class]')];

function mostraCalendarioIA(nomeClasse) {
  const calendario = calendariIA[nomeClasse];
  if (!calendario || !elencoIA) return;

  pulsantiClassiIA.forEach(pulsante => {
    pulsante.setAttribute('aria-pressed', String(pulsante.dataset.class === nomeClasse));
  });

  elencoIA.replaceChildren(...calendario.date.map(([iso, etichetta], indice) => {
    const riga = document.createElement('li');
    const numero = document.createElement('span');
    const data = document.createElement('time');
    const orario = document.createElement('span');
    numero.className = 'number';
    numero.textContent = String(indice + 1).padStart(2, '0');
    data.dateTime = iso;
    data.textContent = etichetta;
    orario.className = 'hours';
    orario.textContent = calendario.orario;
    riga.append(numero, data, orario);
    return riga;
  }));
  elencoIA.setAttribute('aria-label', `Date delle lezioni della classe INT ${nomeClasse}`);
}

pulsantiClassiIA.forEach(pulsante => {
  pulsante.addEventListener('click', () => mostraCalendarioIA(pulsante.dataset.class));
});
mostraCalendarioIA('3A');

// Stessa struttura delle schede di Photoshop: un indirizzo per sezione,
// ritorno del browser funzionante e pulsanti utilizzabili da tastiera.
const schedeIA = {
  'tab-programma': 'programma',
  'tab-archivio': 'archivio',
  'tab-appunti': 'appunti',
  'tab-calendario': 'calendario',
  'tab-strumenti': 'strumenti'
};
const aliasSchedeIA = {
  'vibe-coding': 'tab-strumenti',
  'metodo': 'tab-programma'
};
const pulsantiSchedeIA = [...document.querySelectorAll('.course-tab')];
const navigazioneIA = document.getElementById('sezioni-corso');

function apriSchedaIA(id, aggiornaIndirizzo = false) {
  if (!schedeIA[id]) return;
  pulsantiSchedeIA.forEach(pulsante => {
    const attivo = pulsante.dataset.tab === id;
    pulsante.setAttribute('aria-selected', String(attivo));
    pulsante.tabIndex = attivo ? 0 : -1;
  });
  document.querySelectorAll('.mobile-actions a[data-course-tab]').forEach(link => {
    if (link.dataset.courseTab === id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  Object.keys(schedeIA).forEach(nome => {
    document.getElementById(nome).hidden = nome !== id;
  });
  if (aggiornaIndirizzo && location.hash !== `#${schedeIA[id]}`) {
    history.pushState(null, '', `#${schedeIA[id]}`);
  }
  document.dispatchEvent(new CustomEvent('course:sectionchange'));
}

function schedaDaHashIA() {
  const nome = decodeURIComponent(location.hash.slice(1));
  const id = Object.keys(schedeIA).find(scheda => schedeIA[scheda] === nome)
    || aliasSchedeIA[nome] || 'tab-programma';
  apriSchedaIA(id);
  if (nome) {
    requestAnimationFrame(() => {
      const destinazione = nome === 'vibe-coding' || nome === 'metodo'
        ? document.getElementById(nome) : navigazioneIA;
      destinazione?.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
  }
}

pulsantiSchedeIA.forEach((pulsante, indice) => {
  pulsante.addEventListener('click', () => {
    apriSchedaIA(pulsante.dataset.tab, true);
    navigazioneIA.scrollIntoView({
      block: 'start',
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  });
  pulsante.addEventListener('keydown', evento => {
    let successivo;
    if (evento.key === 'ArrowRight') successivo = (indice + 1) % pulsantiSchedeIA.length;
    else if (evento.key === 'ArrowLeft') successivo = (indice - 1 + pulsantiSchedeIA.length) % pulsantiSchedeIA.length;
    else if (evento.key === 'Home') successivo = 0;
    else if (evento.key === 'End') successivo = pulsantiSchedeIA.length - 1;
    else return;
    evento.preventDefault();
    pulsantiSchedeIA[successivo].focus({ preventScroll: true });
    pulsantiSchedeIA[successivo].click();
  });
});

document.addEventListener('click', evento => {
  if (evento.defaultPrevented || evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
  const link = evento.target.closest('a[href^="#"]');
  if (!link) return;
  const nome = link.getAttribute('href').slice(1);
  if (!Object.values(schedeIA).includes(nome) && !aliasSchedeIA[nome]) return;
  evento.preventDefault();
  if (location.hash !== `#${nome}`) history.pushState(null, '', `#${nome}`);
  schedaDaHashIA();
});
window.addEventListener('popstate', schedaDaHashIA);
window.addEventListener('hashchange', schedaDaHashIA);
schedaDaHashIA();
