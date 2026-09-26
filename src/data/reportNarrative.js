import { DEMO_TODAY } from "./demoData";
import { approachGuide, byAttention, facilityVoice, groupByResident, hooksFor, journeyInterest, needs, needsFor, presenceFor, presenceNotes, relating, signals, signalsFor, trendOf } from "./careInsights";

// Report "Come sta" per l'équipe (docs/contratto-informativo-struttura.md):
// come sta e di cosa ha bisogno l'ospite, mai di cosa ha parlato. Nessuna citazione, nessun argomento.
const profiles = {
  elena: { headline: "Ha espresso serenità e partecipa volentieri: musica e fotografie la coinvolgono.", presence: "Elena partecipa volentieri alle conversazioni con ROSS e spesso le avvia lei. Le conversazioni sono lunghe e regolari, soprattutto al mattino e nel tardo pomeriggio.", next: "Proporle un'attività musicale al mattino o di guardare insieme delle fotografie." },
  carlo: { headline: "Ha avviato meno conversazioni negli ultimi giorni: da osservare di persona.", presence: "Carlo di solito risponde a ROSS più che iniziare lui. Negli ultimi quattro giorni ha avviato meno conversazioni del solito e sono più brevi; quando si parte dai suoi interessi la durata torna nella norma.", next: "Passare a salutarlo al mattino e proporgli un commento sullo sport." },
  lucia: { headline: "Partecipa con piacere, ma questa settimana ha espresso più stanchezza del solito.", presence: "Lucia parla spesso con ROSS e chiede lei di ripetere i giochi di parole. Questa settimana ha espresso stanchezza più spesso del solito.", next: "Accompagnarla in giardino, come ha chiesto più volte, e osservare la stanchezza nei prossimi giorni." },
  mario: { headline: "Ritmi lenti e rispettati; ha riferito un fastidio fisico da verificare.", presence: "Mario passa molte ore in modalità silenziosa e ROSS rispetta il suo riposo. Quando parla lo fa senza fretta, con conversazioni lunghe e distese. Questa settimana ha riferito un fastidio fisico.", next: "Chiedergli del ginocchio al mattino e farlo presente a chi se ne occupa se continua." },
  teresa: { headline: "Il periodo migliore del mese: ha espresso serenità e partecipa molto.", presence: "Teresa partecipa più della sua media personale. Le attività di gruppo la coinvolgono e coinvolge a sua volta chi le sta vicino.", next: "Invitarla a proporre un canto per l'attività musicale di gruppo." },
  antonio: { headline: "Conversazioni più lunghe, ma questa settimana ha espresso solitudine.", presence: "Antonio è con ROSS da poco più di un mese. Le conversazioni si stanno allungando; questa settimana ha espresso solitudine più del solito e il desiderio di sentire un familiare.", next: "Facilitare una chiamata con un familiare e passare a trovarlo nel pomeriggio." },
  ada: { headline: "Primi passi con ROSS: la sta ancora conoscendo.", presence: "Ada è con ROSS da 11 giorni, quindi non è ancora possibile un confronto con la sua media personale. Finora ha fatto conversazioni brevi e regolari, soprattutto al mattino.", next: "Invitarla all'attività di lettura, come ha chiesto." },
  bruno: { headline: "Partecipazione stabile; ha riferito di avere freddo nel pomeriggio.", presence: "Bruno alterna periodi di quiete a conversazioni lunghe e articolate. La partecipazione è stabile, appena sopra la sua media, e questa settimana ha avuto più voglia di raccontare.", next: "Verificare la temperatura della stanza nel pomeriggio." },
};

