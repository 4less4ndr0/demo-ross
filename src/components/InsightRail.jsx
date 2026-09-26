import { useNavigate } from "react-router-dom";
import { ArrowRight, Compass, EyeOff, Sparkles } from "lucide-react";
import { DEMO_TODAY } from "../data/demoData";
import { cardinalPoints, facilityVoice, journeyInterest, needs, signals } from "../data/careInsights";
import { useDemo } from "../state/DemoContext";
import { Avatar, InfoTip } from "./Common";

// Insight aggregati nella sidebar della chat (docs/contratto-informativo-struttura.md).
// Ogni voce fa una domanda alla chat tramite l'evento "ross:ask".
export function InsightRail({ onDone }) {
  const { state } = useDemo();
  const navigate = useNavigate();
  const onAsk = (question) => {
    onDone?.();
    window.setTimeout(() => window.dispatchEvent(new CustomEvent("ross:ask", { detail: question })), 0);
  };
  const go = (to) => { onDone?.(); navigate(to); };
  const today = state.interactions.filter((i) => i.date === DEMO_TODAY);
  const talkedToday = new Set(today.map((i) => i.residentId)).size;
  const minutes = today.reduce((sum, i) => sum + i.duration, 0);
  const byId = (id) => state.residents.find((r) => r.id === id);
  const toWatch = signals.filter((s) => !s.positive);
  const engagement = [...state.residents].sort((a, b) => (b.delta ?? -9) - (a.delta ?? -9));
  const journey = state.rossJourney;

  return (
    <>
      <div className="ask-rail-head"><div><span className="eyebrow">IL POLSO DI ROSS</span><h2>Com'è andata oggi</h2></div></div>
      {journey.completedAt && <button className="ask-journey" onClick={() => onAsk("Cosa è emerso oggi con Elena?")}>
        <span><Sparkles size={16} /></span><div><small>NUOVO DA ROSS · ELENA</small><strong>Nuovo interesse emerso: {journeyInterest.label.toLowerCase()}.</strong></div><ArrowRight size={15} />
      </button>}
      <div className="ask-stats">
        <div><strong>{talkedToday}<small>/{state.residents.length}</small></strong><span>ospiti hanno parlato con ROSS</span></div>
        <div><strong>{minutes}<small> min</small></strong><span>di conversazione</span></div>
        <div><strong>{toWatch.length}</strong><span>ospiti da osservare</span></div>
      </div>
      <section className="ask-rail-section">
        <h3>Da osservare questa settimana <InfoTip label="Come si legge" text="Segnali espressi negli ultimi 7 giorni, confrontati con la media della persona. Mai l'argomento o il motivo." /></h3>
        {toWatch.map((s) => { const r = byId(s.residentId); return <button key={s.residentId} className="ask-engage" onClick={() => onAsk(`Come sta ${r.name.split(" ")[0]}?`)}>
          <Avatar resident={r} size="sm" /><span>{r.name}</span><small className="ask-delta down">{s.signal}</small>
        </button>; })}
      </section>
      <section className="ask-rail-section">
        <h3>Bisogni espressi</h3>
        {needs.slice(0, 4).map((n) => { const r = byId(n.residentId); return <button key={n.residentId + n.text} className="ask-noticed" onClick={() => onAsk(`Quali bisogni ha espresso ${r.name.split(" ")[0]}?`)}>
          <Avatar resident={r} size="sm" /><div><small>{r.name}</small><strong>{n.text}</strong></div>
        </button>; })}
      </section>
      <section className="ask-rail-section">
        <h3>Voce della struttura <InfoTip label="Anonima" text="Opinioni sulla vita in struttura, aggregate e anonime: un tema compare solo se lo esprimono almeno 3 ospiti." /></h3>
        {facilityVoice.map((v) => <button key={v.topic} className="ask-noticed" onClick={() => onAsk("Cosa dicono gli ospiti della vita in struttura?")}>
          <span className={`insight-dot tone-${v.tone === "positivo" ? "mint" : v.tone === "negativo" ? "coral" : "sand"}`} /><div><small>{v.count} ospiti · {v.period}</small><strong>{v.topic}</strong></div>
        </button>)}
      </section>
      <section className="ask-rail-section">
        <h3>Come ingaggiano con ROSS <InfoTip label="Rispetto a cosa?" text="Ogni ospite è confrontato solo con la propria media degli ultimi 14 giorni." /></h3>
        {engagement.map((r) => <button key={r.id} className="ask-engage" onClick={() => onAsk(`Come sta ${r.name.split(" ")[0]}?`)}>
          <Avatar resident={r} size="sm" /><span>{r.name}</span>
          {r.delta == null ? <small className="ask-delta building">in costruzione</small> : <small className={`ask-delta ${r.delta >= 0 ? "up" : "down"}`}>{r.delta >= 0 ? "+" : ""}{r.delta.toFixed(1)}</small>}
        </button>)}
      </section>
      <section className="compass-card">
        <header><span className="leaf-mark"><Compass size={15} /></span><div><strong>Cosa ti dice ROSS</strong><small>Come sta e di cosa ha bisogno ogni ospite</small></div></header>
        {cardinalPoints.map((p) => <button key={p.id} onClick={() => onAsk(p.question)} title={p.hint}><span>{p.label}</span><ArrowRight size={13} /></button>)}
        <p><EyeOff size={13} /> Mai il contenuto delle conversazioni</p>
        <button className="compass-more" onClick={() => go("/impostazioni#privacy")}>Come proteggiamo gli ospiti</button>
      </section>
    </>
  );
}
