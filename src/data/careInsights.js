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
  { residentId: "teresa", signal: "più iniziativa", count: 5, of: 7, usual: 3, trend: "in aumento", positive: true, note: "5 conversazioni avviate da lei su 7, di solito 3" },
  { residentId: "elena", signal: "serenità", count: 5, of: 6, usual: 4, trend: "stabile", positive: true },
  { residentId: "elena", signal: "gratitudine", count: 3, of: 6, usual: 1, trend: "in aumento", positive: true },
  { residentId: "lucia", signal: "buonumore", count: 4, of: 6, usual: 4, trend: "stabile", positive: true },
  { residentId: "carlo", signal: "buonumore", count: 3, of: 4, usual: 3, trend: "stabile", positive: true },
  { residentId: "antonio", signal: "conversazioni più lunghe", count: 5, of: 5, usual: 10, trend: "in aumento", positive: true, note: "15 minuti in media, di solito 10" },
  { residentId: "mario", signal: "tranquillità", count: 3, of: 3, usual: 2, trend: "in aumento", positive: true },
  { residentId: "ada", signal: "curiosità", count: 4, of: 6, usual: null, trend: "prime settimane", positive: true },
  { residentId: "bruno", signal: "voglia di raccontare", count: 4, of: 5, usual: 2, trend: "in aumento", positive: true },
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
  { topic: "Rumore notturno", text: "fastidio per il rumore notturno", count: 4, period: "ultime 2 settimane", tone: "negativo", action: "Valutarlo con il personale notturno" },
  { topic: "Attività musicali", text: "apprezzamento per le attività musicali del pomeriggio", count: 6, period: "ultime 2 settimane", tone: "positivo", action: "Da mantenere, magari con un appuntamento in più" },
  { topic: "Pasti", text: "desiderio di più varietà nei pasti serali", count: 3, period: "ultime 2 settimane", tone: "neutro", action: "Proporlo alla cucina" },
  { topic: "Gentilezza del personale", text: "apprezzamento per la gentilezza del personale", count: 5, period: "ultime 2 settimane", tone: "positivo", action: "Da condividere con tutto lo staff" },
  { topic: "Spazi esterni", text: "desiderio di passare più tempo all'aperto", count: 5, period: "ultime 2 settimane", tone: "neutro", action: "Più uscite in giardino quando il tempo lo permette" },
];

// Come relazionarsi: indicazioni pratiche. Interessi solo per categoria, con la fonte.
export const relating = {
  elena: { address: "Lei · «signora Elena»", bestTime: "mattino e dalle 16:00", duration: "15–20 minuti", works: ["Musica italiana", "Fotografie come avvio", "Domande aperte"], avoid: "Dopo le 14 preferisce riposare: non proporre attività", interests: [["Musica italiana", "Biografia d'ingresso"], ["Giardinaggio", "Biografia d'ingresso"], ["Viaggi", "Biografia d'ingresso"], ["Insegnamento", "Biografia d'ingresso"]] },
  carlo: { address: "Tu · «Carlo»", bestTime: "mattino, in sala lettura", duration: "brevi, 5–10 minuti", works: ["Sport", "Giornale del mattino", "Domande concrete"], avoid: "Evitare domande sui sentimenti: preferisce argomenti pratici", interests: [["Calcio", "Biografia d'ingresso"], ["Giornali", "Biografia d'ingresso"], ["Orto", "Emerso con ROSS"]] },
  lucia: { address: "Tu · «Lucia»", bestTime: "primo pomeriggio", duration: "20 minuti", works: ["Giochi di parole", "Piccoli gruppi", "Cucina"], avoid: "Non interromperla quando racconta: chiede lei di cambiare", interests: [["Cucina", "Biografia d'ingresso"], ["Giochi di parole", "Emerso con ROSS"], ["Teatro", "Biografia d'ingresso"]] },
  mario: { address: "Lei · «signor Rossi»", bestTime: "dopo le 17:00", duration: "lunghe, con pause", works: ["Domande tecniche", "Lavori manuali", "Tempi distesi"], avoid: "Rispettare la modalità silenziosa nel primo pomeriggio", interests: [["Montagna", "Biografia d'ingresso"], ["Falegnameria", "Biografia d'ingresso"]] },
  teresa: { address: "Tu · «Teresa»", bestTime: "pomeriggio, in gruppo", duration: "20–25 minuti", works: ["Canto di gruppo", "Fiori di stagione", "Insegnare agli altri"], avoid: "Nessuna indicazione particolare", interests: [["Canto corale", "Biografia d'ingresso"], ["Fiori", "Biografia d'ingresso"], ["Lavoro a maglia", "Emerso con ROSS"]] },
  antonio: { address: "Lei · «signor Greco»", bestTime: "pomeriggio, con la radio", duration: "10–15 minuti", works: ["Radio", "Automobili", "Scacchi"], avoid: "All'inizio risposte brevi: lasciargli tempo", interests: [["Radio", "Biografia d'ingresso"], ["Automobili", "Biografia d'ingresso"], ["Scacchi", "Emerso con ROSS"]] },
  ada: { address: "Lei · «signora Ada»", bestTime: "mattino", duration: "brevi, 5–10 minuti", works: ["Poesia", "Cucito"], avoid: "ROSS la sta ancora conoscendo: indicazioni provvisorie", interests: [["Poesia", "Biografia d'ingresso"], ["Cucito", "Biografia d'ingresso"]] },
  bruno: { address: "Tu · «Bruno»", bestTime: "dopo la quiete pomeridiana", duration: "15 minuti", works: ["Chiedergli di spiegare", "Treni", "Carte"], avoid: "Non proporre attività nel primo pomeriggio", interests: [["Treni", "Biografia d'ingresso"], ["Storia locale", "Emerso con ROSS"], ["Giochi di carte", "Biografia d'ingresso"]] },
};

