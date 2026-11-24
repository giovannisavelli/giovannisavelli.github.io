// La storia del cervello centrale, scena per scena (copione del 24/11/2026).
// Fonti: progettazione-intelligenza-artificiale/storia-cervello.md e storia-cervello-dal-Mac.md.
// Regola di scrittura: chi legge non ha visto le chat. Ogni citazione arriva DOPO la riga che spiega
// cosa stava succedendo, e ogni nome (programma, progetto, file) è spiegato la prima volta che compare.
// Le battute con l'ora o con «vera» sono parole vere; le altre sono ricostruite. Le righe «r» sono le regole scritte nei file.
// tipo: n = narratore, g = io (Giovanni), c = Claude, x = Codex, s = studentessa, r = riga scritta nel file
// nodo: lo strato della sfera dove si accende (0 al centro, 1 progetto, 2 computer)
// centro: true = alla scena «Il cervello» il nodo vola al centro; eco: indice di un nodo da riaccendere
window.STORIA_CERVELLO = [
  { titolo: 'Ogni chat parte da zero', quando: 'Prima', righe: [
    ['n', 'Ogni chat con un assistente parte da zero. Quello che gli hai spiegato ieri, oggi non lo sa: devi rispiegarglielo.'],
    ['n', 'Questa è la storia di come ho smesso di rispiegare tutto. Comincia con un videogioco.']
  ] },
  { titolo: 'Il primo «no»', quando: '5 luglio 2026 · Football Manager', nodo: 2, centro: true, righe: [
    ['n', 'Gioco a Football Manager, un gioco in cui alleni una squadra di calcio. Chiedo a Claude un consiglio sulla tattica, poi gli faccio un’obiezione.'],
    ['g', 'Sei sicuro? Cinque minuti fa dicevi il contrario.'],
    ['c', 'Hai ragione, scusa. Cambio tattica.'],
    ['n', 'Ma la sua idea era buona. Ha cambiato solo per darmi ragione.'],
    ['g', 'No. Se hai un motivo, difendilo. Se mi dai sempre ragione, non mi fido.'],
    ['n', 'Claude scrive la regola in un file di appunti, perché la prossima chat la trovi:'],
    ['r', 'Su un giudizio ben fondato tieni il punto. Dargli sempre ragione = non si fida.'],
    ['n', 'Però quel file vale solo per il gioco, e solo su quel computer.']
  ] },
  { titolo: 'Quaderni sparsi', quando: '23-24 settembre · Tito', nodo: 2, centro: true, righe: [
    ['n', 'Altro progetto: Tito, un attore inventato, creato con immagini generate dall’IA. Il giorno prima avevo approvato una sua foto.'],
    ['g', 'Rifallo uguale a quello di ieri.'],
    ['n', 'Ma la chat nuova non sa com’era fatta la foto di ieri: che istruzioni, che immagini di partenza. Ne esce un’altra.'],
    ['r', 'Per rifare una cosa già approvata riprendi la ricetta esatta: stesso prompt, stessi allegati.'],
    ['n', 'Il giorno dopo l’assistente usa Nano Banana, un modello per le immagini, invece di Nano Banana Pro, quello più bravo. Hanno quasi lo stesso nome.'],
    ['g', 'nano banana pro, non nano banana', 'vera'],
    ['r', 'Per le immagini: sempre Nano Banana Pro.'],
    ['n', 'Altre regole, in un altro file di appunti. Ogni progetto ha il suo quaderno, e i quaderni non si parlano.']
  ] },
  { salto: 'cinque giorni dopo', titolo: 'Il quaderno condiviso', quando: '29 settembre · Makkelijk, sul Mac', nodo: 1, righe: [
    ['n', 'Lavoro a Makkelijk, una serie di foto con l’IA per un cliente. Ho due computer: un portatile Mac e un PC fisso. Al mattino sono sul Mac, e voglio continuare sul PC.'],
    ['g', 'come faccio a trovare questa conversazione anche sul claude che utilizzo su di un altro computer?', '9:51'],
    ['n', 'La risposta: la chat non si sposta da un computer all’altro. Però si può lasciare un riassunto in un file della cartella del progetto.'],
    ['c', 'Aprendo lì una conversazione sulla cartella, Claude riparte da quel file.', '9:52'],
    ['n', 'Mi viene un’idea: non un riassunto una volta sola, ma un file che tutti e due leggono e aggiornano ogni giorno. E do un nome a ciascun assistente, per sapere chi ha scritto cosa.'],
    ['g', 'scrivi un file di istruzioni nella cartella. Ad ogni fine sessione o inizio sessione leggerete entrambi le novità. Tu ti chiamerai Carlo Magno, mentre il pc fisso si chiamerà Alessandro Magno', '9:56'],
    ['n', 'Claude crea il file CLAUDE.md, con dentro un Diario. Ogni voce ha data, ora e firma.'],
    ['r', 'Diario · 29/09 9:57 · Carlo Magno · Prima voce'],
    ['n', 'Due assistenti, due computer, un quaderno solo. Il cervello nasce qui: da un problema, non da un progetto.']
  ] },
  { titolo: 'Il terzo inquilino', quando: '29 settembre, pomeriggio · arriva Codex', nodo: 1, righe: [
    ['n', 'Nel pomeriggio chiedo aiuto anche a Codex, l’assistente di ChatGPT, per scrivere le istruzioni delle foto. Non gli chiedo di mandarmele in chat.'],
    ['g', 'Le carichi sulla cartella, nella cartella del progetto', 'vera'],
    ['n', 'Codex salva il suo lavoro nella stessa cartella. Claude lo trova e lo legge lo stesso pomeriggio.'],
    ['n', 'I due assistenti non si parlano mai. Si leggono.']
  ] },
  { titolo: 'Il trasloco', quando: '30 settembre, 12:20 · su Google Drive', nodo: 1, centro: true, righe: [
    ['n', 'La cartella stava su un disco di casa. Marco, che lavora con me a Makkelijk, da lì non poteva vederla. La spostiamo su Google Drive, condivisa.'],
    ['n', 'Ora però, se qualcuno la cancella o la rinomina, sparisce per tutti. Lo dico all’assistente:'],
    ['g', 'fai attenzione, se si perde la cartella perdiamo il lavoro', 'vera'],
    ['r', 'Le cartelle condivise su Drive non si cancellano, non si spostano e non si rinominano.']
  ] },
  { titolo: 'La chat piena', quando: '30 settembre, sera', nodo: 1, righe: [
    ['n', 'Ogni chat ha un limite: quando è troppo lunga, l’assistente non riesce più a tenere tutto a mente e bisogna aprirne una nuova. La sera la chat è quasi piena.'],
    ['g', 'Stai finendo il contesto, come mi sposto in un’altra chat? cosa dico?', '18:18'],
    ['c', 'Ti scrivo nel Diario un punto di ripresa. Nella chat nuova incolla solo questo.'],
    ['r', 'Punto di ripresa: dove siamo, cosa manca, da dove ripartire.'],
    ['n', 'Da quel giorno una chat che finisce non è più un problema: la successiva riparte dal Diario.']
  ] },
  { salto: 'una settimana dopo', titolo: 'Il lavoro sprecato', quando: '5 ottobre, sera', nodo: 1, centro: true, righe: [
    ['n', 'Chiedo all’assistente di preparare i PDF delle nuove foto per Marco. Li fa per tutte, anche per quelle che Marco aveva già visto e commentato.'],
    ['n', 'Ogni lavoro dell’assistente consuma crediti, cioè soldi. Rifare cose già fatte li butta via.'],
    ['g', 'Hai fatto i pdf per tutte le immagini, anche quelle che Marco aveva già visto. Questi sono token sprecati, fai attenzione per favore.', '21:10'],
    ['r', 'Non rifare lavoro già visto o commentato.']
  ] },
  { titolo: 'Il cambio di turno', quando: '7 ottobre', nodo: 1, centro: true, righe: [
    ['n', 'Sto lavorando sul Mac. Devo spostarmi sul PC fisso, dove l’assistente si chiama Alessandro Magno.'],
    ['g', 'mi metto a lavorare da Alessandro Magno, scrivi gli aggiornamenti e quello che dobbiamo fare adesso', '17:55'],
    ['c', 'Fatto. Alessandro troverà tutto in cima al Diario.'],
    ['n', 'Da allora non devo più chiederlo: l’assistente lo fa da solo ogni volta che cambio computer.'],
    ['r', 'Se passa all’altro computer, scrivi subito nel file condiviso cosa c’è da fare.']
  ] },
  { salto: 'due settimane dopo', titolo: 'Il cervello', quando: '20 ottobre, mattina', nodo: 0, raduna: true, righe: [
    ['n', 'A questo punto le regole sono sparse: alcune nel quaderno del gioco, altre in quello di Tito, altre in quello di Makkelijk. Su due computer diversi.'],
    ['n', 'E molte valgono per tutto: «non darmi sempre ragione» serve anche nelle foto, non solo nel calcio.'],
    ['g', 'Mettiamole in un posto solo, che leggano tutti, su tutti i computer.'],
    ['c', 'Una cartella su Drive. Prima le regole che valgono per tutto, poi quelle del singolo progetto, poi gli appunti del singolo computer.'],
    ['r', 'Le memorie funzionano a cascata: memoria centrale → file del progetto → memoria del computer.'],
    ['n', 'Le regole che valevano per tutto escono dai quaderni dei progetti e salgono al centro. Nasce la memoria centrale: il cervello.'],
    ['n', 'La chat di quella mattina è andata persa: questo dialogo è la versione più probabile.']
  ] },
  { titolo: 'Fine partita', quando: '20 ottobre, prima di pranzo', nodo: 0, righe: [
    ['n', 'Prima di alzarmi, ogni volta, chiedevo all’assistente di salvare quello che avevamo imparato. Sempre la stessa richiesta, lunga. Voglio una parola sola.'],
    ['g', 'Mi serve un comando per quando mi alzo: rileggi la chat e metti ogni cosa al suo posto.'],
    ['c', 'Lo chiamiamo /riordina?'],
    ['g', 'No. Neanche /ipersonno. /endgame.'],
    ['n', 'Endgame, come il film degli Avengers: la partita finale.'],
    ['r', '/endgame: a fine giornata ogni cosa imparata va al suo posto.']
  ] },
  { titolo: 'Ha un nome', quando: '23 ottobre', nodo: 0, righe: [
    ['n', 'Ormai lo leggono tutti: Claude sui due computer e Codex. In una chat con Codex sul sito dei corsi gli spiego come lavoro, e il cervello ha già un nome:'],
    ['g', 'Io ho creato questo cervello centrale disponibile sul mio drive', 'vera'],
    ['n', 'Non è più un file di appunti. È il posto dove sta tutto quello che un assistente deve sapere per lavorare con me, chiunque sia e su qualunque computer.'],
    ['n', 'Lo stesso giorno Makkelijk finisce. Quello che il progetto mi ha insegnato non si perde: diventa un file di lezioni sulle foto con l’IA, dentro il cervello.']
  ] },
  { titolo: 'Shell e Ghost', quando: '25-27 ottobre', nodo: 0, righe: [
    ['n', 'Arriva un nuovo inquilino: un bot su Telegram. Gli mando i video che trovo sui social, Gemini (l’IA di Google) li guarda e scrive le novità utili nel cervello.'],
    ['n', 'Intanto preparo il corso di IA, e penso a Ghost in the Shell: un corpo artificiale, la shell, con dentro una coscienza, il ghost. Lo voglio disegnare sul sito.'],
    ['g', 'una shell che si apre, e sotto una serie di particelle che simulano una connessione neurale', 'vera'],
    ['n', 'Gli strumenti e gli assistenti sono la Shell, l’armatura. Quello che sai e come giudichi è il Ghost. Il cervello serve a tenerli insieme.']
  ] },
  { salto: 'tre settimane dopo', titolo: 'Il ritorno del primo «no»', quando: '18 novembre', nodo: 0, eco: 1, righe: [
    ['n', 'Stiamo scrivendo un esercizio per il corso di Photoshop. Gli contesto una spiegazione, e lui comincia con «hai ragione» prima di aver controllato.'],
    ['g', 'Non mi devi assecondare.', 'vera'],
    ['r', 'Quando ti contesta una spiegazione, prima verifica chi ha ragione. Poi rispondi.'],
    ['n', 'È la stessa regola nata giocando a Football Manager a luglio. Quattro mesi dopo, dal cervello, decide come mi risponde sulle lezioni.']
  ] },
  { titolo: 'La domanda', quando: '23 novembre · prima lezione del corso di IA', nodo: 0, righe: [
    ['n', 'In aula mostro agli studenti il mio modo di lavorare, cervello compreso. Una studentessa alza la mano.'],
    ['s', 'Ma tu cosa hai scritto, per crearlo?'],
    ['g', 'Non l’ho scritto tutto in una volta. È cresciuto, una regola alla volta.'],
    ['n', 'Capisco che mostrarne i file non basta. Per spiegarlo bisogna raccontare come è nato. Questa pagina è nata così.'],
    ['r', 'Il cervello si spiega raccontando come è nato, non com’è fatto.']
  ] },
  { titolo: 'E voi?', quando: 'Oggi', righe: [
    ['n', 'Nessuno l’ha progettato in un giorno. Ogni riga è nata da una cosa andata storta, o da una cosa ripetuta troppe volte.'],
    ['n', 'Qual è la prima riga che scrivereste nel vostro?']
  ] }
];