const fallback = { headline: "Relazione con ROSS in costruzione.", presence: "Le interazioni con ROSS sono ancora poche per un quadro completo.", next: "Proseguire con conversazioni brevi sui suoi interessi." };

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
  const building = resident.participation == null;
  const r = relating[resident.id];
  const newInterest = resident.id === journeyInterest.residentId && state.rossJourney.completedAt;

  const trend = building
    ? `Per ora questi numeri raccontano l'inizio della conoscenza, non ancora un andamento.`
    : resident.delta >= 0.5 ? `Rispetto alla sua media personale ${name} ha partecipato più del solito (+${resident.delta.toFixed(1)}).`
    : resident.delta > 0 ? `L'andamento è stabile, leggermente sopra la sua media personale (+${resident.delta.toFixed(1)}).`
    : resident.delta <= -0.3 ? `Rispetto alla sua media personale ${name} ha partecipato meno del solito (${resident.delta.toFixed(1)}). È un segnale da osservare di persona, non un giudizio.`
    : `L'andamento è stabile, in linea con la sua media personale (${resident.delta.toFixed(1)}).`;

  return {
    headline: profile.headline,
    paragraphs: [profile.presence, [trend, newInterest ? `Dall'ultima conversazione è emerso un nuovo interesse: ${journeyInterest.label.toLowerCase()}.` : null].filter(Boolean).join(" ")],
    kpis: [
      [interactions.length, "conversazioni con ROSS"],
      [`${minutes} min`, "tempo insieme"],
      [interactions.length ? `${Math.round(minutes / interactions.length)} min` : "—", "durata media"],
      [trendOf(resident).label, "partecipazione"],
      [r ? r.bestTime : "—", "momento migliore"],
    ],
    signals: signalsFor(resident.id),
    needs: needsFor(resident.id),
    presenceNotes: presenceFor(resident.id),
    relating: r,
    firstStep: approachGuide[resident.id]?.firstSteps[0] || null,
    firstSteps: approachGuide[resident.id]?.firstSteps || [],
    hooks: hooksFor(resident.id, { withJourney: Boolean(state.rossJourney.completedAt) }).slice(0, 2),
    trend: trendOf(resident),
    // Da osservare in équipe: ROSS segnala, lo staff osserva e decide.
    checklist: [
      ...presenceFor(resident.id).map((p) => p.kind === "assenza" ? "Oggi non ha ancora parlato con ROSS: passare a salutarlo" : "Momenti di difficoltà in conversazione: osservare se succede anche nelle attività"),
      ...signalsFor(resident.id).filter((x) => !x.positive).map((x) => `${x.signal.charAt(0).toUpperCase()}${x.signal.slice(1)} (${x.trend}): osservare di persona nei prossimi giorni`),
      ...needsFor(resident.id).map((n) => `${n.text}: chi se ne occupa?`),
    ],
    // Da valorizzare: ciò che va bene e su cui costruire.
    valorize: signalsFor(resident.id).filter((x) => x.positive).map((x) => `${x.signal.charAt(0).toUpperCase()}${x.signal.slice(1)} (${x.trend}): dirlo in équipe e costruirci sopra un'attività`),
    newInterest: newInterest ? journeyInterest : null,
    next: profile.next,
    series: seriesFor(resident, Number(period)),
    building,
  };
}

export function reportSummary(state, resident) {
  return buildResidentReport(state, resident, "30").headline;
}

// Riepilogo d'équipe: la situazione della struttura sui cinque punti cardinali.
const weekdays = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const bands = [["9–11", 9, 11], ["11–13", 11, 13], ["13–15", 13, 15], ["15–18", 15, 18]];
const lower = (text) => `${text.charAt(0).toLowerCase()}${text.slice(1)}`;

