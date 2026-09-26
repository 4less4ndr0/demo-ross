import { DEMO_TODAY, handoverEntries } from "./demoData";
import { buildResidentReport } from "./reportNarrative";

export const roles = [
  { id: "operatore", label: "Operatore", hint: "Contesto rapido prima di entrare in stanza" },
  { id: "coordinatrice", label: "Coordinatrice", hint: "Chi seguire, cosa verificare, cosa passare al turno" },
  { id: "psicologa", label: "Psicologa", hint: "Temi, parole e ricorrenze nelle conversazioni" },
  { id: "direzione", label: "Direzione", hint: "Come la struttura usa ROSS, in aggregato" },
];

export const suggestions = {
  operatore: ["Riassumimi il turno", "Cosa devo sapere su Elena prima di entrare?", "Chi oggi ha parlato meno del solito?", "Di cosa posso parlare con Carlo?"],
  coordinatrice: ["Chi ha bisogno di attenzione questa settimana?", "Quali ricordi sono da verificare?", "Riassumimi il turno", "Stampa il report di Elena"],
  psicologa: ["Quali temi ricorrono nelle conversazioni di Elena?", "Carlo si sta chiudendo?", "Cosa raccontano gli ospiti della famiglia?", "Cosa dice la fisioterapia di Elena?"],
  direzione: ["Come stanno usando ROSS gli ospiti?", "Cosa posso raccontare alle famiglie?", "Chi non ha ancora una baseline?", "Riassumimi il turno"],
};

export const themes = [
  { label: "Sicilia e viaggi", count: 9, residents: ["elena"], quote: "A Palermo faceva molto caldo, ma la sera passeggiavamo vicino al mare." },
  { label: "Musica italiana", count: 11, residents: ["elena", "teresa"], quote: "Le canzoni di Mina le mettevo mentre cucinavo la domenica." },
  { label: "Nipoti e figli", count: 14, residents: ["elena", "lucia", "antonio"], quote: "Sofia studia fotografia, mi manda sempre le foto." },
  { label: "Calcio e giornali", count: 6, residents: ["carlo"], quote: "Il giornale lo leggo dalla fine, prima lo sport." },
  { label: "Cucina", count: 5, residents: ["lucia"], quote: "Il ragù si comincia la mattina presto, non c'è fretta." },
];

const src = {
  conv: (label) => ({ kind: "Conversazione ROSS", label }),
  doc: (label) => ({ kind: "Documento", label }),
  note: (label) => ({ kind: "Nota operatore", label }),
  family: (label) => ({ kind: "Famiglia", label }),
  memory: (label) => ({ kind: "Memoria", label }),
  data: (label) => ({ kind: "Dati ROSS", label }),
};

const normalize = (text) => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const byRole = (role, variants) => variants[role] || variants.coordinatrice;
const firstName = (resident) => resident.name.split(" ")[0];

function residentStats(state, residentId) {
  const list = state.interactions.filter((i) => i.residentId === residentId);
  const week = list.filter((i) => i.date >= "2026-09-15");
  return { total: list.length, week: week.length, minutes: week.reduce((sum, i) => sum + i.duration, 0), last: list[0] };
}

