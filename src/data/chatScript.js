import { DEMO_TODAY } from "./demoData";
import { buildResidentReport } from "./reportNarrative";
import { describeSignal, facilityVoice, journeyInterest, needs, needsFor, presenceFor, presenceNotes, relating, signals, signalsFor } from "./careInsights";

// Risposte della chat secondo docs/contratto-informativo-struttura.md:
// come sta e di cosa ha bisogno l'ospite, mai di cosa ha parlato.

// Tre stakeholder. Lo staff in prima linea (operatori e coordinatori) usa un accesso
// condiviso senza login; psicologa e direzione hanno un accesso personale.
export const roles = [
  { id: "staff", label: "Staff", hint: "Chi ha bisogno di te oggi e come avvicinarlo", access: "senza login", account: { name: "Staff di reparto", initials: "SR", detail: "Accesso condiviso · senza login" } },
  { id: "psicologa", label: "Psicologa", hint: "Segnali di benessere nel tempo, rispetto alla media di ognuno", access: "con login", account: { name: "Dott.ssa Marta Bianchi", initials: "MB", detail: "Psicologa · accesso personale" } },
  { id: "direzione", label: "Direzione", hint: "Come la struttura usa ROSS e cosa chiedono gli ospiti, in aggregato", access: "con login", account: { name: "Paolo Ferri", initials: "PF", detail: "Direzione · accesso personale" } },
];

const legacyRoles = { operatore: "staff", coordinatrice: "staff" };
export const roleFor = (id) => roles.find((r) => r.id === (legacyRoles[id] || id)) || roles[0];

export const suggestions = {
  staff: ["Chi ha bisogno di più attenzione oggi?", "Di cosa ha bisogno Antonio?", "Come posso coinvolgere Elena?", "Chi oggi non ha ancora parlato con ROSS?"],
  psicologa: ["Chi ha espresso segnali da osservare questa settimana?", "Come sta Lucia rispetto alla sua media?", "Carlo si sta chiudendo?", "Come si sta ambientando Ada?"],
  direzione: ["Cosa dicono gli ospiti della vita in struttura?", "Come stanno usando ROSS gli ospiti?", "Quali bisogni ricorrono tra gli ospiti?", "Prepara il report di struttura del mese"],
};

const src = {
  data: (label) => ({ kind: "Dati ROSS", label }),
  doc: (label) => ({ kind: "Documento", label }),
  note: (label) => ({ kind: "Nota operatore", label }),
  bio: (label) => ({ kind: "Biografia d'ingresso", label }),
};

const normalize = (text) => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const byRole = (role, variants) => variants[role] || variants.staff;
const firstName = (resident) => resident.name.split(" ")[0];
const nameOf = (state, id) => firstName(state.residents.find((r) => r.id === id));

function residentStats(state, residentId) {
  const week = state.interactions.filter((i) => i.residentId === residentId && i.date >= "2026-09-15");
  return { week: week.length, minutes: week.reduce((sum, i) => sum + i.duration, 0) };
}

function relatingAnswer(state, role, resident) {
  const r = relating[resident.id];
  const name = firstName(resident);
  return {
    text: byRole(role, {
      staff: `Con ${name}: ${r.address}. Momento migliore: ${r.bestTime}, durata ${r.duration}. Attività che funzionano: ${r.works.join(", ").toLowerCase()}.`,
      psicologa: `${name} risponde meglio con ${r.works.join(", ").toLowerCase()}, ${r.bestTime}.`,
      direzione: `${name}: attività che funzionano ${r.works.join(", ").toLowerCase()}.`,
    }),
    bullets: [
      { tag: "Funziona", text: r.works.join(" · ") },
      { tag: "Interessi", text: r.interests.map(([label, source]) => `${label}${source === "Emerso con ROSS" ? " (emerso con ROSS)" : ""}`).join(" · ") },
      { tag: "Attenzione", text: r.avoid },
    ],
    residents: [resident.id],
    sources: [src.data("Ultimi 30 giorni"), src.bio("Famiglia e struttura")],
    action: { label: `Apri la cartella di ${name}`, to: `/ospiti/${resident.id}` },
  };
}

