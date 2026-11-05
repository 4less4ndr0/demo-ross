import { useId, useState } from "react";
import { Heart, Eye, HandHelping, Leaf, MessageCircle, Send, Sparkles } from "lucide-react";
import { needsFor, presenceFor, rossTips, signalsFor, usageStyle } from "../data/careInsights";
import { narrativeFor } from "../data/reportNarrative";
import { graphKind, graphStatus, interestGraph } from "../data/interestGraph";
import { dayAndTime, dayLabel, highlightKinds, rossHighlights } from "../data/highlights";
import { receptions, spuntoHistory } from "../data/channel";
import { useChannel } from "../state/channelStore";
import { residentPhoto } from "./Common";
import { Button } from "./ui";

// Struttura 2.0: «Come sta» e «Con ROSS» raccontano, non misurano (decisione del 05/11/2026).
// Qualità, non quantità: niente grafici, minuti, percentuali, tabelle o conteggi «X su Y».
// Ognuno è confrontato solo con sé stesso; ROSS segnala, lo staff osserva di persona e decide.

export const modeMeaning = {
  Attiva: ["«Proponimi tu»", "ROSS può proporre attività e inviti, anche quelli che gli chiede la struttura."],
  Reattiva: ["«Quando ti chiamo»", "ROSS risponde quando lo chiamano, ma non propone nulla di sua iniziativa: gli inviti della struttura non partono."],
  Silenziosa: ["«Stai in silenzio»", "ROSS non avvia nulla e rispetta il riposo: nessun invito parte."],
};

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
// L'andamento detto a parole, rispetto alla sua media: mai il numero.
const trendWords = (s) => ({ "in aumento": "più del solito", stabile: "come sempre", nuovo: "da questa settimana", "prime settimane": "fin dai primi giorni" }[s.trend] || s.trend);
const presenceWords = (p) => p.kind === "assenza" ? "Oggi non ha ancora parlato con ROSS, di solito a quest'ora sì" : "A volte ha fatto fatica a seguire il filo: ROSS ha rallentato e semplificato";
const list = (items) => items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} e ${items.at(-1)}`;

export function HowIsV2({ resident, onPropose, onProposeText }) {
  const name = resident.name.split(" ")[0];
  const story = narrativeFor(resident.id);
  const own = signalsFor(resident.id);
  const good = own.filter((s) => s.positive).map((s) => `${capitalize(s.signal)}, ${trendWords(s)}`);
  const watch = [...own.filter((s) => !s.positive).map((s) => `${capitalize(s.signal)}, ${trendWords(s)}`), ...presenceFor(resident.id).map(presenceWords)];
  const asked = needsFor(resident.id).map((n) => n.text);
  const tips = rossTips[resident.id];

  return <div className="v2-portrait">
    <article className="v2-story surface">
      <span className="eyebrow">IN QUESTI GIORNI</span>
      <h2>{story.headline}</h2>
      <p>{story.presence}</p>
    </article>

    <div className="v2-three">
      <section className="v2-note is-good"><h3><Heart size={17} />Cosa va bene</h3>{good.length ? <ul>{good.map((t) => <li key={t}>{t}</li>)}</ul> : <p>ROSS lo sta ancora scoprendo.</p>}</section>
      <section className="v2-note is-watch"><h3><Eye size={17} />Da osservare di persona</h3>{watch.length ? <ul>{watch.map((t) => <li key={t}>{t}</li>)}</ul> : <p>Niente di particolare rispetto al solito.</p>}</section>
      <section className="v2-note is-asked"><h3><HandHelping size={17} />Ha chiesto</h3>{asked.length ? <ul>{asked.map((t) => <li key={t}>{t}</li>)}</ul> : <p>Niente di particolare in questi giorni.</p>}</section>
    </div>

    <InterestMap resident={resident} onProposeText={onProposeText} />

    <section className="v2-todo surface">
      <span className="eyebrow">COSA PUOI FARE</span>
      <h3>{story.next}</h3>
      {tips && <ul>{tips.tips.map((t) => <li key={t.title}><b>{t.title}.</b> {t.text}</li>)}</ul>}
      <Button variant="outline" onClick={onPropose}><Send size={15} /> Proponi uno spunto per {name}</Button>
    </section>

    <p className="v2-footnote"><Leaf size={15} />Niente conteggi né andamenti: ROSS racconta come sta {name} rispetto a sé, e la mappa mostra dove ci sono occasioni. Lo staff verifica di persona; non è un giudizio sulla salute.</p>
  </div>;
}

// «Con ROSS» come feed: i momenti più interessanti emersi con ROSS, giorno per giorno, i più recenti in alto.
// Uniscono i momenti di ogni ospite (highlights.js), ciò che ROSS ha restituito nel canale e gli spunti passati.
const toneIcon = { good: Sparkles, neutral: MessageCircle, watch: Eye };
export function WithRossV2({ resident, onPropose }) {
  const name = resident.name.split(" ")[0];
  const usage = usageStyle[resident.id];
  const [said] = modeMeaning[resident.mode] || modeMeaning.Reattiva;
  const channel = useChannel();
  const kinds = usage ? [...usage.mix].sort((x, y) => y[1] - x[1]).map(([label]) => label.toLowerCase()) : [];
  const enjoys = kinds.length ? `Soprattutto ${list(kinds.slice(0, 2))}${kinds.length > 2 ? `; a volte ${list(kinds.slice(2))}` : ""}.` : "";

  const fromChannel = channel.insights.filter((i) => i.residentId === resident.id).map((i) => ({ id: i.id, ...dayAndTime(i.when), kind: i.spunto ? "spunto" : "spontaneo", reception: i.reception, title: i.spunto ? `«${i.spunto.text}»` : i.story, text: i.spunto ? i.story : "", suggestion: i.suggestion, fresh: i.state === "nuovo" }));
  const fromHistory = spuntoHistory.filter((h) => h.residentId === resident.id).map((h) => ({ id: h.id, ...dayAndTime(h.when), kind: "spunto", reception: h.reception, title: `«${h.text}»`, text: h.story }));
  const own = (rossHighlights[resident.id] || []).map((h, i) => ({ id: `hl-${resident.id}-${i}`, ...h }));
  const items = [...own, ...fromChannel, ...fromHistory].sort((x, y) => x.day - y.day || (y.time || "").localeCompare(x.time || ""));
  const days = items.reduce((acc, it) => { const key = it.day; (acc[key] = acc[key] || []).push(it); return acc; }, {});

  return <div className="v2-portrait">
    <article className="v2-story v2-story-compact surface">
      <div><span className="eyebrow">COME VIVE ROSS</span><h2>{usage ? usage.title : `ROSS e ${name} si stanno conoscendo`}</h2>{usage && <p>{usage.text}</p>}</div>
      <aside>
        {enjoys && <p><b>Cosa fa volentieri</b>{enjoys}</p>}
        <p><b>Modalità</b>{resident.mode} · {said}, scelta da {name}</p>
        <Button variant="outline" onClick={onPropose}><Send size={15} /> Proponi uno spunto</Button>
      </aside>
    </article>

    <section className="v2-feed">
      <header><span className="eyebrow">I MOMENTI DA RICORDARE</span><h2>Cosa è emerso con ROSS, giorno per giorno</h2><p>Le cose più interessanti, non tutte le conversazioni: iniziative, uscite raccontate, scelte, interessi e ciò che è da guardare di persona.</p></header>
      {Object.keys(days).sort((x, y) => x - y).map((day) => { const [label, date] = dayLabel(Number(day)); return <div key={day} className="v2-feed-day">
        <h3>{label}{date && <small>{date}</small>}</h3>
        <ol>{days[day].map((it) => { const k = highlightKinds[it.kind]; const Icon = toneIcon[k.tone]; return <li key={it.id} className={`v2-feed-item is-${k.tone}`}>
          <time>{it.time && it.time !== "adesso" ? it.time : it.time === "adesso" ? "Adesso" : ""}</time>
          <span className="v2-feed-dot"><Icon size={14} /></span>
          <div className="v2-feed-card">
            <div className="v2-feed-meta"><span>{k.label}</span>{it.reception && <em className={`s2-reception is-${it.reception}`}>{receptions[it.reception]}</em>}{it.fresh && <em className="s2-new">Nuovo</em>}</div>
            <p className="v2-feed-title">{it.title}</p>
            {it.text && <p className="v2-feed-text">{it.text}</p>}
            {it.suggestion && <p className="v2-feed-suggestion"><b>Cosa puoi fare.</b> {it.suggestion}</p>}
          </div>
        </li>; })}</ol>
      </div>; })}
    </section>

    <p className="v2-footnote"><Leaf size={15} />Non contiamo i minuti: più tempo con ROSS non è un buon segno se non cresce anche il tempo con le persone. Il contenuto delle conversazioni resta tra ROSS e {name}.</p>
  </div>;
}

// La mappa dei legami: la persona al centro, i suoi interessi, e attorno attività, ricordi, eventi e persone
// della residenza collegati, colorati per come è andato lo spunto. Un supporto per proporre meglio, mai il centro.
const advice = {
  volentieri: "È piaciuto: si può riproporre, magari con qualcuno.",
  pensa: "Ci sta pensando: un invito di persona può aiutare.",
  no: "Non è piaciuto, o non era il momento: meglio non insistere.",
  prova: "Non è ancora stato proposto.",
};
const wrap = (text, max = 22) => text.split(" ").reduce((lines, word) => { const last = lines[lines.length - 1]; if (last && (last + " " + word).length <= max) lines[lines.length - 1] = `${last} ${word}`; else lines.push(word); return lines; }, []).slice(0, 3);

function InterestMap({ resident, onProposeText }) {
  const clip = useId().replace(/:/g, "");
  const name = resident.name.split(" ")[0];
  const data = interestGraph[resident.id];
  const [selected, setSelected] = useState(null);
  if (!data) return null;
  const W = 880, H = 540, cx = W / 2, cy = H / 2, R1 = 130, R2 = 225;
  const n = data.interests.length;
  const nodes = data.interests.map((interest, i) => {
    const angle = (-90 + (i * 360) / n) * (Math.PI / 180);
    const k = interest.links.length;
    return { ...interest, x: cx + R1 * Math.cos(angle), y: cy + R1 * Math.sin(angle),
      links: interest.links.map((link, j) => { const a = angle + ((j - (k - 1) / 2) * 30 * Math.PI) / 180; return { ...link, interest: interest.label, id: `${i}-${j}`, a, x: cx + R2 * Math.cos(a), y: cy + R2 * Math.sin(a) }; }) };
  });
  const all = nodes.flatMap((nd) => nd.links);
  // Il riquadro si stringe attorno ai punti, così non resta spazio vuoto.
  const ys = [cy - 44, cy + 44, ...nodes.map((nd) => nd.y), ...all.map((l) => l.y)];
  const top = Math.max(0, Math.min(...ys) - 64), bottom = Math.min(H, Math.max(...ys) + 64);
  const current = all.find((l) => l.id === selected);
  const photo = residentPhoto(resident);
  const person = (id) => residentPhoto({ id });

  return <section className="v2-map surface">
    <span className="eyebrow">COSA LEGA {name.toUpperCase()} ALLA VITA DELLA RESIDENZA</span>
    <h3>I suoi interessi, e dove possono portar{["carlo", "mario", "antonio", "bruno"].includes(resident.id) ? "lo" : "la"}</h3>
    <p className="v2-map-lead">Attività, ricordi, eventi e persone collegati a ciò che {name} ama. Il colore dice com'è andato lo spunto; il tratteggio, cosa resta da provare. Tocca un punto per sapere di più.</p>
    <svg viewBox={`0 ${top} ${W} ${bottom - top}`} className="v2-map-svg" role="img" aria-label={`Mappa dei legami di ${name}: ${nodes.map((nd) => `${nd.label}, collegato a ${nd.links.map((l) => `${l.label} (${graphStatus[l.status].label.toLowerCase()})`).join(", ")}`).join("; ")}`}>
      <defs><clipPath id={`c-${clip}`}><circle cx={cx} cy={cy} r="40" /></clipPath></defs>
      {nodes.map((nd) => <line key={nd.label} x1={cx} y1={cy} x2={nd.x} y2={nd.y} className="v2-map-spoke" />)}
      {all.map((l) => { const from = nodes.find((nd) => nd.label === l.interest); return <line key={l.id} x1={from.x} y1={from.y} x2={l.x} y2={l.y} stroke={graphStatus[l.status].color} strokeWidth={selected === l.id ? 4 : 2.5} strokeDasharray={l.status === "prova" ? "6 6" : undefined} strokeLinecap="round" />; })}
      <circle cx={cx} cy={cy} r="44" className="v2-map-center" />
      {photo ? <image href={photo} x={cx - 40} y={cy - 40} width="80" height="80" clipPath={`url(#c-${clip})`} preserveAspectRatio="xMidYMid slice" /> : <text x={cx} y={cy + 6} textAnchor="middle" className="v2-map-initials">{resident.initials}</text>}
      {nodes.map((nd) => { const w = Math.max(90, nd.label.length * 7.6 + 28); return <g key={nd.label}><rect x={nd.x - w / 2} y={nd.y - 17} width={w} height="34" rx="17" className="v2-map-interest" /><text x={nd.x} y={nd.y + 5} textAnchor="middle" className="v2-map-interest-label">{nd.label}</text></g>; })}
      {all.map((l) => {
        const cos = Math.cos(l.a); const sin = Math.sin(l.a);
        const anchor = cos > 0.25 ? "start" : cos < -0.25 ? "end" : "middle";
        const lines = wrap(l.label);
        const tx = l.x + (anchor === "start" ? 20 : anchor === "end" ? -20 : 0);
        const ty = anchor === "middle" ? (sin < 0 ? l.y - 24 - (lines.length - 1) * 16 : l.y + 32) : l.y + 5 - ((lines.length - 1) * 16) / 2;
        const img = l.person && person(l.person);
        return <g key={l.id} className={`v2-map-node${selected === l.id ? " is-selected" : ""}`} role="button" tabIndex="0" aria-label={`${l.label}: ${graphStatus[l.status].label}`} onClick={() => setSelected(selected === l.id ? null : l.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(selected === l.id ? null : l.id); } }}>
          {img ? <><clipPath id={`p-${clip}-${l.id}`}><circle cx={l.x} cy={l.y} r="14" /></clipPath><circle cx={l.x} cy={l.y} r="16" fill={graphStatus[l.status].color} /><image href={img} x={l.x - 14} y={l.y - 14} width="28" height="28" clipPath={`url(#p-${clip}-${l.id})`} preserveAspectRatio="xMidYMid slice" /></>
            : <circle cx={l.x} cy={l.y} r="11" fill={l.status === "prova" ? "var(--surface)" : graphStatus[l.status].color} stroke={graphStatus[l.status].color} strokeWidth="3" />}
          <text x={tx} y={ty} textAnchor={anchor} className="v2-map-label">{lines.map((line, i) => <tspan key={line} x={tx} dy={i ? 16 : 0}>{line}</tspan>)}</text>
        </g>;
      })}
    </svg>
    <ul className="v2-map-list">{nodes.map((nd) => <li key={nd.label}><strong>{nd.label}</strong><div>{nd.links.map((l) => <button type="button" key={l.id} className={`is-${l.status}`} aria-pressed={selected === l.id} onClick={() => setSelected(selected === l.id ? null : l.id)}>{l.label}</button>)}</div></li>)}</ul>
    <div className="v2-map-legend">{Object.entries(graphStatus).map(([id, s]) => <span key={id}><i style={{ background: id === "prova" ? "transparent" : s.color, borderColor: s.color, borderStyle: id === "prova" ? "dashed" : "solid" }} />{s.label}</span>)}</div>
    {current ? <div className="v2-map-detail" role="status">
      <div><small>{graphKind[current.kind]} · legato a «{current.interest}»</small><strong>{current.label}</strong><p><b style={{ color: graphStatus[current.status].color }}>{graphStatus[current.status].label}.</b> {advice[current.status]}</p></div>
      {current.status !== "no" && <Button variant={current.status === "prova" ? "default" : "outline"} onClick={() => onProposeText(current.label, current.kind)}><Send size={15} /> {current.status === "prova" ? "Proponilo come spunto" : "Riproponilo"}</Button>}
    </div> : data.other.length > 0 && <p className="v2-map-other">Fuori dai suoi interessi: {data.other.map((o) => `${o.label.toLowerCase()} (${graphStatus[o.status].label.toLowerCase()})`).join(", ")}. Le proposte che non toccano ciò che {name} ama funzionano meno.</p>}
  </section>;
}