const intents = [
  {
    id: "report",
    keywords: ["report", "stampa", "relazione su", "resoconto"],
    answer: ({ state, resident }) => {
      const target = resident || state.residents[0];
      const report = buildResidentReport(state, target, "30");
      return {
        text: `Il report narrativo di ${firstName(target)} (ultimi 30 giorni) è pronto per l'équipe. In sintesi: ${report.headline.charAt(0).toLowerCase()}${report.headline.slice(1)}`,
        residents: [target.id],
        sources: [src.conv("Ultimi 30 giorni"), src.data("Baseline personale")],
        action: { label: `Apri e stampa il report di ${firstName(target)}`, to: `/report?ospite=${target.id}&stampa=1` },
      };
    },
  },
  {
    id: "emerso",
    keywords: ["emers", "novita", "nuovo ricordo", "macchina fotografica", "oggi con elena"],
    when: (state) => Boolean(state.rossJourney.completedAt),
    answer: ({ state, role }) => {
      const confirmed = Boolean(state.rossJourney.confirmedAt);
      return {
        text: byRole(role, {
          operatore: `Oggi con Elena è venuto fuori un dettaglio nuovo: Paolo, il marito, portava una piccola macchina fotografica rossa a Cefalù. ${confirmed ? "Il ricordo è confermato: puoi usarlo come spunto." : "Aspetta che sia verificato prima di riprenderlo."}`,
          coordinatrice: `Nella conversazione su Cefalù (14 min) è emerso un possibile nuovo ricordo: la macchina fotografica rossa di Paolo. ${confirmed ? "È stato confermato e collegato a profilo, grafo e vista famiglia." : "È in stato «Da verificare»: finché non lo confermi, ROSS non lo riusa."}`,
          psicologa: `Il ricordo è emerso spontaneamente mentre Elena descriveva le passeggiate serali a Cefalù, in un passaggio ricco di dettagli sensoriali (luce, mare, fotografie). ${confirmed ? "Confermato." : "Ancora da verificare."}`,
          direzione: `Esempio concreto di valore: in una conversazione di 14 minuti ROSS ha raccolto un dettaglio biografico nuovo, ${confirmed ? "già confermato e condiviso con la famiglia" : "ora in verifica da parte dello staff"}.`,
        }),
        residents: ["elena"],
        sources: [src.conv("Oggi · 17:18 · Cefalù e fotografie"), src.memory(confirmed ? "Confermata" : "Da verificare")],
        action: { label: confirmed ? "Apri il ricordo" : "Verifica il ricordo", to: "/ospiti/elena?tab=memorie" },
      };
    },
  },
  {
    id: "turno",
    keywords: ["turno", "consegn", "riassum", "passaggio"],
    answer: ({ state, role }) => {
      const notes = [...state.notes.map((n) => ({ ...n, source: n.source || "Operatore" })), ...handoverEntries];
      const bullets = notes.slice(0, 5).map((entry) => {
        const resident = state.residents.find((r) => r.id === entry.residentId);
        return { resident: entry.residentId, text: `${resident ? firstName(resident) : "Ospite"}: ${entry.text}`, tag: entry.source === "ROSS" ? "Osservato da ROSS" : `Nota ${entry.source.toLowerCase()}` };
      });
      return {
        text: byRole(role, {
          operatore: "Turno pomeriggio 14–22, in breve:",
          coordinatrice: "Sintesi del pomeriggio. Le osservazioni di ROSS sono separate dalle note del team:",
          psicologa: "Dal pomeriggio, ciò che è emerso nelle conversazioni:",
          direzione: `Pomeriggio: ${state.interactions.filter((i) => i.date === DEMO_TODAY).length} interazioni registrate da ROSS. I passaggi principali:`,
        }),
        bullets,
        after: role === "coordinatrice" ? "Da prendere in carico: Carlo ha avviato meno conversazioni del solito (vedi sotto)." : null,
        residents: [...new Set(bullets.map((b) => b.resident))],
        sources: [src.conv("Pomeriggio · 4 conversazioni"), src.note("Lucia · 16:08")],
      };
    },
  },
  {
    id: "documenti",
    keywords: ["fisio", "document", "analisi", "sangue", "esami", "cammin", "passeggiat", "deambul"],
    answer: ({ state, role, resident }) => {
      const target = resident || state.residents.find((r) => r.id === "elena");
      const docs = state.documents.filter((d) => d.residentId === target.id);
      if (!docs.length) return { text: `Nella cartella di ${firstName(target)} non ci sono ancora documenti caricati. Puoi allegarne uno dalla graffetta qui sotto: da quel momento ROSS lo userà come fonte.`, residents: [target.id], sources: [], action: { label: "Apri la cartella", to: `/ospiti/${target.id}?tab=documenti` } };
      const physio = docs.find((d) => d.kind === "Fisioterapia");
      const labs = docs.find((d) => d.kind === "Esami del sangue");
      const bridge = target.id === "elena" ? " Nelle conversazioni con ROSS Elena cita spesso il giardino e i gerani: una passeggiata al mattino verso le aiuole unisce l'obiettivo motorio a un tema che la coinvolge." : "";
      return {
        text: byRole(role, {
          operatore: `${physio ? `${physio.summary}` : docs[0].summary}${bridge}`,
          coordinatrice: `${physio ? `Dalla ${physio.title.toLowerCase()} del ${physio.date}: ${physio.summary}` : docs[0].summary}${bridge}${labs ? ` Sono caricati anche gli esami del ${labs.date}: ROSS li rende ricercabili ma non ne interpreta i valori.` : ""}`,
          psicologa: `${physio ? physio.summary : docs[0].summary}${bridge} Il documento clinico non dice nulla sul vissuto: per quello le conversazioni ROSS restano la fonte principale.`,
          direzione: `Per ${firstName(target)} sono caricati ${docs.length} documenti. ROSS li incrocia con le conversazioni senza sostituire la cartella clinica del gestionale.`,
        }),
        residents: [target.id],
        sources: docs.map((d) => src.doc(`${d.kind} · ${d.date}`)).concat(target.id === "elena" ? [src.conv("12 set · Giardino e gerani")] : []),
        action: { label: "Apri i documenti", to: `/ospiti/${target.id}?tab=documenti` },
      };
    },
  },
  {
    id: "verifica",
    keywords: ["verific", "ricordi", "memori", "da confermare"],
    answer: ({ state, role }) => {
      const pending = state.memories.filter((m) => m.status !== "Confermata");
      return {
        text: pending.length ? byRole(role, {
          operatore: `Ci sono ${pending.length} ricordi ancora da verificare. Finché non sono confermati, meglio non usarli come spunto.`,
          coordinatrice: `${pending.length} ricordi aspettano una verifica. ROSS non li riusa finché qualcuno del team (o la famiglia) non li conferma:`,
          psicologa: `${pending.length} ricordi emersi nelle conversazioni non sono ancora verificati:`,
          direzione: `${pending.length} ricordi emersi dalle conversazioni sono in coda di verifica. Nessuno viene condiviso con le famiglie prima della conferma.`,
        }) : "Non ci sono ricordi in attesa di verifica.",
        bullets: pending.slice(0, 4).map((m) => ({ resident: m.residentId, text: `${m.title} — ${m.source}`, tag: m.status })),
        residents: [...new Set(pending.map((m) => m.residentId))],
        sources: [src.memory(`${pending.length} in verifica`)],
        action: pending.length ? { label: "Vai alle memorie di Elena", to: "/ospiti/elena?tab=memorie" } : null,
      };
    },
  },
  {
    id: "attenzione",
    keywords: ["attenzione", "priorit", "bisogno", "seguire", "parlato meno", "meno del solito", "preoccup"],
    answer: ({ state, role }) => {
      const lower = state.residents.filter((r) => r.delta != null && r.delta < 0).sort((a, b) => a.delta - b.delta);
      return {
        text: byRole(role, {
          operatore: "Oggi chi ha parlato meno del solito con ROSS:",
          coordinatrice: "Rispetto alla propria baseline personale, questa settimana:",
          psicologa: "Variazioni rispetto alla baseline di ciascuno (solo interazioni con ROSS, nessuna valutazione clinica):",
          direzione: `${lower.length} ospiti su ${state.residents.length} sono sotto la propria media di interazione:`,
        }),
        bullets: lower.map((r) => ({ resident: r.id, text: `${r.name}: ${r.delta.toFixed(1)} rispetto alla sua media${r.id === "carlo" ? ", 3 conversazioni avviate in meno negli ultimi 4 giorni" : r.mode === "Silenziosa" ? ", è in modalità silenziosa" : ""}.`, tag: "Sotto baseline" })),
        after: "Ada è arrivata da 11 giorni: la sua baseline è ancora in costruzione.",
        residents: lower.map((r) => r.id).concat("ada"),
        sources: [src.data("Baseline personali · 14 giorni"), src.conv("Carlo · 4 conversazioni recenti")],
      };
    },
  },
  {
    id: "carlo-chiusura",
    keywords: ["chiud", "isolat", "ritirat"],
    answer: ({ role }) => ({
      text: byRole(role, {
        psicologa: "Non posso dirlo. Posso dirti cosa è cambiato nelle conversazioni: negli ultimi 4 giorni Carlo ha avviato 2 conversazioni contro una media personale di 5, e le risposte sono più brevi. Quando si parla di calcio la durata torna nella norma. Il resto va osservato di persona.",
        coordinatrice: "Negli ultimi 4 giorni Carlo ha avviato meno conversazioni (2 contro una media di 5). Nessun altro cambiamento rilevato nelle interazioni con ROSS.",
      }),
      residents: ["carlo"],
      sources: [src.conv("18–21 set · 4 conversazioni"), src.data("Baseline 14 giorni")],
      action: { label: "Apri Carlo", to: "/ospiti/carlo" },
    }),
  },
  {
    id: "uso",
    keywords: ["usando", "uso di ross", "utilizz", "ingaggi", "engagement", "quanto tempo", "questo mese", "numeri", "come va ross"],
    answer: ({ state, role }) => {
      const today = state.interactions.filter((i) => i.date === DEMO_TODAY);
      const week = state.interactions.filter((i) => i.date >= "2026-09-15");
      const talked = new Set(week.map((i) => i.residentId)).size;
      const minutes = week.reduce((sum, i) => sum + i.duration, 0);
      return {
        text: byRole(role, {
          direzione: `Negli ultimi 7 giorni ${talked} ospiti su ${state.residents.length} hanno parlato con ROSS, per ${minutes} minuti complessivi di conversazione. Oggi: ${today.length} interazioni.`,
          coordinatrice: `Questa settimana ${talked} ospiti su ${state.residents.length} hanno parlato con ROSS (${minutes} min). La fascia più usata è 10:00–11:30.`,
          operatore: `Oggi ROSS ha fatto ${today.length} interazioni. La fascia più tranquilla per proporre una conversazione è 10:00–11:30.`,
          psicologa: `${talked} ospiti su ${state.residents.length} hanno parlato con ROSS questa settimana. Le conversazioni del mattino durano in media 6 minuti in più.`,
        }),
        bullets: [
          { text: "Conversazioni libere: 36% del tempo", tag: "Tipologia" },
          { text: "Ricordi guidati: 24% · Musica: 18%", tag: "Tipologia" },
          { text: "Durata più frequente: 11–15 minuti", tag: "Durata" },
        ],
        residents: [],
        sources: [src.data("Ultimi 7 giorni · tutte le interazioni")],
        action: { label: "Apri il report di struttura", to: "/report?ambito=struttura" },
      };
    },
  },
  {
    id: "famiglia",
    keywords: ["famigli", "figli", "nipot", "raccontare alle"],
    answer: ({ state, role }) => {
      const confirmed = state.memories.filter((m) => m.status === "Confermata").length;
      return {
        text: byRole(role, {
          direzione: `Questo mese ROSS ha raccolto ${confirmed} ricordi confermati, già visibili alle famiglie nella loro vista. Un esempio da raccontare: Elena parla di Sofia, la nipote fotografa, in 14 conversazioni.`,
          psicologa: "La famiglia è il tema più ricorrente (14 menzioni nelle ultime due settimane). Elena parla spesso della nipote Sofia, Lucia dei figli a Bologna, Antonio del fratello.",
          coordinatrice: "Le famiglie hanno inviato 2 contributi questo mese (una cartolina di Cefalù e uno spunto musicale). Il tema famiglia è il più presente nelle conversazioni.",
          operatore: "Se cerchi uno spunto: Elena si illumina parlando di Sofia, Lucia dei figli, Antonio del fratello.",
        }),
        residents: ["elena", "lucia", "antonio"],
        sources: [src.conv("Ultime 2 settimane · 14 menzioni"), src.family("Anna · cartolina di Cefalù")],
      };
    },
  },
  {
    id: "baseline",
    keywords: ["baseline", "ambient", "nuovo ospite", "arrivat", "appena entrat"],
    answer: ({ role }) => ({
      text: byRole(role, {
        direzione: "Ada Moretti è l'unica ospite senza baseline: è con ROSS da 11 giorni, ne servono circa 14.",
        coordinatrice: "Ada è con ROSS da 11 giorni: la baseline è in costruzione. Finora 6 conversazioni brevi, soprattutto sulla poesia. Si apre di più al mattino.",
        psicologa: "Ada parla volentieri di poesia e di cucito; ha citato due volte la sua casa di Mantova. Troppo presto per confronti: la baseline è in costruzione.",
        operatore: "Ada è arrivata da poco. Le piace la poesia: chiederle una poesia che conosce a memoria funziona bene.",
      }),
      residents: ["ada"],
      sources: [src.conv("Ada · 6 conversazioni"), src.data("Baseline in costruzione")],
      action: { label: "Apri Ada", to: "/ospiti/ada" },
    }),
  },
  {
    id: "temi",
    keywords: ["temi", "ricorr", "di cosa parla", "cosa dicono", "argomenti", "spunto", "parlare con"],
    answer: ({ role, resident }) => {
      const list = resident ? themes.filter((t) => t.residents.includes(resident.id)) : themes;
      const items = list.length ? list : themes.slice(0, 2);
      return {
        text: resident
          ? byRole(role, { operatore: `Con ${firstName(resident)} funzionano bene:`, psicologa: `Nelle conversazioni di ${firstName(resident)} ricorrono:`, coordinatrice: `Temi ricorrenti per ${firstName(resident)}:`, direzione: `Temi ricorrenti per ${firstName(resident)}:` })
          : "Nelle ultime due settimane i temi più ricorrenti sono:",
        bullets: items.map((t) => ({ text: `${t.label} — ${t.count} menzioni`, quote: role === "psicologa" || role === "operatore" ? t.quote : null, tag: "Tema" })),
        residents: resident ? [resident.id] : [],
        sources: [src.conv("Ultime 2 settimane")],
      };
    },
  },
];

