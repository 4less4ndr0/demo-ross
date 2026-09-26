import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { DEMO_TODAY, insights } from "../data/demoData";
import { themes } from "../data/chatScript";
import { useDemo } from "../state/DemoContext";
import { Avatar, InfoTip } from "./Common";

const insightQuestions = { i1: "Come sta Elena?", i2: "Carlo si sta chiudendo?", i3: "Quali ricordi sono da verificare?", i4: "Come stanno usando ROSS gli ospiti?" };

// Insight aggregati mostrati nella sidebar della chat: ogni voce fa una domanda alla chat tramite l'evento "ross:ask".
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
  const pending = state.memories.filter((m) => m.status !== "Confermata").length;
  const engagement = [...state.residents].sort((a, b) => (b.delta ?? -9) - (a.delta ?? -9));
  const journey = state.rossJourney;

  return (
    <>
        <div className="ask-rail-head"><div><span className="eyebrow">IL POLSO DI ROSS</span><h2>Com'è andata oggi</h2></div></div>
        {journey.completedAt && <button className="ask-journey" onClick={() => journey.confirmedAt ? go("/ospiti/elena?tab=memorie") : onAsk("Cosa è emerso oggi con Elena?")}>
          <span><Sparkles size={16} /></span><div><small>NUOVO DA ROSS · ELENA</small><strong>{journey.confirmedAt ? "Il ricordo della macchina fotografica di Paolo è confermato." : "È emerso un nuovo ricordo su Cefalù."}</strong></div><ArrowRight size={15} />
        </button>}
        <div className="ask-stats">
          <div><strong>{talkedToday}<small>/{state.residents.length}</small></strong><span>ospiti hanno parlato con ROSS</span></div>
          <div><strong>{minutes}<small> min</small></strong><span>di conversazione</span></div>
          <div><strong>{pending}</strong><span>ricordi da verificare</span></div>
        </div>
        <section className="ask-rail-section">
          <h3>Come ingaggiano con ROSS <InfoTip label="Rispetto a cosa?" text="Ogni ospite è confrontato solo con la propria media degli ultimi 14 giorni." /></h3>
          {engagement.map((r) => <button key={r.id} className="ask-engage" onClick={() => onAsk(`Come sta ${r.name.split(" ")[0]}?`)}>
            <Avatar resident={r} size="sm" /><span>{r.name}</span>
            {r.delta == null ? <small className="ask-delta building">in costruzione</small> : <small className={`ask-delta ${r.delta >= 0 ? "up" : "down"}`}>{r.delta >= 0 ? "+" : ""}{r.delta.toFixed(1)}</small>}
          </button>)}
        </section>
        <section className="ask-rail-section">
          <h3>Di cosa parlano</h3>
          <div className="ask-themes">{themes.map((t) => <button key={t.label} onClick={() => onAsk(`Chi parla di ${t.label.toLowerCase()}?`)}>{t.label}<small>{t.count}</small></button>)}</div>
        </section>
        <section className="ask-rail-section">
          <h3>ROSS ha notato</h3>
          {insights.map((item) => <button key={item.id} className="ask-noticed" onClick={() => onAsk(insightQuestions[item.id])}><span className={`insight-dot tone-${item.tone}`} /><div><small>{item.category} · {item.period}</small><strong>{item.title}</strong></div></button>)}
        </section>
        <div className="local-note"><span className="leaf-mark">R</span><div><strong>Elaborazione locale</strong><p>ROSS si affianca al gestionale: non lo sostituisce e non ne duplica i dati.</p></div></div>
    </>
  );
}
