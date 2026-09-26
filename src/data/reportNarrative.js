import { DEMO_TODAY } from "./demoData";

// Profili narrativi curati per ogni ospite: descrivono solo ciò che emerge dalle conversazioni con ROSS.
const profiles = {
  elena: {
    headline: "Continuità positiva: musica e ricordi familiari tengono vive le conversazioni.",
    presence: "Elena arriva alle conversazioni con ROSS volentieri e spesso le apre lei, partendo da una fotografia o da una canzone. Racconta con ricchezza di dettagli quando il discorso parte da un luogo della sua storia.",
    themes: [["Sofia e la fotografia", 14], ["Viaggi in Sicilia", 9], ["Musica italiana (Mina)", 7], ["Il balcone con i gerani", 4]],
    quotes: ["A Palermo faceva molto caldo, ma la sera passeggiavamo vicino al mare.", "Sofia studia fotografia, mi manda sempre le foto."],
    works: ["Partire da una fotografia o da un luogo preciso", "Le canzoni di Mina nel primo pomeriggio", "Domande aperte su Sofia e Paolo"],
    watch: ["Dopo le 14 preferisce il riposo: meglio non proporre conversazioni", "Tende a stancarsi oltre i 25 minuti"],
    next: "Riprendere il racconto da Palermo collegandolo alle fotografie di Sofia.",
  },
  carlo: {
    headline: "Più riservato negli ultimi giorni, ma lo sport lo riporta nella conversazione.",
    presence: "Carlo di solito risponde a ROSS più che iniziare lui. Negli ultimi quattro giorni ha avviato meno conversazioni del solito e le risposte sono più brevi; quando si parla di calcio o del giornale del mattino la durata torna nella sua norma.",
    themes: [["Calcio e risultati della domenica", 8], ["Il giornale del mattino", 6], ["L'orto di casa", 4]],
    quotes: ["Il giornale lo leggo dalla fine, prima lo sport.", "I pomodori li legavo con le canne, come faceva mio padre."],
    works: ["Aprire con i risultati sportivi", "Conversazioni brevi, nella sala lettura", "Domande concrete, non sui sentimenti"],
    watch: ["Tre conversazioni avviate in meno rispetto alla sua media di 14 giorni: da osservare di persona", "Nessun altro cambiamento rilevato nelle interazioni con ROSS"],
    next: "Proporgli al mattino un commento sulla partita di domenica.",
  },
  lucia: {
    headline: "Vivace e propositiva: chiede lei di ripetere i giochi di parole.",
    presence: "Lucia è tra gli ospiti più presenti nelle conversazioni. Ama i giochi di parole e le categorie, e passa spesso dal gioco al racconto della cucina di famiglia e dei figli a Bologna.",
    themes: [["Cucina di famiglia", 7], ["Parole e categorie", 6], ["I figli a Bologna", 5], ["Teatro", 3]],
    quotes: ["Il ragù si comincia la mattina presto, non c'è fretta.", "Domani lo rifacciamo, quello delle categorie?"],
    works: ["Giochi di parole a inizio pomeriggio", "Chiederle una ricetta passo per passo", "Coinvolgerla in piccoli gruppi"],
    watch: ["Ha chiesto di ripetere domani l'attività sulle categorie (nota operatore)"],
    next: "Riproporre il gioco delle categorie e chiederle la ricetta del ragù.",
  },
  mario: {
    headline: "Ritmi lenti e rispettati: poche conversazioni, ma lunghe e distese.",
    presence: "Mario passa molte ore in modalità silenziosa e ROSS rispetta il suo riposo. Quando parla, lo fa senza fretta: racconta di montagna e di lavori in legno con precisione da artigiano.",
    themes: [["Montagna e sentieri", 5], ["Lavorare il legno", 4], ["Passeggiate", 3]],
    quotes: ["Il legno ti dice lui dove tagliare, basta ascoltarlo."],
    works: ["Conversazioni dopo le 17, a riposo concluso", "Domande tecniche sul legno", "Tempi lunghi tra una domanda e l'altra"],
    watch: ["Partecipazione leggermente sotto la sua media (−0.2), in linea con la modalità silenziosa"],
    next: "Chiedergli come si costruisce una cassetta per gli attrezzi.",
  },
  teresa: {
    headline: "Il momento migliore del mese: la musica di gruppo la accende.",
    presence: "Teresa è la più partecipe della struttura rispetto alla propria media. Canta volentieri, ricorda i testi del coro parrocchiale e coinvolge chi le sta vicino durante le attività musicali.",
    themes: [["Coro e canti popolari", 9], ["Fiori e giardino", 5], ["Lavori a maglia", 4]],
    quotes: ["Al coro stavo nei contralti, io la voce bassa ce l'avevo."],
    works: ["Musica di gruppo in salotto", "Chiederle di insegnare un canto", "Parlare dei fiori di stagione"],
    watch: ["Nessun segnale di variazione negativa nelle interazioni con ROSS"],
    next: "Invitarla a proporre un canto per l'attività musicale di gruppo.",
  },
  antonio: {
    headline: "Si sta aprendo: dalle risposte brevi ai primi racconti sul fratello.",
    presence: "Antonio è con ROSS da poco più di un mese. All'inizio rispondeva in modo essenziale; nelle ultime settimane ha iniziato a raccontare della radio, delle automobili e del fratello con cui giocava a scacchi.",
    themes: [["Radio e canzoni d'epoca", 5], ["Automobili", 4], ["Il fratello e gli scacchi", 3]],
    quotes: ["Con mio fratello la partita durava tutta la domenica."],
    works: ["Partire dalla radio del pomeriggio", "Domande sulle auto che ha guidato", "Proporgli una partita a scacchi"],
    watch: ["Baseline ancora giovane: le variazioni vanno lette con prudenza"],
    next: "Chiedergli qual era la prima auto che ha guidato.",
  },
  ada: {
    headline: "Primi passi con ROSS: la poesia è la porta d'ingresso.",
    presence: "Ada è con ROSS da 11 giorni, quindi non è ancora possibile un confronto con la sua media personale. Finora ha fatto conversazioni brevi, soprattutto sulla poesia; ha citato due volte la sua casa di Mantova.",
    themes: [["Poesia", 4], ["Cucito", 2], ["La casa di Mantova", 2]],
    quotes: ["Le poesie di scuola me le ricordo ancora tutte."],
    works: ["Chiederle una poesia che conosce a memoria", "Conversazioni al mattino"],
    watch: ["Baseline in costruzione: servono circa 14 giorni di interazioni"],
    next: "Chiederle di recitare la poesia che preferiva a scuola.",
  },
  bruno: {
    headline: "Stabile e riflessivo: treni e storia sono i suoi binari.",
    presence: "Bruno alterna periodi di quiete a conversazioni molto documentate. Parla volentieri di linee ferroviarie e di storia locale, e apprezza quando ROSS gli chiede di spiegare.",
    themes: [["Treni e ferrovie", 6], ["Storia locale", 4], ["Giochi di carte", 3]],
    quotes: ["La linea per Venezia l'ho fatta mille volte, conosco ogni stazione."],
    works: ["Chiedergli di spiegare, non solo di ricordare", "Conversazioni dopo la quiete pomeridiana"],
    watch: ["Partecipazione stabile, appena sotto la sua media (−0.1)"],
    next: "Chiedergli di descrivere il viaggio in treno che ricorda meglio.",
  },
};