function residentAnswer({ state, role, resident }) {
  const name = firstName(resident);
  const own = signalsFor(resident.id);
  const ownNeeds = needsFor(resident.id);
  const presence = presenceFor(resident.id);
  const stats = residentStats(state, resident.id);
  const trend = resident.participation == null
    ? `${name} è con ROSS da ${resident.daysWithRoss} giorni: la baseline personale è ancora in costruzione.`
    : `Partecipazione ${resident.participation}/10, ${resident.delta >= 0 ? "+" : ""}${resident.delta} rispetto alla sua media. ${stats.week} conversazioni con ROSS questa settimana (${stats.minutes} min).`;
  const r = relating[resident.id];
  return {
    text: byRole(role, {
      staff: `${trend} Con ${name} funzionano ${r.works.join(", ").toLowerCase()}; momento migliore: ${r.bestTime}.`,
      psicologa: trend,
      direzione: `${resident.name}: con ROSS da ${resident.daysWithRoss} giorni. ${trend}`,
    }),
    bullets: [
      ...own.map((s) => ({ tag: s.positive ? "Benessere" : "Da osservare", text: describeSignal(s, name) })),
      ...ownNeeds.map((n) => ({ tag: "Bisogno", text: `${n.text}${n.times > 1 ? ` (espresso ${n.times} volte)` : ""}` })),
      ...presence.map((p) => ({ tag: "Presenza", text: p.text })),
    ],
    residents: [resident.id],
    sources: [src.data("Ultimi 7 giorni · baseline personale")],
    action: { label: `Apri la cartella di ${name}`, to: `/ospiti/${resident.id}` },
  };
}