// Guida "Come avvicinarsi": primo approccio, stile di ROSS, momenti della giornata e spunti per interesse.
// `detail` solo per gli interessi dalla biografia d'ingresso (famiglia o struttura), mai da ciò che l'ospite racconta a ROSS.
// `engagement`: durata media delle conversazioni partite da quell'interesse rispetto alla media della persona (%), e partecipazione alta X volte su Y.
export const approachGuide = {
  elena: {
    firstSteps: ["Salutala come «signora Elena», al mattino o dopo le 16", "Parti dalla musica italiana o da una fotografia", "Fai domande aperte e lasciala raccontare: di solito prosegue da sola"],
    style: { pace: "Normale", sentences: "Normali", questions: "Aperte", pauses: "Brevi" },
    rhythm: { mattino: 3, pomeriggio: 1, sera: 3 },
    hooks: {
      "Musica italiana": { lever: "Nostalgia, piacere di cantare", detail: "Ascoltava i cantautori italiani degli anni '60 e '70", opener: "«Che canzone le piaceva ballare?»", activity: "Ascolto musicale al mattino, anche in piccolo gruppo", engagement: { duration: 45, high: [5, 6] } },
      Giardinaggio: { lever: "Cura, stare all'aperto", detail: "Curava un giardino dietro casa", opener: "«Mi aiuta a capire come curare questa pianta?»", activity: "Passeggiata verso le aiuole o travaso di piante", engagement: { duration: 25, high: [3, 4] } },
      Viaggi: { lever: "Curiosità, ricordare luoghi", detail: "Ha viaggiato molto in Italia", opener: "«Qual è il posto più bello che ha visto?»", activity: "Guardare insieme cartoline o foto di città italiane", engagement: { duration: 30, high: [4, 5] } },
      Insegnamento: { lever: "Sentirsi utile, spiegare", detail: "È stata maestra elementare per molti anni", opener: "«Come spiegherebbe questa cosa ai suoi alunni?»", activity: "Chiederle di aiutare un altro ospite in un'attività", engagement: { duration: 15, high: [2, 3] } },
    },
  },
  carlo: {
    firstSteps: ["Dagli del tu e chiamalo «Carlo», al mattino", "Parti dal giornale o dall'ultima partita", "Tieni la conversazione breve e concreta: evita domande sui sentimenti"],
    style: { pace: "Normale", sentences: "Brevi", questions: "Concrete", pauses: "Brevi" },
    rhythm: { mattino: 3, pomeriggio: 2, sera: 1 },
    hooks: {
      Calcio: { lever: "Competizione, commentare", detail: "Tifoso di calcio da sempre, seguiva le partite alla radio", opener: "«Hai visto com'è finita ieri?»", activity: "Guardare insieme la sintesi di una partita", engagement: { duration: 60, high: [4, 5] } },
      Giornali: { lever: "Restare informato, avere un'opinione", detail: "Leggeva il quotidiano ogni mattina", opener: "«Cosa dice oggi il giornale?»", activity: "Lettura del giornale in sala lettura", engagement: { duration: 20, high: [3, 5] } },
      Orto: { lever: "Fare con le mani, vedere crescere", opener: "Chiedergli un consiglio su cosa piantare", activity: "Coinvolgerlo nell'orto della struttura", engagement: { duration: 35, high: [2, 3] } },
    },
  },
  lucia: {
    firstSteps: ["Chiamala «Lucia», nel primo pomeriggio", "Proponi un gioco di parole o parla di cucina", "Non interromperla quando racconta: sarà lei a cambiare argomento"],
    style: { pace: "Normale", sentences: "Normali", questions: "Aperte", pauses: "Brevi" },
    rhythm: { mattino: 2, pomeriggio: 3, sera: 1 },
    hooks: {
      Cucina: { lever: "Sentirsi competente, condividere", detail: "Cucinava per tutta la famiglia la domenica", opener: "«Come si fa un buon ragù?»", activity: "Laboratorio di cucina o preparare la tavola", engagement: { duration: 40, high: [4, 5] } },
      "Giochi di parole": { lever: "Sfida, divertimento", opener: "Proporle un indovinello o una parola da indovinare", activity: "Giochi di parole in piccolo gruppo", engagement: { duration: 55, high: [5, 6] } },
      Teatro: { lever: "Espressività, stare in compagnia", detail: "Ha fatto parte di una compagnia teatrale amatoriale", opener: "«Le piacerebbe leggere una scena insieme?»", activity: "Lettura ad alta voce o piccola recita", engagement: { duration: 20, high: [2, 3] } },
    },
  },
  mario: {
    firstSteps: ["Rivolgiti con il «lei» e chiamalo «signor Rossi», dopo le 17", "Parti da una domanda tecnica o da un lavoro manuale", "Prenditi tempo: parla lentamente e con pause"],
    style: { pace: "Lento", sentences: "Normali", questions: "Concrete", pauses: "Lunghe" },
    rhythm: { mattino: 1, pomeriggio: 1, sera: 3 },
    hooks: {
      Montagna: { lever: "Libertà, fatica condivisa", detail: "Andava in montagna ogni estate", opener: "«Com'era salire in quota la mattina presto?»", activity: "Guardare insieme foto di montagna o un documentario", engagement: { duration: 35, high: [3, 4] } },
      Falegnameria: { lever: "Manualità, precisione", detail: "Ha lavorato come falegname", opener: "Chiedergli come si ripara un piccolo oggetto di legno", activity: "Laboratorio manuale con legno o piccole riparazioni", engagement: { duration: 50, high: [3, 3] } },
    },
  },
  teresa: {
    firstSteps: ["Chiamala «Teresa», nel pomeriggio", "Invitala a cantare o proponi un'attività di gruppo", "Chiedile di insegnare qualcosa agli altri: la coinvolge"],
    style: { pace: "Normale", sentences: "Normali", questions: "Aperte", pauses: "Brevi" },
    rhythm: { mattino: 2, pomeriggio: 3, sera: 2 },
    hooks: {
      "Canto corale": { lever: "Stare insieme, esprimersi", detail: "Ha cantato per anni in un coro", opener: "«Mi insegna una canzone?»", activity: "Canto di gruppo nel pomeriggio", engagement: { duration: 50, high: [6, 7] } },
      Fiori: { lever: "Bellezza, cura", detail: "Coltivava fiori sul balcone", opener: "«Che fiori metterebbe in questo vaso?»", activity: "Composizione di fiori di stagione", engagement: { duration: 25, high: [4, 5] } },
      "Lavoro a maglia": { lever: "Concentrazione, fare per gli altri", opener: "Portarle gomitoli e ferri e chiederle un consiglio", activity: "Laboratorio di maglia in compagnia", engagement: { duration: 30, high: [3, 4] } },
    },
  },
  antonio: {
    firstSteps: ["Salutalo come «signor Greco», nel pomeriggio", "Parti dalla radio o dalle automobili", "Se all'inizio risponde a monosillabi, lasciagli tempo: poi si apre"],
    style: { pace: "Lento", sentences: "Brevi", questions: "Concrete", pauses: "Lunghe" },
    rhythm: { mattino: 1, pomeriggio: 3, sera: 2 },
    hooks: {
      Automobili: { lever: "Nostalgia, competenza tecnica", detail: "Seguiva le corse di rally; ha avuto una Lancia d'epoca", opener: "«Che macchina guidava da giovane?»", activity: "Sfogliare insieme una rivista di auto d'epoca", engagement: { duration: 40, high: [4, 5] } },
      Radio: { lever: "Manualità, curiosità", detail: "Da ragazzo smontava e rimontava le radio", opener: "«Come funziona una radio a valvole?»", activity: "Ascoltare insieme la radio del pomeriggio, lasciandogli scegliere la stazione", engagement: { duration: 30, high: [3, 4] } },
      Scacchi: { lever: "Sfida, allenare la mente", opener: "Proporgli una partita nel pomeriggio", activity: "Partita a scacchi con un altro ospite o con lo staff", engagement: { duration: 60, high: [4, 5] } },
    },
  },
  ada: {
    firstSteps: ["Rivolgiti con il «lei», «signora Ada», al mattino", "Proponi una poesia breve o un lavoro di cucito", "Conversazioni brevi: è arrivata da poco, meglio non insistere"],
    style: { pace: "Lento", sentences: "Brevi", questions: "Concrete", pauses: "Lunghe" },
    rhythm: { mattino: 3, pomeriggio: 1, sera: 1 },
    hooks: {
      Poesia: { lever: "Bellezza delle parole, calma", detail: "Conosce a memoria molte poesie studiate a scuola", opener: "«Mi legge una poesia che le piace?»", activity: "Attività di lettura, come ha chiesto", engagement: null },
      Cucito: { lever: "Precisione, fare con le mani", detail: "Cuciva abiti per la famiglia", opener: "Chiederle un consiglio su un orlo o un bottone", activity: "Piccoli lavori di cucito", engagement: null },
    },
  },
  bruno: {
    firstSteps: ["Chiamalo «Bruno», dopo la quiete pomeridiana", "Chiedigli di spiegarti qualcosa: treni o storia del paese", "Lascia che guidi lui la conversazione"],
    style: { pace: "Normale", sentences: "Normali", questions: "Aperte", pauses: "Lunghe" },
    rhythm: { mattino: 2, pomeriggio: 2, sera: 3 },
    hooks: {
      Treni: { lever: "Competenza, spiegare", detail: "Ha lavorato per molti anni nelle ferrovie", opener: "«Come si organizzava un orario dei treni?»", activity: "Guardare insieme foto o video di treni storici", engagement: { duration: 45, high: [3, 4] } },
      "Storia locale": { lever: "Memoria del territorio, raccontare", opener: "Chiedergli com'era il paese una volta", activity: "Incontro sulla storia locale con altri ospiti", engagement: { duration: 35, high: [3, 4] } },
      "Giochi di carte": { lever: "Compagnia, strategia", detail: "Giocava a carte al bar ogni domenica", opener: "Proporgli una partita a scopa", activity: "Torneo di carte nel pomeriggio", engagement: { duration: 20, high: [2, 4] } },
    },
  },
};