const fallback = {
  headline: "Relazione con ROSS in costruzione.",
  presence: "Le interazioni con ROSS sono ancora poche per un racconto completo.",
  themes: [], quotes: [], works: [], watch: [], next: "Proseguire con conversazioni brevi sui suoi interessi.",
};

function cutoff(period) {
  const date = new Date(`${DEMO_TODAY}T10:00:00`);
  date.setDate(date.getDate() - Number(period) + 1);
  return date.toISOString().slice(0, 10);
}

function seriesFor(resident, days) {
  const seed = [...resident.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const base = (resident.participation ?? 6.5) * 10;
  const length = resident.participation == null ? Math.min(days, resident.daysWithRoss) : days;
  return Array.from({ length }, (_, index) => {
    const date = new Date(`${DEMO_TODAY}T10:00:00`);
    date.setDate(date.getDate() - (length - 1 - index));
    const wave = [0, 5, -3, 7, 2, -4, 6][(index + seed) % 7];
    const trend = (resident.delta ?? 0) * 10 * (index / Math.max(1, length - 1)) - (resident.delta ?? 0) * 5;
    return { date: date.toISOString().slice(5, 10), participation: Math.round((base + wave + trend) * 10) / 10, baseline: resident.participation == null ? null : Math.round((base - (resident.delta ?? 0) * 10) * 10) / 10 };
  });
}

export function buildResidentReport(state, resident, period) {
  const profile = profiles[resident.id] || fallback;
  const name = resident.name.split(" ")[0];
  const from = cutoff(period);
  const interactions = state.interactions.filter((i) => i.residentId === resident.id && i.date >= from);
  const minutes = interactions.reduce((sum, i) => sum + i.duration, 0);
  const memories = state.memories.filter((m) => m.residentId === resident.id);
  const pending = memories.filter((m) => m.status !== "Confermata");
  const building = resident.participation == null;
  const cameraConfirmed = resident.id === "elena" && memories.some((m) => m.id === "ross-cefalu-camera" && m.status === "Confermata");
  const cameraPending = resident.id === "elena" && !cameraConfirmed && memories.some((m) => m.id === "ross-cefalu-camera");

  const trend = building
    ? `La baseline personale di ${name} è ancora in costruzione: i numeri di questo report descrivono l'avvio, non un andamento.`
    : resident.delta >= 0.5 ? `Rispetto alla sua media personale ${name} è più partecipe del solito (${resident.delta > 0 ? "+" : ""}${resident.delta.toFixed(1)}): le conversazioni sono più frequenti e più lunghe.`
    : resident.delta > 0 ? `L'andamento è stabile, leggermente sopra la sua media personale (+${resident.delta.toFixed(1)}).`
    : resident.delta <= -0.3 ? `Rispetto alla sua media personale ${name} partecipa meno del solito (${resident.delta.toFixed(1)}). È un segnale da osservare di persona, non una valutazione.`
    : `L'andamento è stabile, in linea con la sua media personale (${resident.delta.toFixed(1)}).`;

  const headline = cameraConfirmed ? "Musica e fotografie hanno fatto emergere un nuovo dettaglio biografico, ora confermato." : profile.headline;
  const story = cameraConfirmed
    ? "Durante una conversazione su Cefalù Elena ha ricordato la piccola macchina fotografica rossa di Paolo. Il dettaglio è stato confermato, collegato al viaggio del 1998 e reso disponibile come spunto per le prossime conversazioni e per la famiglia."
    : cameraPending ? "Nell'ultima conversazione su Cefalù è emerso un possibile nuovo ricordo, la macchina fotografica rossa di Paolo, in attesa di verifica." : null;

  return {
    headline,
    paragraphs: [profile.presence, [trend, story].filter(Boolean).join(" ")],
    kpis: [
      [interactions.length, "conversazioni con ROSS"],
      [`${minutes} min`, "tempo insieme"],
      [interactions.length ? `${Math.round(minutes / interactions.length)} min` : "—", "durata media"],
      [building ? "—" : `${resident.participation.toFixed(1)}/10`, "partecipazione"],
      [building ? "in costruzione" : `${resident.delta >= 0 ? "+" : ""}${resident.delta.toFixed(1)}`, "vs sua media"],
      [memories.filter((m) => m.status === "Confermata").length, "ricordi confermati"],
    ],
    themes: cameraConfirmed ? [...profile.themes.slice(0, 3), ["Macchina fotografica di Paolo", "nuovo"]] : profile.themes,
    quotes: profile.quotes,
    works: profile.works,
    watch: profile.watch,
    pending: pending.map((m) => `${m.title} · ${m.source}`),
    next: profile.next,
    series: seriesFor(resident, Number(period)),
    building,
  };
}

export function reportSummary(state, resident) {
  const report = buildResidentReport(state, resident, "30");
  return report.headline;
}
