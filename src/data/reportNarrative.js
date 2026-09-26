import { DEMO_TODAY } from "./demoData";
import { journeyInterest, needsFor, presenceFor, relating, signalsFor } from "./careInsights";

// Report "Come sta" per l'équipe (docs/contratto-informativo-struttura.md):
// come sta e di cosa ha bisogno l'ospite, mai di cosa ha parlato. Nessuna citazione, nessun argomento.
const profiles = {
  elena: { headline: "Serena e partecipe: la musica e le fotografie la coinvolgono.", presence: "Elena partecipa volentieri alle conversazioni con ROSS e spesso le avvia lei. Le conversazioni sono lunghe e regolari, soprattutto al mattino e nel tardo pomeriggio.", next: "Proporle un'attività musicale al mattino o di guardare insieme delle fotografie." },
  carlo: { headline: "Meno iniziativa negli ultimi giorni: da osservare di persona.", presence: "Carlo di solito risponde a ROSS più che iniziare lui. Negli ultimi quattro giorni ha avviato meno conversazioni del solito e sono più brevi; quando si parte dai suoi interessi la durata torna nella norma.", next: "Passare a salutarlo al mattino in sala lettura e proporgli un commento sullo sport." },
  lucia: { headline: "Vivace e propositiva, ma con più stanchezza espressa questa settimana.", presence: "Lucia è tra gli ospiti più presenti nelle conversazioni con ROSS e chiede lei di ripetere i giochi di parole. Questa settimana ha espresso stanchezza più spesso del solito.", next: "Accompagnarla in giardino, come ha chiesto più volte, e osservare la stanchezza nei prossimi giorni." },
  mario: { headline: "Ritmi lenti e rispettati; da verificare un fastidio fisico riferito.", presence: "Mario passa molte ore in modalità silenziosa e ROSS rispetta il suo riposo. Quando parla lo fa senza fretta, con conversazioni lunghe e distese. Questa settimana ha riferito un fastidio fisico.", next: "Chiedergli del ginocchio al mattino e segnalarlo all'infermeria se persiste." },
  teresa: { headline: "Il momento migliore del mese: serena e molto partecipe.", presence: "Teresa è la più partecipe della struttura rispetto alla propria media. Le attività di gruppo la coinvolgono e coinvolge a sua volta chi le sta vicino.", next: "Invitarla a proporre un canto per l'attività musicale di gruppo." },
  antonio: { headline: "Si sta aprendo, ma questa settimana ha espresso solitudine.", presence: "Antonio è con ROSS da poco più di un mese. Le conversazioni si stanno allungando; questa settimana ha espresso solitudine più del solito e il desiderio di sentire un familiare.", next: "Facilitare una chiamata con un familiare e passare a trovarlo nel pomeriggio." },
  ada: { headline: "Primi passi con ROSS: baseline in costruzione.", presence: "Ada è con ROSS da 11 giorni, quindi non è ancora possibile un confronto con la sua media personale. Finora ha fatto conversazioni brevi e regolari, soprattutto al mattino.", next: "Invitarla all'attività di lettura, come ha chiesto." },
  bruno: { headline: "Stabile e riflessivo; sente freddo nel pomeriggio.", presence: "Bruno alterna periodi di quiete a conversazioni lunghe e articolate. La partecipazione è stabile, appena sotto la sua media.", next: "Verificare la temperatura della stanza nel pomeriggio." },
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
    ? `La baseline personale di ${name} è ancora in costruzione: i numeri di questo report descrivono l'avvio, non un andamento.`
    : resident.delta >= 0.5 ? `Rispetto alla sua media personale ${name} è più partecipe del solito (+${resident.delta.toFixed(1)}).`
    : resident.delta > 0 ? `L'andamento è stabile, leggermente sopra la sua media personale (+${resident.delta.toFixed(1)}).`
    : resident.delta <= -0.3 ? `Rispetto alla sua media personale ${name} partecipa meno del solito (${resident.delta.toFixed(1)}). È un segnale da osservare di persona, non una valutazione.`
    : `L'andamento è stabile, in linea con la sua media personale (${resident.delta.toFixed(1)}).`;

  return {
    headline: profile.headline,
    paragraphs: [profile.presence, [trend, newInterest ? `Dall'ultima conversazione è emerso un nuovo interesse: ${journeyInterest.label.toLowerCase()}.` : null].filter(Boolean).join(" ")],
    kpis: [
      [interactions.length, "conversazioni con ROSS"],
      [`${minutes} min`, "tempo insieme"],
      [interactions.length ? `${Math.round(minutes / interactions.length)} min` : "—", "durata media"],
      [building ? "—" : `${resident.participation.toFixed(1)}/10`, "partecipazione"],
      [building ? "in costruzione" : `${resident.delta >= 0 ? "+" : ""}${resident.delta.toFixed(1)}`, "vs sua media"],
      [r ? r.bestTime : "—", "momento migliore"],
    ],
    signals: signalsFor(resident.id),
    needs: needsFor(resident.id),
    presenceNotes: presenceFor(resident.id),
    relating: r,
    newInterest: newInterest ? journeyInterest : null,
    next: profile.next,
    series: seriesFor(resident, Number(period)),
    building,
  };
}

export function reportSummary(state, resident) {
  return buildResidentReport(state, resident, "30").headline;
}
