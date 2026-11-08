// Struttura · le passioni: una sola fonte per i due grafi, con punti di vista diversi.
// - Canale, «La rete delle passioni · tutta la residenza»: solo le passioni condivise da almeno 2 ospiti,
//   per vedere chi potrebbe fare qualcosa insieme; l'azione è collettiva.
// - Ritratto, «Le passioni di …»: solo gli interessi di quella persona e le sue occasioni, colorate dall'esito
//   dei suoi spunti (dai momenti); gli altri ospiti compaiono solo come «con chi la condivide»; l'azione è individuale.
// Sempre per categoria (dalla biografia d'ingresso o emerse con ROSS): mai relazioni o ciò che si sono raccontati.

// `members`: [id dell'ospite, come la vive lui o lei]. `idea`: l'occasione da proporre a tutti.
export const passions = [
  { id: "mani", label: "Lavori con le mani", members: [["ada", "cucito"], ["teresa", "maglia"], ["mario", "legno"]],
    idea: "Giovedì pomeriggio, in salotto, un'ora di lavori a mano insieme: chi cuce, chi fa la maglia, chi intaglia." },
  { id: "verde", label: "Piante e aria aperta", members: [["elena", "piante e giardino"], ["teresa", "fiori"], ["carlo", "orto"], ["lucia", "stare all'aperto"], ["mario", "passeggiate"]],
    idea: "Domani mattina, se c'è il sole, si rinvasano i gerani in giardino: c'è posto per tutti." },
  { id: "musica", label: "Musica e canto", members: [["elena", "musica italiana"], ["teresa", "coro"], ["antonio", "radio"]],
    idea: "Oggi alle 17:30 in salone si canta insieme: si può proporre una canzone." },
  { id: "tecnica", label: "Come funzionano le cose", members: [["antonio", "automobili"], ["bruno", "treni"]],
    idea: "Un pomeriggio in sala comune tra motori e ferrovie: ognuno spiega la sua passione all'altro." },
  { id: "parole", label: "Parole e letture", members: [["ada", "poesia"], ["lucia", "giochi di parole"], ["carlo", "giornali"]],
    idea: "Domani alle 10:30 in biblioteca si legge ad alta voce: poesie, giornale e qualche gioco di parole." },
  { id: "giochi", label: "Carte e scacchi", members: [["antonio", "scacchi"], ["bruno", "carte"]],
    idea: "Sabato mattina un tavolo per carte e scacchi in salotto, dopo il riposo." },
  { id: "storie", label: "Storie e luoghi di una volta", members: [["bruno", "storia del paese"], ["mario", "montagna"], ["elena", "fotografie di viaggio"]],
    idea: "All'incontro sulla storia locale ognuno porta un luogo che ama: una foto, un racconto, una cartina." },
  // Passioni di una sola persona: compaiono solo nel suo ritratto, non nella rete della residenza.
  { id: "calcio", label: "Calcio", members: [["carlo", "calcio"]], idea: "" },
  { id: "cucina", label: "Cucina", members: [["lucia", "cucina"]], idea: "" },
  { id: "quiete", label: "Momenti tranquilli", members: [["ada", "il silenzio del mattino"]], idea: "" },
];
export const passion = (id) => passions.find((p) => p.id === id);
export const sharedPassions = passions.filter((p) => p.members.length >= 2);
export const passionsOf = (residentId) => passions.filter((p) => p.members.some(([id]) => id === residentId));
export const viaOf = (p, residentId) => p.members.find(([id]) => id === residentId)?.[1];

// Le occasioni di ciascuno, per passione. `momento`: il momento (spunto) che ne dice l'esito; senza, è «da provare».
// Uno spunto inviato con lo stesso testo dell'occasione ne prende l'esito.
export const personalLinks = {
  elena: {
    musica: [{ label: "Il coro dei bambini", kind: "evento", momento: "ins-elena-coro" }, { label: "Le canzoni di Mina", kind: "ricordo", momento: "h-elena-mina" }],
    verde: [{ label: "Il suo orto a Treviso", kind: "ricordo", momento: "ins-elena-piante" }, { label: "Un momento in giardino", kind: "attivita" }],
    storie: [{ label: "Le sue foto al laboratorio creativo", kind: "attivita" }],
  },
  ada: {
    parole: [{ label: "Il gruppo di lettura", kind: "attivita", momento: "h-ada-lettura" }, { label: "Lettura di poesie in biblioteca", kind: "attivita" }],
    mani: [{ label: "Il laboratorio di cucito", kind: "attivita" }],
    quiete: [{ label: "Un caffè in salotto, presto", kind: "attivita" }],
  },
  antonio: {
    musica: [{ label: "La partita alla radio", kind: "evento", momento: "h-antonio-radio" }, { label: "La radio in compagnia", kind: "attivita" }],
    giochi: [{ label: "Il torneo di scacchi", kind: "attivita", momento: "ins-antonio-scacchi" }],
    tecnica: [{ label: "L'incontro sulle auto d'epoca", kind: "evento" }],
  },
  bruno: {
    tecnica: [{ label: "Gli anni in ferrovia", kind: "ricordo", momento: "h-bruno-ferrovia" }],
    giochi: [{ label: "Il gruppo di carte", kind: "attivita", momento: "h-bruno-carte" }],
    storie: [{ label: "L'incontro sulla storia locale", kind: "evento" }],
  },
  carlo: {
    calcio: [{ label: "La partita del sabato", kind: "evento" }],
    parole: [{ label: "Il giornale del mattino", kind: "attivita" }],
    verde: [{ label: "L'orto della residenza", kind: "attivita" }],
  },
  lucia: {
    cucina: [{ label: "Le ricette della domenica", kind: "ricordo" }],
    parole: [{ label: "Il gioco delle parole in salotto", kind: "attivita" }],
    verde: [{ label: "Un quarto d'ora in giardino", kind: "attivita" }],
  },
  mario: {
    mani: [{ label: "Il laboratorio del legno", kind: "attivita" }],
    verde: [{ label: "Una passeggiata dopo le 17", kind: "attivita" }],
    storie: [{ label: "Le sue fotografie di montagna", kind: "ricordo" }],
  },
  teresa: {
    musica: [{ label: "Si canta insieme", kind: "attivita" }],
    verde: [{ label: "Il laboratorio dei gerani", kind: "attivita" }],
    mani: [{ label: "Un pomeriggio di maglia in salotto", kind: "attivita" }],
  },
};

// Proposte che non toccano i suoi interessi e non sono piaciute: si dicono sotto la mappa personale.
export const outsideLinks = {
  elena: [{ label: "Ginnastica dolce", momento: "h-elena-ginnastica" }],
  ada: [{ label: "La tombola in salone", momento: "h-ada-tombola" }],
  antonio: [{ label: "Il laboratorio di pittura", momento: "h-antonio-pittura" }],
};

// Dall'esito di uno spunto al colore della mappa personale.
export const graphStatus = {
  volentieri: { label: "È piaciuto", color: "var(--green)" },
  pensa: { label: "Ci sta pensando", color: "#c79a3c" },
  attesa: { label: "In attesa", color: "var(--lilac)" },
  no: { label: "Non è piaciuto", color: "#b9b3a8" },
  prova: { label: "Da provare", color: "var(--accent)" },
};
export const statusFromEsito = (esito) => ({ accolto: "volentieri", pensa: "pensa", attesa: "attesa", no: "no", non_ora: "no" }[esito] || "prova");
export const graphKind = { attivita: "Attività", ricordo: "Ricordo", evento: "Evento", persona: "Persona" };
