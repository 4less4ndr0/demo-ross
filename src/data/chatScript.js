import { DEMO_TODAY } from "./demoData";
import { buildResidentReport, buildTeamReport } from "./reportNarrative";
import { approachGuide, describeSignal, facilityVoice, groupByResident, hooksFor, journeyInterest, needs, trendOf, needsFor, presenceFor, presenceNotes, relating, rossTips, signals, signalsFor } from "./careInsights";
import { suggestedActivities } from "./activities";

// Risposte della chat secondo docs/contratto-informativo-struttura.md:
// come sta e di cosa ha bisogno l'ospite, mai di cosa ha parlato.

// Quattro stakeholder. Lo staff in prima linea (operatori e coordinatori) usa un accesso
// condiviso senza login; educatrice, psicologa e direzione hanno un accesso personale.
export const roles = [
  { id: "staff", label: "Staff", hint: "Chi ha bisogno di te oggi e come avvicinarlo", access: "senza login", account: { name: "Staff di reparto", initials: "SR", detail: "Accesso condiviso · senza login" } },
  { id: "educatrice", label: "Educatrice", hint: "Attività e interessi che coinvolgono ciascuno, e i momenti meno coperti", access: "con login", account: { name: "Giulia Serra", initials: "GS", detail: "Educatrice · accesso personale" } },
  { id: "psicologa", label: "Psicologa", hint: "Segnali di benessere nel tempo, rispetto alla media di ognuno", access: "con login", account: { name: "Dott.ssa Marta Bianchi", initials: "MB", detail: "Psicologa · accesso personale" } },
  { id: "direzione", label: "Direzione", hint: "Come la struttura usa ROSS e cosa chiedono gli ospiti, in aggregato", access: "con login", account: { name: "Paolo Ferri", initials: "PF", detail: "Direzione · accesso personale" } },
];

const legacyRoles = { operatore: "staff", coordinatrice: "staff" };
export const roleFor = (id) => roles.find((r) => r.id === (legacyRoles[id] || id)) || roles[0];

export const suggestions = {
  staff: ["Chi ha bisogno di più attenzione oggi?", "Chi vorrebbe partecipare ma ha bisogno di essere accompagnato?", "Come invogliare Antonio a partecipare?", "Proponi a Carlo il giornale del mattino"],
  educatrice: ["Chi vorrebbe partecipare ma ha bisogno di essere accompagnato?", "Proponi ad Antonio la radio in compagnia", "Quali attività coinvolgono di più gli ospiti?", "Che spunto posso proporre a ciascuno?"],
  psicologa: ["Chi ha espresso segnali da osservare questa settimana?", "Chi sta meglio del solito questa settimana?", "Come sta Lucia rispetto alla sua media?", "Carlo si sta chiudendo?"],
  direzione: ["Cosa dicono gli ospiti della vita in struttura?", "Cosa sta andando bene in struttura?", "Come stanno usando ROSS gli ospiti?", "Prepara il riepilogo d'équipe del mese"],
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
  const guide = approachGuide[resident.id];
  const top = hooksFor(resident.id, { withJourney: Boolean(state.rossJourney.completedAt) })[0];
  return {
    text: byRole(role, {
      staff: `Con ${name}: ${r.address}. Momento migliore: ${r.bestTime}, durata ${r.duration}. Attività che funzionano: ${r.works.join(", ").toLowerCase()}.`,
      psicologa: `${name} risponde meglio con ${r.works.join(", ").toLowerCase()}, ${r.bestTime}.`,
      direzione: `${name}: attività che funzionano ${r.works.join(", ").toLowerCase()}.`,
    }),
    bullets: [
      ...(guide ? guide.firstSteps.map((step, i) => ({ tag: `Passo ${i + 1}`, text: step })) : []),
      ...(top?.opener ? [{ tag: "Per iniziare", text: `${top.label}: ${top.opener}${top.engagement ? ` (con ROSS conversazioni +${top.engagement.duration}% rispetto alla sua media)` : ""}` }] : []),
      { tag: "Funziona", text: r.works.join(" · ") },
      { tag: "Interessi", text: r.interests.map(([label, source]) => `${label}${source === "Emerso con ROSS" ? " (emerso con ROSS)" : ""}`).join(" · ") },
      { tag: "Attenzione", text: r.avoid },
    ],
    residents: [resident.id],
    sources: [src.data("Ultimi 30 giorni"), src.bio("Famiglia e struttura")],
    action: { label: `Come avvicinarsi a ${name}`, to: `/ospiti/${resident.id}?tab=avvicinare` },
  };
}