const intents = [
  {
    // Domande sul contenuto delle conversazioni: ROSS non le traduce mai.
    id: "privacy",
    keywords: ["di cosa ha parlato", "di cosa parla", "cosa ha detto", "cosa ha raccontato", "trascri", "conversazione di", "argomenti", "ricord"],
    answer: ({ resident }) => ({
      text: `Questo non posso dirtelo: le conversazioni restano tra ROSS e ${resident ? firstName(resident) : "la persona"}, e i ricordi li usa solo ROSS con lei. Posso dirti come sta, di cosa ha bisogno e come coinvolgerla.`,
      bullets: [{ tag: "Regola d'oro", text: "La struttura sa come sta e di cosa ha bisogno l'ospite, mai di cosa ha parlato." }],
      residents: resident ? [resident.id] : [],
      sources: [],
      action: resident ? { label: `Come sta ${firstName(resident)}`, to: `/?ospite=${resident.id}&q=${encodeURIComponent(`Come sta ${firstName(resident)}?`)}` } : null,
    }),
  },
  {
    id: "emerso",
    keywords: ["emers", "novita", "oggi con elena", "nuovo interesse"],
    when: (state) => Boolean(state.rossJourney.completedAt),
    answer: ({ role }) => ({
      text: byRole(role, {
        staff: `Dall'ultima conversazione con ROSS (14 min, partecipazione alta) è emerso un nuovo interesse per Elena: ${journeyInterest.label.toLowerCase()}. È già tra i suoi interessi in cartella. ${journeyInterest.how}`,
        psicologa: `Conversazione di 14 minuti con partecipazione alta e serenità espressa. Nuovo interesse emerso: ${journeyInterest.label.toLowerCase()}.`,
        direzione: `Esempio di valore: in 14 minuti ROSS ha fatto emergere un nuovo interesse per Elena (${journeyInterest.label.toLowerCase()}), utile allo staff per le attività. Il contenuto della conversazione resta privato.`,
      }),
      bullets: [{ tag: "Come usarlo", text: journeyInterest.how }],
      residents: ["elena"],
      sources: [src.data("Oggi · 17:18 · 14 min")],
      action: { label: "Apri gli interessi di Elena", to: "/ospiti/elena?tab=memorie" },
    }),
  },
  {
    id: "report",
    keywords: ["report", "stampa", "resoconto"],
    answer: ({ state, resident, q }) => {
      if (!resident && q.includes("struttura")) {
        const week = state.interactions.filter((i) => i.date >= "2026-09-15");
        return {
          text: `Il report di struttura è pronto: uso di ROSS, benessere aggregato e voce degli ospiti. Negli ultimi 7 giorni ${new Set(week.map((i) => i.residentId)).size} ospiti su ${state.residents.length} hanno parlato con ROSS; ${facilityVoice.length} temi sulla vita in struttura espressi da almeno 3 ospiti.`,
          bullets: facilityVoice.map((v) => ({ tag: v.tone === "positivo" ? "Apprezzato" : v.tone === "negativo" ? "Da migliorare" : "Richiesta", text: `${v.topic}: ${v.count} ospiti` })),
          residents: [],
          sources: [src.data("Ultimi 7 giorni"), src.data("Ultime 2 settimane · aggregato anonimo")],
          action: { label: "Apri il report di struttura", to: "/report?ambito=struttura" },
        };
      }
      const target = resident || state.residents[0];
      const report = buildResidentReport(state, target, "30");
      return {
        text: `Il report "Come sta" di ${firstName(target)} (ultimi 30 giorni) è pronto per l'équipe. In sintesi: ${report.headline.charAt(0).toLowerCase()}${report.headline.slice(1)}`,
        residents: [target.id],
        sources: [src.data("Ultimi 30 giorni · baseline personale")],
        action: { label: `Apri e stampa il report di ${firstName(target)}`, to: `/report?ospite=${target.id}&stampa=1` },
      };
    },
  },
  {
    // Chi seguire per primo oggi: presenza insolita, segnali da osservare e bisogni, per ospite.
    id: "priorita",
    keywords: ["bisogno di piu attenzione", "attenzione oggi", "priorit", "per primo", "per prima", "da chi passo", "turno", "consegn"],
    answer: ({ state, role }) => {
      const order = [...new Set([...presenceNotes.map((p) => p.residentId), ...signals.filter((s) => !s.positive).map((s) => s.residentId)])];
      const bullets = order.map((id) => {
        const name = nameOf(state, id);
        const parts = [
          ...presenceFor(id).map((p) => p.text.replace(/\.$/, "")),
          ...signalsFor(id).filter((s) => !s.positive).map((s) => s.note ? `${s.signal}, ${s.note}` : `ha espresso ${s.signal} in ${s.count} conversazioni su ${s.of} (di solito ${s.usual})`),
          ...needsFor(id).map((n) => `${n.text.charAt(0).toLowerCase()}${n.text.slice(1)}`),
        ];
        const text = parts.join("; ");
        return { resident: id, tag: presenceFor(id).length ? "Oggi" : "Da osservare", text: `${name}: ${text.charAt(0).toLowerCase()}${text.slice(1)}.` };
      });
      const others = needs.filter((n) => !order.includes(n.residentId));
      return {
        text: byRole(role, {
          staff: `Oggi ${order.length} ospiti hanno bisogno di più attenzione, in ordine di priorità:`,
          psicologa: `Oggi ${order.length} ospiti si discostano dalla propria media o da come stanno di solito:`,
          direzione: `Oggi ${order.length} ospiti su ${state.residents.length} richiedono più attenzione dallo staff:`,
        }),
        bullets,
        after: others.length ? `Da prendere in carico anche: ${others.map((n) => `${nameOf(state, n.residentId)} (${n.text.charAt(0).toLowerCase()}${n.text.slice(1)})`).join(", ")}. Il giudizio resta a voi: ROSS segnala, lo staff osserva e decide.` : "Il giudizio resta a voi: ROSS segnala, lo staff osserva e decide.",
        residents: order,
        sources: [src.data("Oggi e ultimi 7 giorni · baseline personali")],
      };
    },
  },
  {
    id: "segnali",
    keywords: ["segnal", "osservare", "attenzione", "bisogno di attenzione", "tristezz", "malinconi", "stanc", "solitudin", "preoccup", "parlato meno", "meno del solito"],
    answer: ({ state, role }) => {
      const toWatch = signals.filter((s) => !s.positive);
      return {
        text: byRole(role, {
          staff: `Questa settimana ${toWatch.length} ospiti hanno espresso segnali da osservare, rispetto alla propria media:`,
          psicologa: "Segnali espressi negli ultimi 7 giorni, confrontati con la baseline di ciascuno. Nessuna valutazione clinica:",
          direzione: `${toWatch.length} ospiti su ${state.residents.length} con segnali da osservare questa settimana:`,
        }),
        bullets: toWatch.map((s) => ({ resident: s.residentId, tag: s.trend, text: describeSignal(s, nameOf(state, s.residentId)) })),
        after: "Il giudizio resta a voi: ROSS segnala, lo staff osserva e decide.",
        residents: toWatch.map((s) => s.residentId),
        sources: [src.data("Ultimi 7 giorni · baseline personali")],
      };
    },
  },
  {
    id: "bisogni",
    keywords: ["bisogn", "chiedono", "richiest", "desider", "hanno bisogno"],
    answer: ({ state, role, resident }) => {
      const list = resident ? needsFor(resident.id) : needs;
      return {
        text: list.length ? byRole(role, {
          staff: "Bisogni personali espressi questa settimana, da prendere in carico:",
          psicologa: "Bisogni espressi questa settimana:",
          direzione: `${list.length} bisogni personali espressi questa settimana:`,
        }) : `${resident ? firstName(resident) : "Nessun ospite"} non ha espresso bisogni particolari questa settimana.`,
        bullets: list.map((n) => ({ resident: n.residentId, tag: "Bisogno", text: `${nameOf(state, n.residentId)}: ${n.text.charAt(0).toLowerCase()}${n.text.slice(1)}${n.times > 1 ? ` (${n.times} volte)` : ""}` })),
        residents: [...new Set(list.map((n) => n.residentId))],
        sources: [src.data("Ultimi 7 giorni")],
      };
    },
  },
  {
    id: "voce",
    keywords: ["vita in struttura", "della struttura", "cibo", "pasti", "rumore", "lamentel", "migliorare", "opinion", "apprezz"],
    answer: ({ role }) => ({
      text: byRole(role, {
        direzione: "Cosa esprimono gli ospiti sulla vita in struttura (anonimo, almeno 3 ospiti per tema):",
        staff: "Temi sulla vita in struttura espressi da più ospiti, in forma anonima:",
        psicologa: "Temi espressi da più ospiti sulla vita in struttura, in forma anonima:",
      }),
      bullets: facilityVoice.map((v) => ({ tag: v.tone === "positivo" ? "Apprezzato" : v.tone === "negativo" ? "Da migliorare" : "Richiesta", text: `${v.count} ospiti hanno espresso ${v.text} (${v.period}).` })),
      after: "Nessun nome né stanza: i temi compaiono solo quando li esprimono almeno 3 ospiti.",
      residents: [],
      sources: [src.data("Ultime 2 settimane · aggregato anonimo")],
      action: { label: "Apri il report di struttura", to: "/report?ambito=struttura" },
    }),
  },
  {
    id: "documenti",
    keywords: ["fisio", "document", "analisi", "sangue", "esami", "cammin", "passeggiat", "deambul"],
    answer: ({ state, role, resident }) => {
      const target = resident || state.residents.find((r) => r.id === "elena");
      const docs = state.documents.filter((d) => d.residentId === target.id);
      if (!docs.length) return { text: `Nella cartella di ${firstName(target)} non ci sono ancora documenti. Puoi allegarne uno dalla graffetta qui sotto: da quel momento ROSS lo userà come fonte.`, residents: [target.id], sources: [], action: { label: "Apri la cartella", to: `/ospiti/${target.id}?tab=documenti` } };
      const physio = docs.find((d) => d.kind === "Fisioterapia");
      const labs = docs.find((d) => d.kind === "Esami del sangue");
      const bridge = target.id === "elena" ? " Tra i suoi interessi (biografia d'ingresso) c'è il giardinaggio: una passeggiata al mattino verso le aiuole unisce l'obiettivo motorio a qualcosa che la coinvolge." : "";
      return {
        text: byRole(role, {
          staff: `${physio ? `Dalla ${physio.title.toLowerCase()} del ${physio.date}: ${physio.summary}` : docs[0].summary}${bridge}${labs ? ` Sono caricati anche gli esami del ${labs.date}: ROSS li rende ricercabili ma non ne interpreta i valori.` : ""}`,
          psicologa: `${physio ? physio.summary : docs[0].summary}${bridge}`,
          direzione: `Per ${firstName(target)} sono caricati ${docs.length} documenti. ROSS li affianca ai dati di benessere senza sostituire la cartella clinica del gestionale.`,
        }),
        residents: [target.id],
        sources: docs.map((d) => src.doc(`${d.kind} · ${d.date}`)).concat(target.id === "elena" ? [src.bio("Interessi")] : []),
        action: { label: "Apri i documenti", to: `/ospiti/${target.id}?tab=documenti` },
      };
    },
  },
  {
    id: "carlo-chiusura",
    keywords: ["chiud", "isolat", "ritirat"],
    answer: ({ role }) => ({
      text: byRole(role, {
        psicologa: "Non posso dirlo: ROSS non valuta stati d'animo. Posso dirti cosa è cambiato: negli ultimi 4 giorni Carlo ha avviato 2 conversazioni contro una media personale di 5, e le conversazioni sono più brevi. Quando parte dai suoi interessi (sport) la durata torna nella norma. Il resto va osservato di persona.",
        staff: "Negli ultimi 4 giorni Carlo ha avviato meno conversazioni (2 contro una media di 5). Nessun altro cambiamento rilevato nelle interazioni con ROSS.",
      }),
      residents: ["carlo"],
      sources: [src.data("Ultimi 4 giorni · baseline 14 giorni")],
      action: { label: "Apri Carlo", to: "/ospiti/carlo" },
    }),
  },
  {
    id: "presenza",
    keywords: ["non ha ancora parlato", "non ha parlato", "assenz", "usando", "uso di ross", "utilizz", "quanto tempo", "questo mese", "numeri"],
    answer: ({ state, role }) => {
      const today = state.interactions.filter((i) => i.date === DEMO_TODAY);
      const week = state.interactions.filter((i) => i.date >= "2026-09-15");
      const talked = new Set(week.map((i) => i.residentId)).size;
      const minutes = week.reduce((sum, i) => sum + i.duration, 0);
      return {
        text: byRole(role, {
          direzione: `Negli ultimi 7 giorni ${talked} ospiti su ${state.residents.length} hanno parlato con ROSS, per ${minutes} minuti complessivi. Oggi: ${today.length} interazioni.`,
          staff: `Oggi ROSS ha fatto ${today.length} interazioni. Da notare:`,
          psicologa: `${talked} ospiti su ${state.residents.length} hanno parlato con ROSS questa settimana. Da notare:`,
        }),
        bullets: presenceNotes.map((p) => ({ resident: p.residentId, tag: p.kind === "assenza" ? "Assenza insolita" : "Momenti di difficoltà", text: `${nameOf(state, p.residentId)}: ${p.text}` })),
        residents: presenceNotes.map((p) => p.residentId),
        sources: [src.data("Ultimi 7 giorni")],
        action: { label: "Apri il report di struttura", to: "/report?ambito=struttura" },
      };
    },
  },
  {
    id: "baseline",
    keywords: ["baseline", "ambient", "nuovo ospite", "arrivat", "appena entrat"],
    answer: ({ state, role }) => {
      const ada = state.residents.find((r) => r.id === "ada");
      return {
        text: byRole(role, {
          direzione: "Ada Moretti è l'unica ospite senza baseline: è con ROSS da 11 giorni, ne servono circa 14.",
          staff: "Ada è con ROSS da 11 giorni: la baseline è in costruzione. Con lei funzionano conversazioni brevi al mattino; tra i suoi interessi c'è la poesia.",
          psicologa: "Ada è con ROSS da 11 giorni: troppo presto per confronti con una sua media. Conversazioni brevi e regolari al mattino.",
        }),
        bullets: needsFor("ada").map((n) => ({ tag: "Bisogno", text: n.text })),
        residents: [ada.id],
        sources: [src.data("11 giorni · baseline in costruzione"), src.bio("Interessi")],
        action: { label: "Apri Ada", to: "/ospiti/ada" },
      };
    },
  },
  {
    id: "relazione",
    keywords: ["coinvolg", "come posso", "approcci", "relazionar", "interess", "parlare con", "attivita per"],
    answer: ({ state, role, resident }) => resident ? relatingAnswer(state, role, resident) : null,
  },
];

