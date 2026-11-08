import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Eye, HandHelping, Leaf, MessageCircle, Send, Sparkles, Users } from "lucide-react";
import { presenceFor, rossTips, signalsFor, usageStyle } from "../data/careInsights";
import { narrativeFor } from "../data/narratives";
import { graphKind, graphStatus, outsideLinks, passionsOf, personalLinks, statusFromEsito, viaOf } from "../data/interestGraph";
import { channelResident } from "../data/channel";
import { dayLabel, daysAgo, timeText } from "../data/demoClock";
import { labelOf, requestStates, toneOf } from "../data/moments";
import { momentFilters, useMoments } from "../state/channelStore";
import { Esito } from "../pages/StructureChannel";
import { Avatar, residentPhoto } from "./Common";
import { Button } from "./ui";

// Struttura: «Come sta» e «Con ROSS» raccontano, non misurano (decisione del 05/11/2026).
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
// Si dà del tu a chi lavora in struttura (decisione del 05/11/2026). Gli «Spunti di ROSS» in careInsights.js
// sono scritti al voi: qui si leggono al tu, senza toccare i dati.
const tuForms = [["Passate a prenderlo voi", "Passa a prenderlo tu"], ["Dategli", "Dagli"], ["Chiedetegli", "Chiedigli"], ["Accompagnatela", "Accompagnala"], ["Passate", "Passa"], ["Proponetegli", "Proponigli"], ["Invitatela", "Invitala"]];
const tu = (text = "") => tuForms.reduce((t, [voi, te]) => t.split(voi).join(te), text);
const list = (items) => items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} e ${items.at(-1)}`;

export function HowIsV2({ resident, onPropose, onProposeText }) {
  const name = resident.name.split(" ")[0];
  const story = narrativeFor(resident.id);
  const own = signalsFor(resident.id);
  const good = own.filter((s) => s.positive).map((s) => `${capitalize(s.signal)}, ${trendWords(s)}`);
  const watch = [...own.filter((s) => !s.positive).map((s) => `${capitalize(s.signal)}, ${trendWords(s)}`), ...presenceFor(resident.id).map(presenceWords)];
  // «Ha chiesto»: solo le richieste pratiche confermate dall'ospite (stanza, comfort, piccoli desideri).
  // I bisogni di salute o emotivi (needsFor in careInsights.js) qui non compaiono.
  const moments = useMoments();
  const asked = moments.filter(momentFilters.haChiesto(resident.id));
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
      <section className="v2-note is-asked"><h3><HandHelping size={17} />Ha chiesto</h3>{asked.length ? <ul>{asked.map((m) => <li key={m.id}>{m.richiesta} <small className="v2-asked-state">· {requestStates[m.stato].toLowerCase()}</small></li>)}</ul> : <p>Nessuna richiesta pratica in questi giorni.</p>}<small className="v2-asked-note">Solo ciò che ha chiesto a ROSS di far sapere al personale, e ha confermato.</small></section>
    </div>

    <InterestMap resident={resident} onProposeText={onProposeText} />

    <section className="v2-todo surface">
      <span className="eyebrow">COSA PUOI FARE</span>
      <h3>{story.next}</h3>
      {tips && <ul>{tips.tips.map((t) => <li key={t.title}><b>{tu(t.title)}.</b> {tu(t.text)}</li>)}</ul>}
      <Button variant="outline" onClick={onPropose}><Send size={15} /> Proponi uno spunto per {name}</Button>
    </section>

    <p className="v2-footnote"><Leaf size={15} />Niente conteggi né andamenti: ROSS racconta come sta {name} rispetto a sé, e la mappa mostra dove ci sono occasioni. Lo staff verifica di persona; non è un giudizio sulla salute.</p>
  </div>;
}

// «Con ROSS» (una persona → la sua storia): la linea del tempo di tutti i suoi momenti, dalla sola fonte
// (src/data/moments.js), tranne gli spunti ancora in attesa. Al centro i momenti spontanei, gli inviti, le scelte
// e ciò che è da guardare di persona; gli spunti sono una riga compatta con il link alla scheda Spunti.
const toneIcon = { good: Sparkles, neutral: MessageCircle, watch: Eye };
// Filtri: per un operatore di passaggio, cosa va bene, cosa guardare oggi, com'è andato ciò che hai proposto.
const feedFilters = [
  { id: "tutto", label: "Tutto", match: () => true, empty: "" },
  { id: "belle", label: "Belle notizie", match: (m) => toneOf(m) === "good", empty: "Niente di nuovo da festeggiare, per ora. ROSS lo racconterà appena succede." },
  { id: "osservare", label: "Da guardare di persona", match: (m) => toneOf(m) === "watch", empty: "Niente da guardare di persona in questi giorni." },
  { id: "spunti", label: "I tuoi spunti", match: (m) => m.origine === "spunto", empty: "Nessuno spunto ancora: proponine uno, ROSS racconterà com'è andata." },
];
export function WithRossV2({ resident, onPropose, onOpenSpunti }) {
  const name = resident.name.split(" ")[0];
  const [filter, setFilter] = useState("tutto");
  const usage = usageStyle[resident.id];
  const [said] = modeMeaning[resident.mode] || modeMeaning.Reattiva;
  const moments = useMoments();
  const kinds = usage ? [...usage.mix].sort((x, y) => y[1] - x[1]).map(([label]) => label.toLowerCase()) : [];
  const enjoys = kinds.length ? `Soprattutto ${list(kinds.slice(0, 2))}${kinds.length > 2 ? `; a volte ${list(kinds.slice(2))}` : ""}.` : "";

  const items = moments.filter(momentFilters.storia(resident.id));
  const active = feedFilters.find((f) => f.id === filter);
  const shown = items.filter(active.match);
  const days = shown.reduce((acc, m) => { const key = Math.max(0, daysAgo(m.quando)); (acc[key] = acc[key] || []).push(m); return acc; }, {});

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
      <header><span className="eyebrow">I MOMENTI DA RICORDARE</span><h2>La storia di {name} con ROSS</h2><p>Le cose più interessanti, non tutte le conversazioni: iniziative, uscite raccontate, scelte e ciò che è da guardare di persona. Com'è andato ogni spunto lo trovi in Spunti.</p></header>
      <div className="v2-feed-filters" role="group" aria-label="Filtra i momenti">{feedFilters.map((f) => { const some = items.some(f.match); return <button type="button" key={f.id} aria-pressed={filter === f.id} className={`is-${f.id}`} onClick={() => setFilter(f.id)} disabled={!some && f.id !== "tutto"}>{f.id === "belle" && <Sparkles size={14} />}{f.id === "osservare" && <Eye size={14} />}{f.id === "spunti" && <Send size={14} />}{f.label}</button>; })}</div>
      {!shown.length && <p className="knows-empty">{active.empty || `Ancora nessun momento con ${name}.`}</p>}
      {Object.keys(days).sort((x, y) => x - y).map((day) => { const [label, date] = dayLabel(days[day][0].quando); return <div key={day} className="v2-feed-day">
        <h3>{label}{date && <small>{date}</small>}</h3>
        <ol>{days[day].map((m) => { const tone = toneOf(m); const Icon = toneIcon[tone]; const spunto = m.origine === "spunto"; return <li key={m.id} id={`m-${m.id}`} className={`v2-feed-item is-${tone}${spunto ? " is-spunto" : ""}`}>
          <time>{timeText(m.quando)}</time>
          <span className="v2-feed-dot">{spunto ? <Send size={13} /> : m.origine === "richiesta" ? <HandHelping size={13} /> : <Icon size={14} />}</span>
          {m.origine === "richiesta"
            ? <div className="v2-feed-card v2-feed-row">
                <div className="v2-feed-meta"><span>Ha chiesto · confermato da {name}</span><em className={`s2-request-state is-${m.stato}`}>{requestStates[m.stato]}</em></div>
                <p className="v2-feed-spunto">{m.richiesta}</p>
              </div>
            : spunto
            ? <div className="v2-feed-card v2-feed-row">
                <div className="v2-feed-meta"><span>Dal tuo spunto</span><Esito value={m.esito} /></div>
                <p className="v2-feed-spunto">«{m.spunto.testo}»</p>
                <button type="button" className="v2-feed-more" onClick={onOpenSpunti}>Vedi in Spunti <ArrowRight size={13} /></button>
              </div>
            : <div className="v2-feed-card">
                <div className="v2-feed-meta"><span>{labelOf(m)}</span>{m.stato === "nuovo" && <em className="s2-new">Nuovo</em>}</div>
                <p className="v2-feed-title">{m.titolo || m.racconto}</p>
                {m.titolo && m.racconto && <p className="v2-feed-text">{m.racconto}</p>}
                {m.cosaPuoiFare && m.stato !== "fatto" && <p className="v2-feed-suggestion"><b>Cosa puoi fare.</b> {m.cosaPuoiFare}</p>}
              </div>}
        </li>; })}</ol>
      </div>; })}
    </section>

    <p className="v2-footnote"><Leaf size={15} />Non contiamo i minuti: più tempo con ROSS non è un buon segno se non cresce anche il tempo con le persone. Il contenuto delle conversazioni resta tra ROSS e {name}.</p>
  </div>;
}

// «Le passioni di …» (una persona → le sue occasioni): solo i suoi interessi, dalla stessa fonte della rete
// della residenza (src/data/interestGraph.js). Il colore dice l'esito dei suoi spunti (dai momenti); gli altri ospiti
// compaiono solo come «con chi la condivide». L'azione è individuale: «Proponilo come spunto».
const advice = {
  volentieri: "È piaciuto: si può riproporre, magari con qualcuno.",
  pensa: "Ci sta pensando: un invito di persona può aiutare.",
  attesa: "Lo spunto è già partito: ROSS lo porterà nella conversazione quando ne avrà occasione.",
  no: "Non è piaciuto, o non era il momento: meglio non insistere.",
  prova: "Non è ancora stato proposto.",
};
const wrap = (text, max = 22) => text.split(" ").reduce((lines, word) => { const last = lines[lines.length - 1]; if (last && (last + " " + word).length <= max) lines[lines.length - 1] = `${last} ${word}`; else lines.push(word); return lines; }, []).slice(0, 3);
const males = ["carlo", "mario", "antonio", "bruno"];

function InterestMap({ resident, onProposeText }) {
  const clip = useId().replace(/:/g, "");
  const name = resident.name.split(" ")[0];
  const moments = useMoments();
  const [selected, setSelected] = useState(null);
  const mine = passionsOf(resident.id);
  if (!mine.length) return null;
  // L'esito di un'occasione: dal momento collegato, o dall'ultimo spunto con lo stesso testo.
  const statusOf = (link) => {
    const m = (link.momento && moments.find((x) => x.id === link.momento)) || moments.find((x) => x.residentId === resident.id && x.origine === "spunto" && x.spunto?.testo === link.label);
    return statusFromEsito(m?.esito);
  };
  const W = 880, H = 540, cx = W / 2, cy = H / 2, R1 = 130, R2 = 225;
  const n = mine.length;
  const nodes = mine.map((p, i) => {
    const angle = (-90 + (i * 360) / n) * (Math.PI / 180);
    const links = (personalLinks[resident.id]?.[p.id] || []);
    const k = links.length;
    const others = p.members.map(([id]) => id).filter((id) => id !== resident.id);
    const label = viaOf(p, resident.id);
    return { p, others, label: label.charAt(0).toUpperCase() + label.slice(1), x: cx + R1 * Math.cos(angle), y: cy + R1 * Math.sin(angle),
      links: links.map((link, j) => { const a = angle + ((j - (k - 1) / 2) * 30 * Math.PI) / 180; return { ...link, status: statusOf(link), passion: p.id, interest: label, id: `${i}-${j}`, a, x: cx + R2 * Math.cos(a), y: cy + R2 * Math.sin(a) }; }) };
  });
  const all = nodes.flatMap((nd) => nd.links);
  const ys = [cy - 44, cy + 44, ...nodes.map((nd) => nd.y + 34), ...all.map((l) => l.y)];
  const top = Math.max(0, Math.min(...ys) - 64), bottom = Math.min(H, Math.max(...ys) + 64);
  const current = all.find((l) => l.id === selected);
  const currentInterest = !current && nodes.find((nd) => `p-${nd.p.id}` === selected);
  const photo = residentPhoto(resident);
  const outside = (outsideLinks[resident.id] || []).map((o) => ({ ...o, status: statusOf(o) })).filter((o) => o.status === "no");
  const names = (ids) => { const f = ids.map((id) => channelResident(id).first); return f.length < 2 ? f.join("") : `${f.slice(0, -1).join(", ")} e ${f.at(-1)}`; };
  const pick = (id) => setSelected(selected === id ? null : id);
  const keys = (id) => (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(id); } };

  return <section className="v2-map surface">
    <span className="eyebrow">COSA {males.includes(resident.id) ? "LO" : "LA"} LEGA ALLA VITA DELLA RESIDENZA</span>
    <h3>Le passioni di {name}</h3>
    <p className="v2-map-lead">I suoi interessi e le occasioni collegate. Il colore dice com'è andato il tuo spunto; il tratteggio, cosa resta da provare. Accanto a ogni passione, con chi la condivide. Tocca un punto per sapere di più.</p>
    <svg viewBox={`0 ${top} ${W} ${bottom - top}`} className="v2-map-svg" role="img" aria-label={`Le passioni di ${name}: ${nodes.map((nd) => `${nd.label}, ${nd.links.map((l) => `${l.label} (${graphStatus[l.status].label.toLowerCase()})`).join(", ")}${nd.others.length ? `; la condivide con ${names(nd.others)}` : ""}`).join("; ")}`}>
      <defs><clipPath id={`c-${clip}`}><circle cx={cx} cy={cy} r="40" /></clipPath>{nodes.flatMap((nd) => nd.others.slice(0, 4).map((id, j) => <clipPath key={`${nd.p.id}-${id}`} id={`o-${clip}-${nd.p.id}-${id}`}><circle cx={nd.x - ((Math.min(nd.others.length, 4) - 1) * 9) + j * 18} cy={nd.y + 34} r="11" /></clipPath>))}</defs>
      {nodes.map((nd) => <line key={nd.p.id} x1={cx} y1={cy} x2={nd.x} y2={nd.y} className="v2-map-spoke" />)}
      {all.map((l) => { const from = nodes.find((nd) => nd.p.id === l.passion); return <line key={l.id} x1={from.x} y1={from.y} x2={l.x} y2={l.y} stroke={graphStatus[l.status].color} strokeWidth={selected === l.id ? 4 : 2.5} strokeDasharray={l.status === "prova" ? "6 6" : undefined} strokeLinecap="round" />; })}
      <circle cx={cx} cy={cy} r="44" className="v2-map-center" />
      {photo ? <image href={photo} x={cx - 40} y={cy - 40} width="80" height="80" clipPath={`url(#c-${clip})`} preserveAspectRatio="xMidYMid slice" /> : <text x={cx} y={cy + 6} textAnchor="middle" className="v2-map-initials">{resident.initials}</text>}
      {nodes.map((nd) => { const w = Math.max(90, nd.label.length * 7.6 + 28); const on = selected === `p-${nd.p.id}`; const shown = nd.others.slice(0, 4); return <g key={nd.p.id} className={`v2-map-passion${on ? " is-selected" : ""}`} role="button" tabIndex="0" aria-label={`${nd.label}${nd.others.length ? `: la condivide con ${names(nd.others)}` : ""}`} onClick={() => pick(`p-${nd.p.id}`)} onKeyDown={keys(`p-${nd.p.id}`)}>
        <rect x={nd.x - w / 2} y={nd.y - 17} width={w} height="34" rx="17" className="v2-map-interest" /><text x={nd.x} y={nd.y + 5} textAnchor="middle" className="v2-map-interest-label">{nd.label}</text>
        {shown.map((id, j) => { const ox = nd.x - ((shown.length - 1) * 9) + j * 18; const img = residentPhoto({ id }); return <g key={id}><circle cx={ox} cy={nd.y + 34} r="12.5" className="v2-map-other-ring" />{img && <image href={img} x={ox - 11} y={nd.y + 23} width="22" height="22" clipPath={`url(#o-${clip}-${nd.p.id}-${id})`} preserveAspectRatio="xMidYMid slice" />}</g>; })}
      </g>; })}
      {all.map((l) => {
        const cos = Math.cos(l.a); const sin = Math.sin(l.a);
        const anchor = cos > 0.25 ? "start" : cos < -0.25 ? "end" : "middle";
        const lines = wrap(l.label);
        const tx = l.x + (anchor === "start" ? 20 : anchor === "end" ? -20 : 0);
        const ty = anchor === "middle" ? (sin < 0 ? l.y - 24 - (lines.length - 1) * 16 : l.y + 32) : l.y + 5 - ((lines.length - 1) * 16) / 2;
        return <g key={l.id} className={`v2-map-node${selected === l.id ? " is-selected" : ""}`} role="button" tabIndex="0" aria-label={`${l.label}: ${graphStatus[l.status].label}`} onClick={() => pick(l.id)} onKeyDown={keys(l.id)}>
          <circle cx={l.x} cy={l.y} r="11" fill={l.status === "prova" ? "var(--surface)" : graphStatus[l.status].color} stroke={graphStatus[l.status].color} strokeWidth="3" />
          <text x={tx} y={ty} textAnchor={anchor} className="v2-map-label">{lines.map((line, i) => <tspan key={line} x={tx} dy={i ? 16 : 0}>{line}</tspan>)}</text>
        </g>;
      })}
    </svg>
    <ul className="v2-map-list">{nodes.map((nd) => <li key={nd.p.id}><button type="button" className="v2-map-list-passion" aria-pressed={selected === `p-${nd.p.id}`} onClick={() => pick(`p-${nd.p.id}`)}>{nd.label}{nd.others.length > 0 && <span>{nd.others.slice(0, 4).map((id) => <Avatar key={id} resident={channelResident(id)} size="sm" />)}</span>}</button><div>{nd.links.map((l) => <button type="button" key={l.id} className={`is-${l.status}`} aria-pressed={selected === l.id} onClick={() => pick(l.id)}>{l.label}</button>)}</div></li>)}</ul>
    <div className="v2-map-legend">{Object.entries(graphStatus).map(([id, s]) => <span key={id}><i style={{ background: id === "prova" ? "transparent" : s.color, borderColor: s.color, borderStyle: id === "prova" ? "dashed" : "solid" }} />{s.label}</span>)}<span><i className="v2-map-legend-people" />Con chi la condivide</span></div>
    {current && <div className="v2-map-detail" role="status">
      <div><small>{graphKind[current.kind]} · legato a «{current.interest}»</small><strong>{current.label}</strong><p><b style={{ color: graphStatus[current.status].color }}>{graphStatus[current.status].label}.</b> {advice[current.status]}</p></div>
      {!["no", "attesa"].includes(current.status) && <Button variant={current.status === "prova" ? "default" : "outline"} onClick={() => onProposeText(current.label, current.kind)}><Send size={15} /> {current.status === "prova" ? "Proponilo come spunto" : "Riproponilo"}</Button>}
    </div>}
    {currentInterest && <div className="v2-map-detail" role="status">
      <div><small>Una passione di {name}</small><strong>{currentInterest.label}</strong><p>{currentInterest.others.length ? <>La condivide con {names(currentInterest.others)}, nella passione «{currentInterest.p.label}».</> : "Per ora nessun altro ospite la condivide."}</p></div>
      {currentInterest.others.length > 0 && <Link className="ui-button ui-button-outline ui-button-md" to={`/?passione=${currentInterest.p.id}`}><Users size={15} /> Vedi chi altro la condivide</Link>}
    </div>}
    {!current && !currentInterest && outside.length > 0 && <p className="v2-map-other">Fuori dalle sue passioni: {outside.map((o) => o.label.toLowerCase()).join(", ")} (non è piaciuto). Le proposte che non toccano ciò che {name} ama funzionano meno.</p>}
  </section>;
}
