import { useNavigate } from "react-router-dom";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ArrowRight, ChevronDown, Compass, EyeOff, Sparkles } from "lucide-react";
import { facilityVoice, journeyInterest, needs, signals } from "../data/careInsights";
import { useDemo } from "../state/DemoContext";
import { Avatar } from "./Common";

// Guida alla lettura della schermata: raccoglie le spiegazioni che prima erano nei tooltip.
const readingGuide = [
  { title: "La chat", text: "Chiedi di un ospite, di un bisogno o di un documento. Ogni risposta cita la fonte: Dati ROSS, Biografia d'ingresso, Documento o Nota operatore. Le domande consigliate cambiano per Staff (accesso condiviso, senza login), Psicologa e Direzione (accesso personale): si sceglie dalla card in basso a sinistra.", question: "Chi ha bisogno di più attenzione oggi?" },
  { title: "Cosa va bene", text: "Ciò che l'ospite ha espresso di positivo negli ultimi 7 giorni (serenità, buonumore, curiosità, voglia di raccontare…) o che fa più volentieri del solito. ROSS racconta anche questo: è ciò su cui costruire.", question: "Cosa sta andando bene questa settimana?" },
  { title: "Da osservare", text: "Segnali espressi dall'ospite negli ultimi 7 giorni (stanchezza, solitudine, fastidio…), confrontati con la sua media personale. Mai l'argomento o il motivo: il giudizio resta a voi.", question: "Chi ha espresso segnali da osservare questa settimana?" },
  { title: "Bisogni espressi", text: "Ciò che l'ospite ha chiesto per sé (uscire, sentire un familiare, sente freddo…), senza il contesto della conversazione.", question: "Quali bisogni hanno espresso gli ospiti?" },
  { title: "Voce della struttura", text: "Opinioni sulla vita in struttura (pasti, rumore, attività), anonime e aggregate: un tema compare solo se lo esprimono almeno 3 ospiti.", question: "Cosa dicono gli ospiti della vita in struttura?" },
  { title: "Presenza con ROSS", text: "Quanto ogni ospite partecipa alle chiacchierate rispetto alla propria media degli ultimi 14 giorni: + sopra la sua media, − sotto. «Lo sta conoscendo» per chi è arrivato da poco.", question: "Come stanno usando ROSS gli ospiti?" },
  { title: "Ospiti, Report e Panoramica", text: "Dalle schede in alto: il ritratto di ogni ospite (come sta, come avvicinarsi, conversazioni, documenti), il report «Come sta» stampabile di ciascuno e la Panoramica con i grafici sulla struttura, da cui si stampa il Riepilogo d'équipe." },
];

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
  const byId = (id) => state.residents.find((r) => r.id === id);
  const toWatch = signals.filter((s) => !s.positive);
  const going = signals.filter((s) => s.positive);
  const engagement = [...state.residents].sort((a, b) => (b.delta ?? -9) - (a.delta ?? -9));
  const journey = state.rossJourney;

  return (
    <>
      {journey.completedAt && <button className="ask-journey" onClick={() => onAsk("Cosa è emerso oggi con Elena?")}>
        <span><Sparkles size={16} /></span><div><small>NUOVO DA ROSS · ELENA</small><strong>Nuovo interesse emerso: {journeyInterest.label.toLowerCase()}.</strong></div><ArrowRight size={15} />
      </button>}
      <AccordionPrimitive.Root type="multiple" className="rail-accordion">
        <AccordionPrimitive.Item value="osservare" className="rail-item">
          <AccordionPrimitive.Header className="rail-item-head">
            <AccordionPrimitive.Trigger className="rail-item-trigger"><span>Da osservare</span><small className="rail-count">{toWatch.length}</small><ChevronDown size={16} className="rail-chevron" /></AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="rail-item-content"><div className="rail-item-body">
        {toWatch.map((s) => { const r = byId(s.residentId); return <button key={s.residentId} className="ask-engage" onClick={() => onAsk(`Come sta ${r.name.split(" ")[0]}?`)}>
          <Avatar resident={r} size="sm" /><span>{r.name}</span><small className="ask-delta down">{s.signal}</small>
        </button>; })}
          </div></AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
        <AccordionPrimitive.Item value="bene" className="rail-item">
          <AccordionPrimitive.Header className="rail-item-head">
            <AccordionPrimitive.Trigger className="rail-item-trigger"><span>Cosa va bene</span><small className="rail-count">{going.length}</small><ChevronDown size={16} className="rail-chevron" /></AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="rail-item-content"><div className="rail-item-body">
        {going.map((s) => { const r = byId(s.residentId); return <button key={s.residentId + s.signal} className="ask-engage" onClick={() => onAsk(`Come sta ${r.name.split(" ")[0]}?`)}>
          <Avatar resident={r} size="sm" /><span>{r.name}</span><small className="ask-delta up">{s.signal}</small>
        </button>; })}
          </div></AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
        <AccordionPrimitive.Item value="bisogni" className="rail-item">
          <AccordionPrimitive.Header className="rail-item-head">
            <AccordionPrimitive.Trigger className="rail-item-trigger"><span>Bisogni espressi</span><small className="rail-count">{needs.length}</small><ChevronDown size={16} className="rail-chevron" /></AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="rail-item-content"><div className="rail-item-body">
        {needs.map((n) => { const r = byId(n.residentId); return <button key={n.residentId + n.text} className="ask-noticed" onClick={() => onAsk(`Quali bisogni ha espresso ${r.name.split(" ")[0]}?`)}>
          <Avatar resident={r} size="sm" /><div><small>{r.name}</small><strong>{n.text}</strong></div>
        </button>; })}
          </div></AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
        <AccordionPrimitive.Item value="voce" className="rail-item">
          <AccordionPrimitive.Header className="rail-item-head">
            <AccordionPrimitive.Trigger className="rail-item-trigger"><span>Voce della struttura</span><small className="rail-count">{facilityVoice.length}</small><ChevronDown size={16} className="rail-chevron" /></AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="rail-item-content"><div className="rail-item-body">
        {facilityVoice.map((v) => <button key={v.topic} className="ask-noticed" onClick={() => onAsk("Cosa dicono gli ospiti della vita in struttura?")}>
          <span className={`insight-dot tone-${v.tone === "positivo" ? "mint" : v.tone === "negativo" ? "coral" : "sand"}`} /><div><small>{v.count} ospiti · {v.period}</small><strong>{v.topic}</strong></div>
        </button>)}
          </div></AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
        <AccordionPrimitive.Item value="ingaggio" className="rail-item">
          <AccordionPrimitive.Header className="rail-item-head">
            <AccordionPrimitive.Trigger className="rail-item-trigger"><span>Presenza con ROSS</span><small className="rail-count">{state.residents.length}</small><ChevronDown size={16} className="rail-chevron" /></AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="rail-item-content"><div className="rail-item-body">
        {engagement.map((r) => <button key={r.id} className="ask-engage" onClick={() => onAsk(`Come sta ${r.name.split(" ")[0]}?`)}>
          <Avatar resident={r} size="sm" /><span>{r.name}</span>
          {r.delta == null ? <small className="ask-delta building">lo sta conoscendo</small> : <small className={`ask-delta ${r.delta >= 0 ? "up" : "down"}`}>{r.delta >= 0 ? "+" : ""}{r.delta.toFixed(1)}</small>}
        </button>)}
          </div></AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
        <AccordionPrimitive.Item value="bussola" className="rail-item compass-card">
          <AccordionPrimitive.Header className="rail-item-head">
            <AccordionPrimitive.Trigger className="rail-item-trigger"><span className="compass-title"><span className="leaf-mark"><Compass size={14} /></span>Cosa ti dice ROSS</span><ChevronDown size={16} className="rail-chevron" /></AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="rail-item-content"><div className="rail-item-body">
        <p className="guide-intro">Come leggere questa schermata. ROSS ti dice come stanno gli ospiti e di cosa hanno bisogno.</p>
        {readingGuide.map((g) => <div className="guide-entry" key={g.title}><strong>{g.title}</strong><span>{g.text}</span>{g.question && <button onClick={() => onAsk(g.question)}>Prova: «{g.question}» <ArrowRight size={12} /></button>}</div>)}
        <p><EyeOff size={13} /> Mai il contenuto delle conversazioni</p>
        <button className="compass-more" onClick={() => go("/impostazioni#privacy")}>Come proteggiamo gli ospiti</button>
          </div></AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      </AccordionPrimitive.Root>
    </>
  );
}