export function findResident(state, text) {
  const words = normalize(text).split(/[^a-z]+/);
  return state.residents.find((r) => normalize(r.name).split(" ").filter((part) => part.length > 2).some((part) => words.includes(part)));
}

export function answerQuestion(state, role, question, scopedResidentId) {
  const q = normalize(question);
  const resident = findResident(state, question) || state.residents.find((r) => r.id === scopedResidentId) || null;
  const ctx = { state, role, resident, q };
  const scored = intents
    .filter((intent) => !intent.when || intent.when(state))
    .map((intent) => ({ intent, score: intent.keywords.filter((k) => q.includes(k)).length }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  for (const { intent } of scored) {
    if (intent.id === "carlo-chiusura" && resident?.id !== "carlo") continue;
    if (intent.id === "segnali" && resident && !q.includes("chi ")) return residentAnswer(ctx);
    const answer = intent.answer(ctx);
    if (answer) return answer;
  }
  if (resident) return residentAnswer(ctx);
  return {
    text: "Non ho informazioni su questo. Posso dirti come stanno gli ospiti, di cosa hanno bisogno, come coinvolgerli, cosa esprimono sulla vita in struttura e come usano ROSS. Il contenuto delle conversazioni resta sempre privato.",
    residents: [],
    sources: [],
    fallback: true,
  };
}
