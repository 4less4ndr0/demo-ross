// Insight per la struttura secondo docs/contratto-informativo-struttura.md.
// Regola d'oro: come sta e di cosa ha bisogno l'ospite, mai di cosa ha parlato.

// I cinque punti cardinali: mostrati nella sidebar ("Cosa ti dice ROSS"); ognuno fa una domanda alla chat.
export const cardinalPoints = [
  { id: "benessere", label: "Benessere nel tempo", hint: "Segnali espressi nella settimana, rispetto alla media della persona", question: "Chi ha espresso segnali da osservare questa settimana?" },
  { id: "relazione", label: "Come relazionarsi", hint: "Momenti, attività e interessi che funzionano", question: "Come posso coinvolgere Carlo?" },
  { id: "bisogni", label: "Bisogni personali", hint: "Ciò che gli ospiti chiedono per sé", question: "Quali bisogni hanno espresso gli ospiti?" },
  { id: "voce", label: "Voce della struttura", hint: "Opinioni sulla vita in struttura, anonime e aggregate", question: "Cosa dicono gli ospiti della vita in struttura?" },
  { id: "presenza", label: "Presenza e continuità", hint: "Chi ha parlato con ROSS, quanto e come è andata", question: "Come stanno usando ROSS gli ospiti?" },
];

// Segnali espressi negli ultimi 7 giorni: tipo, conteggio "X conversazioni su Y", media personale. Mai l'oggetto.
export const signals = [
  { residentId: "lucia", signal: "stanchezza", count: 3, of: 6, usual: 1, trend: "in aumento" },
  { residentId: "carlo", signal: "meno iniziativa", count: 2, of: 4, usual: 5, trend: "in calo", note: "2 conversazioni avviate contro una media di 5" },
  { residentId: "antonio", signal: "solitudine", count: 3, of: 5, usual: 1, trend: "in aumento" },
  { residentId: "mario", signal: "fastidio fisico riferito", count: 2, of: 3, usual: 0, trend: "nuovo" },
  { residentId: "teresa", signal: "serenità", count: 6, of: 7, usual: 4, trend: "in aumento", positive: true },
  { residentId: "elena", signal: "serenità", count: 5, of: 6, usual: 4, trend: "stabile", positive: true },
];

// Bisogni personali, per ospite, formulati come bisogno e senza contesto narrativo.
export const needs = [
  { residentId: "lucia", text: "Desiderio di uscire in giardino", times: 3 },
  { residentId: "antonio", text: "Desiderio di sentire un familiare", times: 2 },
  { residentId: "mario", text: "Fastidio al ginocchio riferito al mattino", times: 2 },
  { residentId: "bruno", text: "Sente freddo nel pomeriggio in stanza", times: 2 },
  { residentId: "ada", text: "Vorrebbe partecipare all'attività di lettura", times: 1 },
];

// Voce della struttura: solo aggregata e anonima, almeno 3 ospiti.
export const facilityVoice = [
  { topic: "Rumore notturno", text: "fastidio per il rumore notturno", count: 4, period: "ultime 2 settimane", tone: "negativo" },
  { topic: "Attività musicali", text: "apprezzamento per le attività musicali del pomeriggio", count: 6, period: "ultime 2 settimane", tone: "positivo" },
  { topic: "Pasti", text: "desiderio di più varietà nei pasti serali", count: 3, period: "ultime 2 settimane", tone: "neutro" },
  { topic: "Spazi esterni", text: "desiderio di passare più tempo all'aperto", count: 5, period: "ultime 2 settimane", tone: "neutro" },
];