function residentAnswer({ state, role, resident }) {
  const stats = residentStats(state, resident.id);
  const name = firstName(resident);
  const special = resident.id === "elena" ? {
    operatore: "Ama raccontare attraverso fotografie e musica. Buoni spunti: Sofia (la nipote fotografa), la Sicilia, le canzoni di Mina. Al pomeriggio dalle 14 riposa: meglio non proporle attività.",
    coordinatrice: `Partecipazione ${resident.participation}/10, +${resident.delta} sulla sua media. ${stats.week} conversazioni questa settimana (${stats.minutes} min). Ci sono ricordi da verificare e una relazione fisioterapica recente.`,
    psicologa: "Nelle ultime due settimane: Sofia e la fotografia (14 menzioni), Sicilia (9), musica (7). Frase ricorrente: «Paolo prendeva sempre gli spaghetti alle vongole». Le conversazioni si allungano quando partono da un luogo.",
    direzione: `Con ROSS da ${resident.daysWithRoss} giorni, ${stats.total} interazioni registrate. È il caso più ricco della struttura: da qui sono nati 3 ricordi condivisi con la famiglia.`,
  } : null;
  const generic = {
    operatore: `${name} è in stanza ${resident.room}. Adesso: ${resident.current.toLowerCase()}. Spunti che funzionano: ${resident.interests.join(", ").toLowerCase()}.${resident.mode === "Silenziosa" ? " È in modalità silenziosa: meglio non disturbare." : ""}`,
    coordinatrice: `${resident.participation == null ? "Baseline in costruzione." : `Partecipazione ${resident.participation}/10 (${resident.delta >= 0 ? "+" : ""}${resident.delta} sulla sua media).`} ${stats.week} conversazioni con ROSS questa settimana, ultima alle ${resident.lastInteraction}.`,
    psicologa: `Con ${name} i temi più presenti sono ${resident.interests.slice(0, 2).join(" e ").toLowerCase()}. ${resident.delta != null && resident.delta < 0 ? "Negli ultimi giorni le conversazioni sono meno frequenti del solito." : "Nessuna variazione rilevante rispetto alla sua media."}`,
    direzione: `${resident.name}: con ROSS da ${resident.daysWithRoss} giorni, ${stats.total} interazioni registrate.`,
  };
  return {
    text: byRole(role, special || generic),
    residents: [resident.id],
    sources: [src.conv(stats.last ? `Ultima · ${stats.last.date.slice(8)}/${stats.last.date.slice(5, 7)} · ${stats.last.topic}` : "Nessuna"), src.data("Baseline personale")].concat(resident.id === "elena" ? [src.doc("Fisioterapia · 15 set")] : []),
    action: { label: `Apri la cartella di ${name}`, to: `/ospiti/${resident.id}` },
  };
}

