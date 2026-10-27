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