// Come relazionarsi: indicazioni pratiche. Interessi solo per categoria, con la fonte.
export const relating = {
  elena: { address: "Lei · «signora Elena»", bestTime: "mattino e dalle 16:00", duration: "15–20 minuti", works: ["Musica italiana", "Fotografie come avvio", "Domande aperte"], avoid: "Dopo le 14 preferisce riposare: non proporre attività", interests: [["Musica italiana", "Biografia d'ingresso"], ["Giardinaggio", "Biografia d'ingresso"], ["Viaggi", "Biografia d'ingresso"], ["Insegnamento", "Biografia d'ingresso"]] },
  carlo: { address: "Tu · «Carlo»", bestTime: "mattino, in sala lettura", duration: "brevi, 5–10 minuti", works: ["Sport", "Giornale del mattino", "Domande concrete"], avoid: "Evitare domande sui sentimenti: preferisce argomenti pratici", interests: [["Calcio", "Biografia d'ingresso"], ["Giornali", "Biografia d'ingresso"], ["Orto", "Emerso con ROSS"]] },
  lucia: { address: "Tu · «Lucia»", bestTime: "primo pomeriggio", duration: "20 minuti", works: ["Giochi di parole", "Piccoli gruppi", "Cucina"], avoid: "Non interromperla quando racconta: chiede lei di cambiare", interests: [["Cucina", "Biografia d'ingresso"], ["Giochi di parole", "Emerso con ROSS"], ["Teatro", "Biografia d'ingresso"]] },
  mario: { address: "Lei · «signor Rossi»", bestTime: "dopo le 17:00", duration: "lunghe, con pause", works: ["Domande tecniche", "Lavori manuali", "Tempi distesi"], avoid: "Rispettare la modalità silenziosa nel primo pomeriggio", interests: [["Montagna", "Biografia d'ingresso"], ["Falegnameria", "Biografia d'ingresso"]] },
  teresa: { address: "Tu · «Teresa»", bestTime: "pomeriggio, in gruppo", duration: "20–25 minuti", works: ["Canto di gruppo", "Fiori di stagione", "Insegnare agli altri"], avoid: "Nessuna indicazione particolare", interests: [["Canto corale", "Biografia d'ingresso"], ["Fiori", "Biografia d'ingresso"], ["Lavoro a maglia", "Emerso con ROSS"]] },
  antonio: { address: "Lei · «signor Greco»", bestTime: "pomeriggio, con la radio", duration: "10–15 minuti", works: ["Radio", "Automobili", "Scacchi"], avoid: "All'inizio risposte brevi: lasciargli tempo", interests: [["Radio", "Biografia d'ingresso"], ["Automobili", "Biografia d'ingresso"], ["Scacchi", "Emerso con ROSS"]] },
  ada: { address: "Lei · «signora Ada»", bestTime: "mattino", duration: "brevi, 5–10 minuti", works: ["Poesia", "Cucito"], avoid: "Baseline in costruzione: indicazioni ancora provvisorie", interests: [["Poesia", "Biografia d'ingresso"], ["Cucito", "Biografia d'ingresso"]] },
  bruno: { address: "Tu · «Bruno»", bestTime: "dopo la quiete pomeridiana", duration: "15 minuti", works: ["Chiedergli di spiegare", "Treni", "Carte"], avoid: "Non proporre attività nel primo pomeriggio", interests: [["Treni", "Biografia d'ingresso"], ["Storia locale", "Emerso con ROSS"], ["Giochi di carte", "Biografia d'ingresso"]] },
};

// Presenza e continuità: assenza di interazione insolita (F12), momenti di difficoltà (F8).
export const presenceNotes = [
  { residentId: "antonio", kind: "assenza", text: "Oggi non ha ancora parlato con ROSS; di solito entro le 11 sì." },
  { residentId: "lucia", kind: "difficoltà", text: "Momenti di disorientamento in 2 conversazioni questa settimana (di solito nessuno). ROSS ha rallentato e semplificato." },
];

export const signalsFor = (id) => signals.filter((s) => s.residentId === id);
export const needsFor = (id) => needs.filter((n) => n.residentId === id);
export const presenceFor = (id) => presenceNotes.filter((p) => p.residentId === id);

// Interesse emerso dalla conversazione con ROSS nella vista demo (al posto del ricordo specifico).
export const journeyInterest = { residentId: "elena", label: "Fotografia", how: "Funziona come avvio di conversazione: proporle di guardare insieme delle fotografie." };

export const describeSignal = (s, name) => s.positive
  ? `${name} ha espresso ${s.signal} in ${s.count} conversazioni su ${s.of} questa settimana (di solito ${s.usual}).`
  : s.note
    ? `${name}: ${s.signal}, ${s.note}. Da osservare di persona.`
    : `${name} ha espresso ${s.signal} in ${s.count} conversazioni su ${s.of} questa settimana (di solito ${s.usual}). Da osservare di persona.`;