export function buildTeamReport(state, period) {
  const from = cutoff(period);
  const residents = state.residents;
  const nameOf = (id) => residents.find((r) => r.id === id)?.name.split(" ")[0] || "Ospite";
  const interactions = state.interactions.filter((i) => i.date >= from && i.date <= DEMO_TODAY);
  const minutes = interactions.reduce((sum, i) => sum + i.duration, 0);
  const talked = new Set(interactions.map((i) => i.residentId)).size;
  const toWatch = residents.filter((r) => signalsFor(r.id).some((x) => !x.positive) || presenceFor(r.id).length);
  const going = signals.filter((x) => x.positive);
  const goingResidents = new Set(going.map((x) => x.residentId));
  const emerged = residents.reduce((sum, r) => sum + (relating[r.id]?.interests.filter(([, source]) => source === "Emerso con ROSS").length || 0), 0) + (state.rossJourney.completedAt ? 1 : 0);
  const voice = [...facilityVoice].sort((a, b) => b.count - a.count);
  const topPositive = voice.find((v) => v.tone === "positivo");
  const topNegative = voice.find((v) => v.tone === "negativo");

  const distribution = ["up", "flat", "down", "building"].map((tone) => ({ tone, label: { up: "Sopra la propria media", flat: "In linea", down: "Sotto la propria media", building: "ROSS li sta ancora conoscendo" }[tone], count: residents.filter((r) => trendOf(r).tone === tone).length }));
  const signalTypes = Object.values(signals.reduce((acc, x) => { const key = x.signal; acc[key] = acc[key] || { signal: key, positive: Boolean(x.positive), count: 0 }; acc[key].count += 1; return acc; }, {})).sort((a, b) => Number(b.positive) - Number(a.positive) || b.count - a.count);

  const days = Array.from({ length: Number(period) }, (_, index) => {
    const date = new Date(`${DEMO_TODAY}T10:00:00`);
    date.setDate(date.getDate() - (Number(period) - 1 - index));
    const iso = date.toISOString().slice(0, 10);
    return { date: iso.slice(5, 10), minutes: interactions.filter((i) => i.date === iso).reduce((sum, i) => sum + i.duration, 0) };
  });
  const heatmap = [1, 2, 3, 4, 5, 6, 0].map((day) => ({ day: weekdays[day], cells: bands.map(([label, start, end]) => ({ label, count: interactions.filter((i) => new Date(`${i.date}T12:00:00`).getDay() === day && Number(i.time.slice(0, 2)) >= start && Number(i.time.slice(0, 2)) < end).length })) }));

  const rows = byAttention(residents).map((r) => ({
    resident: r,
    headline: (profiles[r.id] || fallback).headline,
    trend: trendOf(r),
    watch: [...presenceFor(r.id).map((p) => p.kind === "assenza" ? "Oggi non ha ancora parlato con ROSS" : "Momenti di difficoltà"), ...signalsFor(r.id).filter((x) => !x.positive).map((x) => `${x.signal} · ${x.trend}`)],
    positive: signalsFor(r.id).filter((x) => x.positive).map((x) => `${x.signal} · ${x.trend}`),
    need: needsFor(r.id)[0]?.text || null,
    next: (profiles[r.id] || fallback).next,
  }));

  // Punti per la riunione: da valorizzare, assenza insolita, tema della voce da migliorare, bisogni ricorrenti, segnali da osservare.
  const rising = going.filter((x) => x.trend === "in aumento");
  const discuss = [
    `Da valorizzare: ${groupByResident(rising, nameOf)}${topPositive ? `; e ${topPositive.count} ospiti apprezzano ${topPositive.text.replace(/^apprezzamento per /, "")}: dirlo a tutto lo staff` : ""}.`,
    ...presenceNotes.filter((p) => p.kind === "assenza").map((p) => `${nameOf(p.residentId)}: ${lower(p.text)} Chi passa a salutarlo?`),
    ...(topNegative ? [`${topNegative.topic} (${topNegative.count} ospiti): ${lower(topNegative.action)}.`] : []),
    ...[...needs].sort((a, b) => b.times - a.times).filter((n) => n.times > 1).slice(0, 2).map((n) => `${nameOf(n.residentId)}: ${lower(n.text)} (espresso ${n.times} volte). Chi se ne occupa?`),
    `${toWatch.length} ospiti con segnali da osservare: confrontare in équipe ciò che si nota di persona.`,
  ];

  return {
    summary: `Negli ultimi ${period} giorni ${talked} ospiti su ${residents.length} hanno parlato con ROSS, per ${minutes} minuti complessivi. Questa settimana ${goingResidents.size} ospiti su ${residents.length} hanno espresso qualcosa di positivo rispetto alla propria media; ${toWatch.length} hanno anche aspetti da osservare o un'assenza insolita.${topPositive && topNegative ? ` Sulla vita in struttura, i temi più sentiti sono ${topPositive.text} (${topPositive.count} ospiti) e ${topNegative.text} (${topNegative.count}).` : ""}`,
    kpis: [
      [`${talked}/${residents.length}`, "ospiti con ROSS"],
      [`${minutes} min`, "tempo con ROSS"],
      [goingResidents.size, "con segnali positivi"],
      [toWatch.length, "da osservare"],
      [needs.length, "bisogni da prendere in carico"],
      [emerged, "interessi emersi con ROSS"],
    ],
    distribution, signalTypes, voice, rows, days, heatmap, discuss,
  };
}
