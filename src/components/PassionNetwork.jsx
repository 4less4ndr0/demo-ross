import { useEffect, useId, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, Users } from "lucide-react";
import { toast } from "sonner";
import { sharedPassions as passions } from "../data/interestGraph";
import { channelResident, channelResidents } from "../data/channel";
import { channelActions } from "../state/channelStore";
import { Avatar, residentPhoto } from "./Common";
import { Button } from "./ui";

// Struttura 2.0 · «La rete delle passioni · tutta la residenza», nel canale: chi potrebbe fare qualcosa insieme.
// Stessa fonte delle «Passioni di …» nel ritratto (src/data/interestGraph.js), ma un altro punto di vista:
// solo le passioni condivise da almeno 2 ospiti, e l'azione è collettiva («Proponilo a tutti e N»).
// Un supporto per proporre occasioni condivise, mai il centro: niente punteggi, niente relazioni raccontate.
// La passione scelta sta nell'indirizzo (?passione=…): ci porta anche «Vedi chi altro la condivide» dal ritratto.
const names = (ids) => { const f = ids.map((id) => channelResident(id).first); return f.length < 2 ? f.join("") : `${f.slice(0, -1).join(", ")} e ${f.at(-1)}`; };

export function PassionNetwork() {
  const clip = useId().replace(/:/g, "");
  const [params, setParams] = useSearchParams();
  const selected = passions.some((p) => p.id === params.get("passione")) ? params.get("passione") : passions[0].id;
  const setSelected = (id) => setParams((prev) => { const next = new URLSearchParams(prev); next.set("passione", id); return next; }, { replace: true });
  const card = useRef(null);
  // Arrivando dal ritratto con una passione già scelta, la rete si porta in vista.
  useEffect(() => { if (params.get("passione")) card.current?.scrollIntoView({ block: "start" }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const W = 920, H = 600, cx = W / 2, cy = H / 2, R = 245;
  const people = channelResidents.map((r, i) => { const a = (-90 + (i * 360) / channelResidents.length) * (Math.PI / 180); return { ...r, a, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }; });
  const at = (id) => people.find((p) => p.id === id);
  // Le passioni stanno su un anello interno, in ordine attorno al cerchio, ciascuna dalla parte di chi la condivide.
  const meanAngle = (p) => { const ms = p.members.map(([id]) => at(id)); return Math.atan2(ms.reduce((t, m) => t + Math.sin(m.a), 0), ms.reduce((t, m) => t + Math.cos(m.a), 0)); };
  const ordered = passions.map((p) => ({ ...p, m: meanAngle(p) })).sort((a, b) => a.m - b.m);
  const start = ordered[0].m;
  const hubs = ordered.map((p, i) => { const a = start + (i * 2 * Math.PI) / ordered.length; return { ...p, x: cx + 122 * Math.cos(a), y: cy + 118 * Math.sin(a) }; });
  // Le etichette non si sovrappongono: se due si toccano, si allontanano (soprattutto in verticale).
  hubs.forEach((h) => { h.w = Math.max(110, h.label.length * 7.4 + 30); });
  for (let step = 0; step < 80; step += 1) {
    for (let i = 0; i < hubs.length; i += 1) for (let j = i + 1; j < hubs.length; j += 1) {
      const a = hubs[i], b = hubs[j]; const dx = b.x - a.x, dy = b.y - a.y;
      const ox = (a.w + b.w) / 2 + 14 - Math.abs(dx), oy = 34 + 14 - Math.abs(dy);
      if (ox <= 0 || oy <= 0) continue;
      if (oy <= ox) { const sy = (dy || (j % 2 ? 1 : -1)) > 0 ? 1 : -1; a.y -= (sy * oy) / 2; b.y += (sy * oy) / 2; }
      else { const sx = (dx || 1) > 0 ? 1 : -1; a.x -= (sx * ox) / 2; b.x += (sx * ox) / 2; }
    }
  }
  const current = hubs.find((h) => h.id === selected);
  const inCurrent = new Set(current ? current.members.map(([id]) => id) : []);

  const proposeAll = () => {
    current.members.forEach(([id]) => channelActions.send({ residentId: id, testo: current.idea, tipo: "attivita" }));
    toast(`Spunto inviato a ${names(current.members.map(([id]) => id))}`, { description: "ROSS ne parlerà con ciascuno, se ci sta. Decide ognuno per sé." });
  };

  return <section ref={card} className="s2-card s2-network" aria-labelledby="s2-network-title">
    <span className="s2-eyebrow">La rete delle passioni · tutta la residenza</span>
    <h2 id="s2-network-title">Chi potrebbe fare qualcosa insieme</h2>
    <p className="s2-lead">Gli ospiti uniti da una passione in comune. Viene da ciò che amano (dalla biografia d'ingresso o emerso con ROSS), detto solo come categoria: mai di cosa hanno parlato né con chi. Tocca una passione per vedere l'occasione.</p>
    <div className="s2-network-body">
      <svg viewBox={`0 0 ${W} ${H}`} className="s2-network-svg" role="img" aria-label={`Rete delle passioni: ${passions.map((p) => `${p.label}, ${names(p.members.map(([id]) => id))}`).join("; ")}`}>
        <defs>{people.map((p) => <clipPath key={p.id} id={`n-${clip}-${p.id}`}><circle cx={p.x} cy={p.y} r="30" /></clipPath>)}</defs>
        {hubs.map((h) => h.members.map(([id]) => { const p = at(id); const on = h.id === selected; return <line key={`${h.id}-${id}`} x1={h.x} y1={h.y} x2={p.x} y2={p.y} className={`s2-network-edge${on ? " is-on" : ""}`} />; }))}
        {people.map((p) => { const on = inCurrent.has(p.id); const photo = residentPhoto(p); const cos = Math.cos(p.a), sin = Math.sin(p.a);
          const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle"; const tx = p.x + (anchor === "start" ? 40 : anchor === "end" ? -40 : 0); const ty = anchor === "middle" ? p.y + (sin < 0 ? -42 : 52) : p.y + 5;
          return <g key={p.id} className={`s2-network-person${on ? " is-on" : ""}`}>
            <circle cx={p.x} cy={p.y} r="34" className="s2-network-ring" />
            {photo ? <image href={photo} x={p.x - 30} y={p.y - 30} width="60" height="60" clipPath={`url(#n-${clip}-${p.id})`} preserveAspectRatio="xMidYMid slice" /> : <text x={p.x} y={p.y + 5} textAnchor="middle">{p.initials}</text>}
            <text x={tx} y={ty} textAnchor={anchor} className="s2-network-name">{p.first}</text>
          </g>; })}
        {hubs.map((h) => { const w = h.w; const on = h.id === selected;
          return <g key={h.id} className={`s2-network-hub${on ? " is-on" : ""}`} role="button" tabIndex="0" aria-pressed={on} aria-label={`${h.label}: ${names(h.members.map(([id]) => id))}`} onClick={() => setSelected(h.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(h.id); } }}>
            <rect x={h.x - w / 2} y={h.y - 17} width={w} height="34" rx="17" />
            <text x={h.x} y={h.y + 5} textAnchor="middle">{h.label}</text>
          </g>; })}
      </svg>
      <ul className="s2-network-list">{passions.map((p) => <li key={p.id}><button type="button" aria-pressed={p.id === selected} onClick={() => setSelected(p.id)}><strong>{p.label}</strong><span>{p.members.map(([id]) => <Avatar key={id} resident={channelResident(id)} size="sm" />)}</span></button></li>)}</ul>
      {current && <aside className="s2-network-detail" aria-live="polite">
        <span className="s2-label"><Users size={14} /> {current.label}</span>
        <ul>{current.members.map(([id, via]) => <li key={id}><Avatar resident={channelResident(id)} size="md" /><span><b>{channelResident(id).first}</b>ama {via}</span></li>)}</ul>
        <p className="s2-network-idea"><span>Un'occasione</span>{current.idea}</p>
        <Button className="s2-send" onClick={proposeAll}><Send size={16} />Proponilo a tutti e {current.members.length}</Button>
        <small>ROSS lo porta a ciascuno nel suo momento e secondo la sua modalità. Nessuno sa chi ha detto sì o no: decide ognuno per sé.</small>
      </aside>}
    </div>
  </section>;
}
