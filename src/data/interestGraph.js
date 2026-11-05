// Struttura 2.0 · la mappa di ciò che lega ogni ospite alla vita della residenza.
// Al centro la persona; attorno i suoi interessi (per categoria, dalla biografia o emersi con ROSS);
// fuori le attività, i ricordi, gli eventi e le persone collegati a ciascun interesse, con come è andato lo spunto.
// È un supporto per proporre meglio, non una misura: niente punteggi, nessuna classifica.
// `status`: "volentieri" (è piaciuto) · "pensa" (ci sta pensando) · "no" (non è piaciuto, o non era il momento) · "prova" (da provare).
// `person`: id di un altro ospite che condivide la stessa passione (solo la categoria, mai di cosa hanno parlato).
export const interestGraph = {
  elena: {
    interests: [
      { label: "Musica italiana", links: [
        { label: "Il coro dei bambini", kind: "evento", status: "volentieri" },
        { label: "Le canzoni di Mina", kind: "ricordo", status: "volentieri" },
        { label: "Teresa, che canta nel coro", kind: "persona", person: "teresa", status: "pensa" },
      ] },
      { label: "Piante e giardino", links: [
        { label: "I vasi del terrazzo", kind: "attivita", status: "volentieri" },
        { label: "Un momento in giardino", kind: "attivita", status: "prova" },
      ] },
      { label: "Fotografie di viaggio", links: [
        { label: "Le sue foto al laboratorio creativo", kind: "attivita", status: "prova" },
      ] },
    ],
    other: [{ label: "Ginnastica dolce", kind: "attivita", status: "no" }],
  },
  ada: {
    interests: [
      { label: "Poesia", links: [
        { label: "Il gruppo di lettura", kind: "attivita", status: "volentieri" },
        { label: "Lettura di poesie in biblioteca", kind: "attivita", status: "prova" },
      ] },
      { label: "Cucito", links: [
        { label: "Il laboratorio di cucito", kind: "attivita", status: "prova" },
        { label: "Teresa, che fa la maglia", kind: "persona", person: "teresa", status: "prova" },
      ] },
      { label: "Il silenzio del mattino", links: [
        { label: "Un caffè in salotto, presto", kind: "attivita", status: "prova" },
      ] },
    ],
    other: [{ label: "La tombola in salone", kind: "evento", status: "no" }],
  },
  antonio: {
    interests: [
      { label: "Radio", links: [
        { label: "La partita alla radio", kind: "evento", status: "volentieri" },
        { label: "La radio in compagnia", kind: "attivita", status: "prova" },
        { label: "Bruno, che ama spiegare i treni", kind: "persona", person: "bruno", status: "prova" },
      ] },
      { label: "Scacchi", links: [
        { label: "Il torneo di scacchi", kind: "attivita", status: "pensa" },
      ] },
      { label: "Automobili", links: [
        { label: "L'incontro sulle auto d'epoca", kind: "evento", status: "prova" },
      ] },
    ],
    other: [{ label: "Il laboratorio di pittura", kind: "attivita", status: "no" }],
  },
  bruno: {
    interests: [
      { label: "Treni", links: [
        { label: "Gli anni in ferrovia", kind: "ricordo", status: "volentieri" },
        { label: "Antonio, che ama la radio e la tecnica", kind: "persona", person: "antonio", status: "prova" },
      ] },
      { label: "Carte", links: [
        { label: "Il gruppo di carte", kind: "attivita", status: "pensa" },
      ] },
      { label: "Storia del paese", links: [
        { label: "L'incontro sulla storia locale", kind: "evento", status: "prova" },
      ] },
    ],
    other: [],
  },
  carlo: {
    interests: [
      { label: "Calcio", links: [{ label: "La partita del sabato", kind: "evento", status: "prova" }] },
      { label: "Giornali", links: [{ label: "Il giornale del mattino", kind: "attivita", status: "prova" }] },
      { label: "Orto", links: [
        { label: "L'orto della residenza", kind: "attivita", status: "prova" },
        { label: "Mario, che lavora il legno", kind: "persona", person: "mario", status: "prova" },
      ] },
    ],
    other: [],
  },
  lucia: {
    interests: [
      { label: "Cucina", links: [{ label: "Le ricette della domenica", kind: "ricordo", status: "prova" }] },
      { label: "Giochi di parole", links: [{ label: "Il gioco delle parole in salotto", kind: "attivita", status: "prova" }] },
      { label: "Stare all'aperto", links: [{ label: "Un quarto d'ora in giardino", kind: "attivita", status: "prova" }] },
    ],
    other: [],
  },
  mario: {
    interests: [
      { label: "Montagna", links: [{ label: "Le sue fotografie di montagna", kind: "ricordo", status: "prova" }] },
      { label: "Legno", links: [{ label: "Il laboratorio del legno", kind: "attivita", status: "prova" }] },
      { label: "Passeggiate", links: [{ label: "Una passeggiata dopo le 17", kind: "attivita", status: "prova" }] },
    ],
    other: [],
  },
  teresa: {
    interests: [
      { label: "Coro", links: [
        { label: "Si canta insieme", kind: "attivita", status: "volentieri" },
        { label: "Elena, che ama la musica italiana", kind: "persona", person: "elena", status: "prova" },
      ] },
      { label: "Fiori", links: [{ label: "Il laboratorio dei gerani", kind: "attivita", status: "prova" }] },
      { label: "Maglia", links: [{ label: "Ada, che cuce da sempre", kind: "persona", person: "ada", status: "prova" }] },
    ],
    other: [],
  },
};