// Interessi con i relativi spunti, ordinati da quello che coinvolge di più.
export function hooksFor(residentId, { withJourney = false } = {}) {
  const guide = approachGuide[residentId]?.hooks || {};
  const list = (relating[residentId]?.interests || []).map(([label, source]) => ({ label, source, ...(guide[label] || {}) }));
  if (withJourney && residentId === journeyInterest.residentId) list.push({ label: journeyInterest.label, source: "Emerso con ROSS", isNew: true, lever: "Ricordare attraverso le immagini", opener: journeyInterest.how, activity: "Guardare insieme delle fotografie", engagement: { duration: 50, high: [1, 1] } });
  return list
    .map((h) => (h.source === "Emerso con ROSS" ? { ...h, detail: undefined } : h))
    .sort((a, b) => (b.engagement?.duration ?? -1) - (a.engagement?.duration ?? -1));
}

// Presenza e continuità: assenza di interazione insolita (F12), momenti di difficoltà (F8).
export const presenceNotes = [
  { residentId: "antonio", kind: "assenza", text: "Oggi non ha ancora parlato con ROSS; di solito entro le 11 sì." },
  { residentId: "lucia", kind: "difficoltà", text: "In 2 conversazioni questa settimana ha fatto fatica a seguire il filo (di solito mai). ROSS ha rallentato e semplificato." },
];