function residentAnswer({ state, role, resident }) {
  const name = firstName(resident);
  const own = signalsFor(resident.id);
  const ownNeeds = needsFor(resident.id);
  const presence = presenceFor(resident.id);
  const stats = residentStats(state, resident.id);
  const trend = resident.participation == null
    ? `${name} è con ROSS da ${resident.daysWithRoss} giorni: ROSS la sta ancora conoscendo, la sua media personale si sta formando.`
    : `Partecipazione ${trendOf(resident).label} (${resident.delta >= 0 ? "+" : ""}${resident.delta}). ${stats.week} conversazioni con ROSS questa settimana (${stats.minutes} min).`;
  const r = relating[resident.id];
  return {
    text: byRole(role, {
      staff: `${trend} Con ${name} funzionano ${r.works.join(", ").toLowerCase()}; momento migliore: ${r.bestTime}.`,
      psicologa: trend,
      direzione: `${resident.name}: con ROSS da ${resident.daysWithRoss} giorni. ${trend}`,
    }),
    bullets: [
      ...[...own].sort((a, b) => Number(Boolean(b.positive)) - Number(Boolean(a.positive))).map((s) => ({ tag: s.positive ? "Va bene" : "Da osservare", text: describeSignal(s, name) })),
      ...ownNeeds.map((n) => ({ tag: "Bisogno", text: `${n.text}${n.times > 1 ? ` (espresso ${n.times} volte)` : ""}` })),
      ...presence.map((p) => ({ tag: "Presenza", text: p.text })),
    ],
    residents: [resident.id],
    sources: [src.data("Ultimi 7 giorni · media personale")],
    action: { label: `Apri il ritratto di ${name}`, to: `/ospiti/${resident.id}` },
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
        staff: `Dall'ultima conversazione con ROSS (14 min, partecipazione alta) è emerso un nuovo interesse per Elena: ${journeyInterest.label.toLowerCase()}. È già tra i suoi interessi nel ritratto. ${journeyInterest.how}`,
        psicologa: `Conversazione di 14 minuti con partecipazione alta e serenità espressa. Nuovo interesse emerso: ${journeyInterest.label.toLowerCase()}.`,
        direzione: `Esempio di valore: in 14 minuti ROSS ha fatto emergere un nuovo interesse per Elena (${journeyInterest.label.toLowerCase()}), utile allo staff per le attività. Il contenuto della conversazione resta privato.`,
      }),
      bullets: [{ tag: "Come usarlo", text: journeyInterest.how }],
      residents: ["elena"],
      sources: [src.data("Oggi · 17:18 · 14 min")],
      action: { label: "Apri gli interessi di Elena", to: "/ospiti/elena?tab=avvicinare" },
    }),
  },
  {
    id: "report",
    keywords: ["report", "stampa", "resoconto", "riepilogo"],
    answer: ({ state, resident, q }) => {
      if (!resident && (q.includes("struttura") || q.includes("riepilogo") || q.includes("equipe"))) {
        const week = state.interactions.filter((i) => i.date >= "2026-09-15");
        return {
          text: `Il riepilogo d'équipe è nella Panoramica, pronto da stampare: benessere, voce degli ospiti, bisogni e presenza. Negli ultimi 7 giorni ${new Set(week.map((i) => i.residentId)).size} ospiti su ${state.residents.length} hanno parlato con ROSS; ${facilityVoice.length} temi sulla vita in struttura espressi da almeno 3 ospiti.`,
          bullets: facilityVoice.map((v) => ({ tag: v.tone === "positivo" ? "Apprezzato" : v.tone === "negativo" ? "Da migliorare" : "Richiesta", text: `${v.topic}: ${v.count} ospiti` })),
          residents: [],
          sources: [src.data("Ultimi 7 giorni"), src.data("Ultime 2 settimane · aggregato anonimo")],
          action: { label: "Apri la Panoramica", to: "/panoramica" },
        };
      }
      const target = resident || state.residents[0];
      const report = buildResidentReport(state, target, "30");
      return {
        text: `Il report "Come sta" di ${firstName(target)} (ultimi 30 giorni) è pronto per l'équipe. In sintesi: ${report.headline.charAt(0).toLowerCase()}${report.headline.slice(1)}`,
        residents: [target.id],
        sources: [src.data("Ultimi 30 giorni · media personale")],
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
        after: `${others.length ? `Da prendere in carico anche: ${others.map((n) => `${nameOf(state, n.residentId)} (${n.text.charAt(0).toLowerCase()}${n.text.slice(1)})`).join(", ")}. ` : ""}Da valorizzare: ${groupByResident(signals.filter((s) => s.positive && s.trend === "in aumento"), (id) => nameOf(state, id))}.`,
        residents: order,
        sources: [src.data("Oggi e ultimi 7 giorni · medie personali")],
      };
    },
  },
  {
    // Ciò che va bene: ROSS racconta anche i segnali positivi, rispetto alla media di ciascuno.
    id: "positivi",
    keywords: ["va bene", "andando bene", "positiv", "meglio", "buone notizie", "buon umore", "buonumore", "serenit", "sorrid"],
    answer: ({ state, role }) => {
      const going = signals.filter((s) => s.positive);
      const liked = facilityVoice.filter((v) => v.tone === "positivo");
      return {
        text: byRole(role, {
          staff: `Questa settimana ${new Set(going.map((s) => s.residentId)).size} ospiti su ${state.residents.length} hanno espresso qualcosa di positivo, rispetto alla propria media:`,
          psicologa: "Segnali positivi degli ultimi 7 giorni, confrontati con la media di ciascuno:",
          direzione: `Cosa sta andando bene: ${new Set(going.map((s) => s.residentId)).size} ospiti su ${state.residents.length} con segnali positivi e ${liked.length} temi apprezzati sulla vita in struttura.`,
        }),
        bullets: [
          ...going.map((s) => ({ resident: s.residentId, tag: "Va bene", text: describeSignal(s, nameOf(state, s.residentId)) })),
          ...liked.map((v) => ({ tag: "Apprezzato", text: `${v.count} ospiti hanno espresso ${v.text} (${v.period}).` })),
        ],
        after: "È ciò su cui costruire: un'attività che funziona, un complimento da condividere con lo staff.",
        residents: [...new Set(going.map((s) => s.residentId))],
        sources: [src.data("Ultimi 7 giorni · medie personali"), src.data("Ultime 2 settimane · aggregato anonimo")],
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
          psicologa: "Segnali espressi negli ultimi 7 giorni, confrontati con la media di ciascuno. Sono spunti da osservare, non giudizi sulla salute:",
          direzione: `${toWatch.length} ospiti su ${state.residents.length} con segnali da osservare questa settimana:`,
        }),
        bullets: toWatch.map((s) => ({ resident: s.residentId, tag: s.trend, text: describeSignal(s, nameOf(state, s.residentId)) })),
        after: "Il giudizio resta a voi: ROSS segnala, lo staff osserva e decide.",
        residents: toWatch.map((s) => s.residentId),
        sources: [src.data("Ultimi 7 giorni · medie personali")],
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
      action: { label: "Apri la Panoramica", to: "/panoramica" },
    }),
  },
  {
    // Allegati facoltativi (foto, indicazioni pratiche): ROSS li cita, non li interpreta.
    id: "allegati",
    keywords: ["fisio", "document", "allegat", "cammin", "passeggiat", "esercizi"],
    answer: ({ state, role, resident }) => {
      const target = resident || state.residents.find((r) => r.id === "elena");
      const docs = state.documents.filter((d) => d.residentId === target.id);
      if (!docs.length) return { text: `Per ${firstName(target)} non ci sono allegati. Se vi è utile potete aggiungere una foto o un file dalla graffetta qui sotto o dal suo ritratto.`, residents: [target.id], sources: [], action: { label: "Apri gli allegati", to: `/ospiti/${target.id}?tab=allegati` } };
      const practical = docs.find((d) => d.origin === "staff" && !d.image) || docs.find((d) => d.origin === "famiglia") || docs[0];
      const bridge = target.id === "elena" ? " Tra i suoi interessi (biografia d'ingresso) c'è il giardinaggio: una passeggiata al mattino verso le aiuole unisce le due cose." : "";
      return {
        text: byRole(role, {
          staff: `Dall'allegato «${practical.title}» (${practical.author}, ${practical.date}): ${practical.summary}${bridge}`,
          psicologa: `${practical.summary}${bridge}`,
          direzione: `Per ${firstName(target)} ci sono ${docs.length} allegati, portati all'ingresso o aggiunti dallo staff quando serviva. ROSS li cita come fonte ma non sostituisce i documenti ufficiali del gestionale.`,
        }),
        bullets: docs.map((d) => ({ tag: d.kind, text: `${d.title} · ${d.author}, ${d.date}` })),
        residents: [target.id],
        sources: docs.map((d) => src.doc(`${d.title} · ${d.date}`)).concat(target.id === "elena" ? [src.bio("Interessi")] : []),
        action: { label: "Apri gli allegati", to: `/ospiti/${target.id}?tab=allegati` },
      };
    },
  },
  {
    // ROSS come ponte verso la vita fuori: chi vorrebbe partecipare o uscire e ha bisogno di qualcuno che lo accompagni.
    id: "accompagnare",
    keywords: ["accompagn", "vorrebbe partecipare", "partecipare ma", "uscire"],
    answer: ({ state, role }) => {
      const wish = needs.filter((n) => ["Stare all'aperto", "Partecipare alle attività"].includes(n.category));
      const joining = signals.filter((s) => s.positive && s.signal === "partecipazione");
      return {
        text: byRole(role, {
          staff: `ROSS invita gli ospiti a partecipare alla vita della residenza. ${wish.length} ospiti vorrebbero farlo ma hanno bisogno di qualcuno che li accompagni:`,
          educatrice: `${wish.length} ospiti hanno espresso il desiderio di partecipare o uscire: un invito tuo, e qualcuno che li accompagni, può fare la differenza.`,
          direzione: `${wish.length} ospiti vorrebbero partecipare di più alla vita della residenza ma hanno bisogno di essere accompagnati.`,
        }),
        bullets: [
          ...wish.map((n) => ({ resident: n.residentId, tag: n.category, text: `${nameOf(state, n.residentId)}: ${n.text.charAt(0).toLowerCase()}${n.text.slice(1)}${n.times > 1 ? ` (${n.times} volte)` : ""}.` })),
          ...joining.map((s) => ({ resident: s.residentId, tag: "Va bene", text: describeSignal(s, nameOf(state, s.residentId)) })),
        ],
        after: "ROSS sa che qualcuno ha partecipato solo se è la persona a raccontarlo. Il successo di ROSS non è il tempo passato a parlare con lui, ma quello passato fuori.",
        residents: [...new Set([...wish.map((n) => n.residentId), ...joining.map((s) => s.residentId)])],
        sources: [src.data("Ultimi 7 giorni · bisogni espressi e racconti dopo gli inviti")],
      };
    },
  },
  {
    // Educatrice: quali attività coinvolgono, rispetto alla durata media di chi le fa.
    id: "attivita",
    keywords: ["quali attivita", "attivita coinvolg", "coinvolgono di piu", "attivita funzionano"],
    answer: ({ state }) => {
      const rows = buildTeamReport(state, "30").activityEngagement;
      return {
        text: "Attività con ROSS negli ultimi 30 giorni, confrontate con la durata media delle conversazioni di chi le fa:",
        bullets: rows.map((a) => ({ tag: a.value >= 0 ? "Coinvolge di più" : "Coinvolge meno", text: `${a.label}: ${a.value >= 0 ? "+" : ""}${a.value}% rispetto alla media personale (${a.count} conversazioni).` })),
        after: "Non è una classifica degli ospiti: dice quali proposte allungano le conversazioni di ciascuno.",
        residents: [],
        sources: [src.data("Ultimi 30 giorni · media personale")],
        action: { label: "Apri la Panoramica", to: "/panoramica" },
      };
    },
  },
  {
    // Educatrice: uno spunto per ospite, dall'interesse che coinvolge di più.
    id: "spunti",
    keywords: ["spunto", "spunti", "proporre a ciascuno", "da proporre"],
    answer: ({ state }) => {
      const rows = state.residents.map((r) => ({ r, top: hooksFor(r.id, { withJourney: Boolean(state.rossJourney.completedAt) }).find((h) => h.opener) })).filter((x) => x.top);
      return {
        text: "Uno spunto per ospite, dall'interesse che lo coinvolge di più con ROSS:",
        bullets: rows.map(({ r, top }) => ({ resident: r.id, tag: top.label, text: `${firstName(r)}: ${top.opener}${top.activity ? ` · ${top.activity.charAt(0).toLowerCase()}${top.activity.slice(1)}` : ""}.` })),
        after: "I dettagli concreti vengono dalla biografia d'ingresso; per gli interessi emersi con ROSS c'è solo la categoria.",
        residents: rows.map(({ r }) => r.id),
        sources: [src.data("Ultimi 30 giorni"), src.bio("Famiglia e struttura")],
      };
    },
  },
  {
    // Educatrice: in quali fasce della giornata ROSS parla meno con gli ospiti.
    id: "momenti",
    keywords: ["momenti della giornata", "parlano meno", "fascia", "fasce", "orari"],
    answer: ({ state }) => {
      const heatmap = buildTeamReport(state, "7").heatmap;
      const totals = heatmap[0].cells.map((cell, index) => ({ label: cell.label, count: heatmap.reduce((sum, day) => sum + day.cells[index].count, 0) }));
      const min = Math.min(...totals.map((t) => t.count));
      const low = totals.filter((t) => t.count === min).map((t) => t.label);
      return {
        text: `Negli ultimi 7 giorni ${low.length > 1 ? `le fasce con meno conversazioni con ROSS sono ${low.join(" e ")}` : `la fascia con meno conversazioni con ROSS è ${low[0]}`} (${min} ciascuna). Sono momenti in cui una proposta vostra, o un invito di ROSS, può fare la differenza.`,
        bullets: totals.map((t) => ({ tag: t.label, text: `${t.count} conversazioni in 7 giorni` })),
        residents: [],
        sources: [src.data("Ultimi 7 giorni · tutti gli ospiti")],
        action: { label: "Apri la Panoramica", to: "/panoramica" },
      };
    },
  },
  {
    id: "carlo-chiusura",
    keywords: ["chiud", "isolat", "ritirat"],
    // Carlo usa ROSS come uno strumento pratico: parlarci poco non è un segnale.
    answer: ({ role }) => ({
      text: byRole(role, {
        psicologa: "Non posso dirlo: ROSS non interpreta l'umore di nessuno. Posso dirti che nell'uso di ROSS non è cambiato nulla: Carlo lo usa come uno strumento pratico, con domande brevi al mattino, come ha sempre fatto. Quando chiacchiera il buonumore è quello di sempre. Che parli poco con ROSS è il suo modo, non un segnale: le cose importanti le dice alle persone, ed è lì che va osservato.",
        staff: "Con ROSS non è cambiato nulla: Carlo lo usa per cose pratiche (il tempo, il programma della giornata, qualche promemoria), con domande brevi al mattino, come sempre. Parla poco con ROSS perché è il suo modo: le cose importanti le dice a voi.",
      }),
      bullets: [{ tag: "Va bene", text: "Buonumore stabile, in linea con la sua media." }, { tag: "Come usa ROSS", text: "Come uno strumento pratico, non come un compagno: va bene così." }],
      residents: ["carlo"],
      sources: [src.data("Ultimi 14 giorni · media personale")],
      action: { label: "Apri Carlo", to: "/ospiti/carlo?tab=conversazioni" },
    }),
  },
  {
    // La struttura chiede a ROSS di proporre un'attività all'ospite. ROSS la propone solo in modalità Attiva.
    id: "proponi",
    keywords: ["proponi a", "proponi ad", "proponigli", "proponile", "fai proporre", "chiedi a ross di proporre", "invita "],
    answer: ({ state, role, resident, q }) => {
      if (!resident) return { text: "A chi vuoi che ROSS la proponga? Scrivi il nome dell'ospite, per esempio «Proponi ad Antonio la radio in compagnia».", residents: [], sources: [] };
      const name = firstName(resident);
      const options = suggestedActivities[resident.id] || [];
      const activity = options.find((a) => normalize(a.title).split(/[^a-z]+/).filter((w) => w.length > 3).some((w) => q.includes(w))) || options[0];
      if (!activity) return { text: `Per ${name} non ci sono attività in calendario vicine ai suoi interessi.`, residents: [resident.id], sources: [] };
      const r = relating[resident.id];
      if (resident.mode !== "Attiva") {
        return {
          warning: true,
          text: `Non posso mandarla: con ${name} ROSS è in modalità ${resident.mode.toLowerCase()}, quindi non propone nulla di sua iniziativa${resident.mode === "Silenziosa" ? " e rispetta il suo riposo" : ""}. L'invito non gli arriverebbe.`,
          bullets: [
            { tag: "Di persona", text: `Puoi proporgliela tu: «${activity.title}», ${activity.when.toLowerCase()}, ${activity.where.toLowerCase()}.${r ? ` Momento migliore: ${r.bestTime}.` : ""}` },
            { tag: "Modalità", text: `Se ${name} è d'accordo, dal suo ritratto si può passare alla modalità attiva. La modalità si sceglie con lui, non per lui.` },
          ],
          residents: [resident.id],
          sources: [src.data(`Modalità ${resident.mode.toLowerCase()}`), src.data("Calendario della residenza")],
          action: { label: `Apri il ritratto di ${name}`, to: `/ospiti/${resident.id}?tab=avvicinare` },
        };
      }
      const already = (state.rossInvites || []).some((i) => i.residentId === resident.id && i.activityId === activity.id);
      return {
        text: already
          ? `L'avevi già chiesto: ROSS proporrà a ${name} «${activity.title}» (${activity.when}, ${activity.where}) nel suo momento migliore.`
          : byRole(role, {
            staff: `Va bene: ROSS proporrà a ${name} «${activity.title}» (${activity.when}, ${activity.where})${r ? `, ${r.bestTime}` : ""}. Glielo dirà così:`,
            direzione: `ROSS proporrà a ${name} «${activity.title}» (${activity.when}). Glielo dirà così:`,
          }),
        bullets: [{ tag: "ROSS", text: `«${activity.invite}»` }],
        after: `Decide ${name}. Un sì non è una prenotazione; se vorrà essere accompagnato, ROSS ve lo dice con il suo permesso. Un no resta suo e non viene segnalato a nessuno.`,
        effect: already ? null : { type: "invite", residentId: resident.id, activityId: activity.id, title: activity.title, when: activity.when },
        residents: [resident.id],
        sources: [src.data("Calendario della residenza"), src.bio("Interessi")],
        action: { label: `Come avvicinarsi a ${name}`, to: `/ospiti/${resident.id}?tab=avvicinare` },
      };
    },
  },
  {
    // Spunti di ROSS per invogliare alla vita della residenza (Antonio, ma anche Lucia, Bruno, Ada).
    id: "invogliare",
    keywords: ["invogli", "stimol", "motivar", "spronar", "uscire dalla stanza", "far uscire"],
    answer: ({ state, role, resident }) => {
      const target = resident || state.residents.find((r) => r.id === "antonio");
      const tips = rossTips[target.id];
      if (!tips) return relating[target.id] ? relatingAnswer(state, role, target) : null;
      return {
        text: tips.intro,
        bullets: tips.tips.map((t) => ({ tag: t.title, text: `${t.text} Perché: ${t.why.charAt(0).toLowerCase()}${t.why.slice(1)}` })),
        after: tips.ross,
        residents: [target.id],
        sources: [src.data("Ultimi 30 giorni · inviti e andamento rispetto alla sua media"), src.bio("Interessi")],
        action: { label: `Apri il ritratto di ${firstName(target)}`, to: `/ospiti/${target.id}` },
      };
    },
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
        action: { label: "Apri la Panoramica", to: "/panoramica" },
      };
    },
  },
  {
    id: "baseline",
    keywords: ["baseline", "conoscendo", "ambient", "nuovo ospite", "arrivat", "appena entrat"],
    answer: ({ state, role }) => {
      const ada = state.residents.find((r) => r.id === "ada");
      return {
        text: byRole(role, {
          direzione: "Ada Moretti è l'unica ospite che ROSS sta ancora conoscendo: è con ROSS da 11 giorni, per una media personale ne servono circa 14.",
          staff: "Ada è con ROSS da 11 giorni: ROSS la sta ancora conoscendo. Con lei funzionano conversazioni brevi al mattino; tra i suoi interessi c'è la poesia.",
          psicologa: "Ada è con ROSS da 11 giorni: troppo presto per confronti con una sua media. Conversazioni brevi e regolari al mattino.",
        }),
        bullets: needsFor("ada").map((n) => ({ tag: "Bisogno", text: n.text })),
        residents: [ada.id],
        sources: [src.data("11 giorni · media in formazione"), src.bio("Interessi")],
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