export const graphStatus = {
  volentieri: { label: "È piaciuto", color: "var(--green)" },
  pensa: { label: "Ci sta pensando", color: "#c79a3c" },
  no: { label: "Non è piaciuto", color: "#b9b3a8" },
  prova: { label: "Da provare", color: "var(--accent)" },
};
export const graphKind = { attivita: "Attività", ricordo: "Ricordo", evento: "Evento", persona: "Persona" };

// La rete delle passioni (Struttura 2.0, nel canale): gli ospiti uniti da passioni in comune, per categoria.
// Serve a vedere chi potrebbe fare qualcosa insieme. Mai le relazioni o ciò che si sono raccontati:
// solo interessi dichiarati (biografia d'ingresso) o emersi con ROSS, detti come categoria.
// `via`: l'interesse di ciascuno che lo lega alla passione. `idea`: l'occasione, da mandare come spunto a tutti.
export const passions = [
  { id: "mani", label: "Lavori con le mani", members: [["ada", "cucito"], ["teresa", "maglia"], ["mario", "legno"]],
    idea: "Giovedì pomeriggio, in salotto, un'ora di lavori a mano insieme: chi cuce, chi fa la maglia, chi intaglia." },
  { id: "verde", label: "Piante e aria aperta", members: [["elena", "piante e giardino"], ["teresa", "fiori"], ["carlo", "orto"], ["lucia", "stare all'aperto"]],
    idea: "Domani mattina, se c'è il sole, si rinvasano i gerani in giardino: c'è posto per tutti." },
  { id: "musica", label: "Musica e canto", members: [["elena", "musica italiana"], ["teresa", "coro"], ["antonio", "radio"]],
    idea: "Oggi alle 17:30 in salone si canta insieme: si può proporre una canzone." },
  { id: "tecnica", label: "Come funzionano le cose", members: [["antonio", "radio e automobili"], ["bruno", "treni"]],
    idea: "Un pomeriggio in sala comune tra radio e ferrovie: ognuno spiega la sua passione all'altro." },
  { id: "parole", label: "Parole e letture", members: [["ada", "poesia"], ["lucia", "giochi di parole"], ["carlo", "giornali"]],
    idea: "Domani alle 10:30 in biblioteca si legge ad alta voce: poesie, giornale e qualche gioco di parole." },
  { id: "giochi", label: "Carte e scacchi", members: [["antonio", "scacchi"], ["bruno", "carte"]],
    idea: "Sabato mattina un tavolo per carte e scacchi in salotto, dopo il riposo." },
  { id: "storie", label: "Storie e luoghi di una volta", members: [["bruno", "storia del paese"], ["mario", "montagna"], ["elena", "fotografie di viaggio"]],
    idea: "All'incontro sulla storia locale ognuno porta un luogo che ama: una foto, un racconto, una cartina." },
];