// "Teresa (serenità, più iniziativa), Elena (gratitudine)": segnali raggruppati per ospite.
export const groupByResident = (list, nameOf) => Object.entries(list.reduce((acc, x) => { (acc[x.residentId] = acc[x.residentId] || []).push(x.signal); return acc; }, {})).map(([id, items]) => `${nameOf(id)} (${items.join(", ")})`).join(", ");
export const signalsFor = (id) => signals.filter((s) => s.residentId === id);
export const needsFor = (id) => needs.filter((n) => n.residentId === id);
export const presenceFor = (id) => presenceNotes.filter((p) => p.residentId === id);

// Motivi di attenzione per ospite, in ordine: presenza insolita, segnali da osservare, bisogni.
export function attentionFor(residentId) {
  return [
    ...presenceFor(residentId).map((p) => ({ tone: "watch", text: p.kind === "assenza" ? "Oggi non ha ancora parlato con ROSS" : "Momenti di difficoltà" })),
    ...signalsFor(residentId).filter((s) => !s.positive).map((s) => ({ tone: "watch", text: `${s.signal.charAt(0).toUpperCase()}${s.signal.slice(1)} · ${s.trend}` })),
    ...needsFor(residentId).map((n) => ({ tone: "need", text: n.text })),
  ];
}