export function findResident(state, text) {
  const words = normalize(text).split(/[^a-z]+/);
  return state.residents.find((r) => normalize(r.name).split(" ").filter((part) => part.length > 2).some((part) => words.includes(part)));
}

export function answerQuestion(state, role, question, scopedResidentId) {
  const q = normalize(question);
  const resident = findResident(state, question) || state.residents.find((r) => r.id === scopedResidentId) || null;
  const theme = themes.find((t) => t.label.toLowerCase().split(" ").some((word) => word.length > 4 && q.includes(normalize(word))));
  const scored = intents
    .filter((intent) => !intent.when || intent.when(state))
    .map((intent) => ({ intent, score: intent.keywords.filter((k) => q.includes(k)).length }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  const ctx = { state, role, resident };
  if (scored.length) {
    const top = scored[0].intent;
    if (top.id === "carlo-chiusura" && (!resident || resident.id !== "carlo")) return residentAnswer({ ...ctx, resident: resident || state.residents[1] });
    if (top.id === "attenzione" && resident && !q.includes("chi ")) return residentAnswer(ctx);
    return top.answer(ctx);
  }
  if (theme) {
    return {
      text: `«${theme.label}» è emerso in ${theme.count} conversazioni nelle ultime due settimane.`,
      bullets: [{ text: theme.quote, tag: "Citazione", quote: null }],
      residents: theme.residents,
      sources: [src.conv(`${theme.count} menzioni · ultime 2 settimane`)],
    };
  }
  if (resident) return residentAnswer(ctx);
  return {
    text: "Non ho trovato nulla su questo nelle conversazioni di ROSS o nei documenti caricati. Posso rispondere su ospiti, turni, temi delle conversazioni, ricordi da verificare e documenti in cartella.",
    residents: [],
    sources: [],
    fallback: true,
  };
}