// Prima l'assenza insolita di oggi, poi i segnali da osservare, poi i bisogni.
export function attentionScore(residentId) {
  const attention = attentionFor(residentId);
  return (presenceFor(residentId).some((p) => p.kind === "assenza") ? 10 : 0) + attention.filter((x) => x.tone === "watch").length * 2 + attention.length;
}
export const byAttention = (residents) => [...residents].sort((a, b) => attentionScore(b.id) - attentionScore(a.id));

// Partecipazione rispetto alla media della persona: mai valori assoluti, mai confronti tra ospiti.
export function trendOf(resident) {
  if (resident.participation == null) return { tone: "building", label: "ROSS la sta ancora conoscendo" };
  if (resident.delta >= 0.3) return { tone: "up", label: "sopra la sua media" };
  if (resident.delta <= -0.3) return { tone: "down", label: "sotto la sua media" };
  return { tone: "flat", label: "in linea con la sua media" };
}

// Interesse emerso dalla conversazione con ROSS nella vista demo (al posto del ricordo specifico).
export const journeyInterest = { residentId: "elena", label: "Fotografia", how: "Funziona come avvio di conversazione: proporle di guardare insieme delle fotografie." };

// Testo breve del confronto con la media: "3 su 6 · di solito 1", la nota, oppure "prime settimane".
export const signalDetail = (s) => s.note || (s.usual == null ? `In ${s.count} conversazioni su ${s.of} · prime settimane con ROSS` : `In ${s.count} conversazioni su ${s.of} · di solito ${s.usual}`);

export const describeSignal = (s, name) => s.positive
  ? s.note ? `${name}: ${s.signal}, ${s.note}.` : s.usual == null ? `${name} ha espresso ${s.signal} in ${s.count} conversazioni su ${s.of} (prime settimane con ROSS).` : `${name} ha espresso ${s.signal} in ${s.count} conversazioni su ${s.of} questa settimana (di solito ${s.usual}).`
  : s.note
    ? `${name}: ${s.signal}, ${s.note}. Da osservare di persona.`
    : `${name} ha espresso ${s.signal} in ${s.count} conversazioni su ${s.of} questa settimana (di solito ${s.usual}). Da osservare di persona.`;
