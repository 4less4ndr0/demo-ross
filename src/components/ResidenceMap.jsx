import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, Moon, Power, Wrench, X } from "lucide-react";
import { Avatar } from "./Common";
import { channelResident } from "../data/channel";
import { floorsPlan, roomState, stateLabel, deviceNote } from "../data/residence";
import { useDemo } from "../state/DemoContext";

// «La residenza, adesso»: l'immagine d'apertura del canale. In 3D sul computer, pianta piatta sul telefono.
// Mostra i ROSS e gli spazi, non le persone: un ROSS attivo si illumina, senza dire con chi né di cosa.
const BASE = "/struttura-2";
const W = 18, D = 6, GAP = 5.2, WALL = 0.55;
const S = 40;
// Vista dall'alto, un po' di lato: il lato lungo quasi in orizzontale, così ogni piano è una lastra ben separata.
const P = (x, y, z) => [(x * 0.95 - y * 0.62) * S, (x * 0.17 + y * 0.44 - z) * S];
const pts = (list) => list.map(([x, y, z]) => P(x, y, z).join(",")).join(" ");

function useNarrow() {
  const q = "(max-width: 760px)";
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => { const m = window.matchMedia(q); const on = () => setNarrow(m.matches); m.addEventListener("change", on); return () => m.removeEventListener("change", on); }, []);
  return narrow;
}

const roomFill = (room, state) => room.kind === "giardino" ? "var(--rm-garden)" : room.kind === "comune" ? "var(--rm-common)" : state ? "var(--rm-ross)" : "var(--rm-empty)";

export function ResidenceMap() {
  const { state } = useDemo();
  const narrow = useNarrow();
  const [selected, setSelected] = useState(null);
  const rooms = useMemo(() => floorsPlan.flatMap((f) => f.rooms.map((r) => ({ ...r, floor: f, state: roomState(r, state.residents) }))), [state.residents]);
  const flats = rooms.filter((r) => r.kind === "alloggio");
  const withRoss = flats.filter((r) => r.residentId).length;
  const commonRoss = rooms.filter((r) => r.kind !== "alloggio" && r.ross).length;
  const toFix = rooms.filter((r) => r.state === "da_sistemare").length;
  const sel = rooms.find((r) => r.id === selected);
  const now = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit" }).format(new Date());

  return (
    <section className="rm" aria-labelledby="rm-title">
      <div className="rm-head">
        <div><span className="s2-eyebrow">La residenza, adesso · {now}</span><h2 id="rm-title">Dove c'è ROSS nella Residenza Aurora</h2>
          <p>Ogni ospite sceglie se avere ROSS nel suo alloggio. Qui vedi i dispositivi e gli spazi comuni: quando un ROSS è attivo si illumina, senza dire di cosa si parla.</p></div>
        <ul className="rm-facts">
          <li><strong>{withRoss} su {flats.length}</strong><span>alloggi con ROSS</span></li>
          <li><strong>{commonRoss}</strong><span>ROSS negli spazi comuni</span></li>
          <li className={toFix ? "is-fix" : ""}><strong>{toFix}</strong><span>da sistemare</span></li>
        </ul>
      </div>
      <div className="rm-body">
        <div className="rm-stage">
          {narrow ? <FlatPlan rooms={rooms} selected={selected} onSelect={setSelected} /> : <IsoPlan rooms={rooms} selected={selected} onSelect={setSelected} />}
          <Legend />
        </div>
        <aside className="rm-panel" aria-live="polite" ref={(el) => { if (el && narrow && sel) el.scrollIntoView({ behavior: "smooth", block: "nearest" }); }}>{sel ? <RoomPanel room={sel} onClose={() => setSelected(null)} /> : <p className="rm-hint">Tocca un alloggio o uno spazio comune per vedere cosa c'è.</p>}</aside>
      </div>
    </section>
  );
}

function Legend() {
  return <ul className="rm-legend">
    <li><i className="rm-dot is-attivo" />Attivo adesso</li>
    <li><i className="rm-dot is-acceso" />Acceso</li>
    <li><i className="rm-dot is-pausa" />In pausa (silenzio scelto)</li>
    <li><i className="rm-dot is-da_sistemare" />Da sistemare</li>
    <li><i className="rm-swatch" />Alloggio senza ROSS</li>
  </ul>;
}

function IsoPlan({ rooms, selected, onSelect }) {
  const floors = [...floorsPlan].map((f, i) => ({ ...f, z: i * GAP }));
  const all = floors.flatMap((f) => [P(0, 0, f.z), P(W, D, f.z), P(0, D, f.z), P(W, 0, f.z), P(0, 0, f.z + WALL + 1.5)]);
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const pad = 30, minX = Math.min(...xs) - pad - 120, maxX = Math.max(...xs) + pad, minY = Math.min(...ys) - pad, maxY = Math.max(...ys) + pad + 20;
  return (
    <svg className="rm-iso" viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} role="img" aria-label="Piantina 3D della Residenza Aurora, tre piani">
      <defs>
        <radialGradient id="rm-glow"><stop offset="0%" stopColor="#ff7a2d" stopOpacity=".55" /><stop offset="100%" stopColor="#ff7a2d" stopOpacity="0" /></radialGradient>
      </defs>
      {floors.map((f) => {
        const fr = rooms.filter((r) => r.floor.id === f.id);
        const z = f.z;
        const [lx, ly] = P(0, D, z);
        return <g key={f.id} className="rm-floor">
          {/* lastra del piano */}
          <polygon className="rm-slab-side" points={pts([[0, D, z], [W, D, z], [W, D, z - 0.5], [0, D, z - 0.5]])} />
          <polygon className="rm-slab-side is-right" points={pts([[W, 0, z], [W, D, z], [W, D, z - 0.5], [W, 0, z - 0.5]])} />
          <polygon className="rm-slab" points={pts([[0, 0, z], [W, 0, z], [W, D, z], [0, D, z]])} />
          <text className="rm-floor-label" x={lx - 18} y={ly + 4} textAnchor="end">{f.label}</text>
          {fr.map((r) => <IsoRoom key={r.id} room={r} z={z} active={selected === r.id} onSelect={onSelect} />)}
        </g>;
      })}
    </svg>
  );
}

function IsoRoom({ room: r, z, active, onSelect }) {
  const inset = 0.12, h = WALL;
  const a = [r.x0 + inset, r.y0 + inset], b = [r.x1 - inset, r.y1 - inset];
  const floor = [[a[0], a[1], z], [b[0], a[1], z], [b[0], b[1], z], [a[0], b[1], z]];
  const wallBack = [[a[0], a[1], z], [b[0], a[1], z], [b[0], a[1], z + h], [a[0], a[1], z + h]];
  const wallLeft = [[a[0], a[1], z], [a[0], b[1], z], [a[0], b[1], z + h], [a[0], a[1], z + h]];
  const cxr = (a[0] + b[0]) / 2, cyr = (a[1] + b[1]) / 2;
  const [ox, oy] = P(cxr + 1.6, a[1] + 0.95, z + 0.55);
  const [tx, ty] = P(cxr - 1.9, a[1] + 0.95, z);
  const res = r.residentId && channelResident(r.residentId);
  const label = r.kind === "alloggio" ? r.id : r.name;
  const sub = res ? res.first : r.kind === "alloggio" ? "senza ROSS" : "";
  const name = res ? `Alloggio ${r.id}, ${res.first}` : r.kind === "alloggio" ? `Alloggio ${r.id}, senza ROSS` : r.name;
  return (
    <g className={`rm-room is-${r.kind}${r.state ? ` has-${r.state}` : ""}${active ? " is-selected" : ""}`} role="button" tabIndex={0} aria-label={`${name}${r.state ? `: ${stateLabel[r.state]}` : ""}`}
      onClick={() => onSelect(r.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(r.id))}>
      <polygon className="rm-room-floor" style={{ fill: roomFill(r, r.state) }} points={pts(floor)} />
      <polygon className="rm-wall" points={pts(wallBack)} />
      <polygon className="rm-wall is-left" points={pts(wallLeft)} />
      <text className="rm-label" x={tx} y={ty}>{label}</text>
      {sub && <text className="rm-sub" x={tx} y={ty + 13}>{sub}</text>}
      {r.state && <Orb x={ox} y={oy} state={r.state} />}
    </g>
  );
}

function Orb({ x, y, state }) {
  return <g className={`rm-orb is-${state}`} transform={`translate(${x} ${y})`}>
    {state === "attivo" && <><circle className="rm-halo" r="26" fill="url(#rm-glow)" /><circle className="rm-ring" r="9" /><circle className="rm-ring is-late" r="9" /></>}
    <ellipse className="rm-orb-shadow" cx="0" cy="9" rx="7" ry="2.5" />
    <circle className="rm-orb-core" r="7" />
    {state === "pausa" && <text className="rm-orb-icon" y="3" textAnchor="middle">z</text>}
    {state === "da_sistemare" && <text className="rm-orb-icon" y="3.5" textAnchor="middle">!</text>}
  </g>;
}

function FlatPlan({ rooms, selected, onSelect }) {
  return <div className="rm-flat">{[...floorsPlan].reverse().map((f) => <div key={f.id} className="rm-flat-floor">
    <h3>{f.label}</h3>
    <div className="rm-flat-grid">{rooms.filter((r) => r.floor.id === f.id).map((r) => {
      const res = r.residentId && channelResident(r.residentId);
      return <button type="button" key={r.id} className={`rm-flat-room is-${r.kind}${r.state ? ` has-${r.state}` : ""}${selected === r.id ? " is-selected" : ""}`} style={{ gridColumn: `${Math.round(r.x0 / 3) + 1} / ${Math.round(r.x1 / 3) + 1}`, gridRow: r.y0 < 3 ? 1 : 2 }} onClick={() => onSelect(r.id)}>
        <strong>{r.kind === "alloggio" ? r.id : r.name}</strong><small>{res ? res.first : r.kind === "alloggio" ? "senza ROSS" : ""}</small>
        {r.state && <i className={`rm-dot is-${r.state}`} aria-label={stateLabel[r.state]} />}
      </button>;
    })}</div>
  </div>)}</div>;
}

function RoomPanel({ room: r, onClose }) {
  const res = r.residentId && channelResident(r.residentId);
  const { state } = useDemo();
  const live = res && state.residents.find((x) => x.id === res.id);
  const Icon = r.state === "pausa" ? Moon : r.state === "da_sistemare" ? Wrench : Power;
  return <div className="rm-card">
    <button type="button" className="rm-close" onClick={onClose} aria-label="Chiudi"><X size={16} /></button>
    {res ? <header><Avatar resident={res} size="lg" /><div><h3>{res.name}</h3><small>Alloggio {r.id} · {r.floor.label.toLowerCase()}</small></div></header>
      : <header><div><h3>{r.kind === "alloggio" ? `Alloggio ${r.id}` : r.name}</h3><small>{r.floor.label}</small></div></header>}
    {r.state ? <p className={`rm-state is-${r.state}`}><Icon size={15} />{r.kind === "alloggio" ? "ROSS " : "ROSS dello spazio · "}{stateLabel[r.state].toLowerCase()}</p>
      : <p className="rm-state is-none">{r.kind === "alloggio" ? "In questo alloggio non c'è ROSS: l'ospite non l'ha scelto, o è libero." : "In questo spazio non c'è un ROSS."}</p>}
    {r.state === "da_sistemare" && deviceNote[r.residentId] && <p className="rm-note">{deviceNote[r.residentId]}</p>}
    {live && <dl className="rm-facts-list"><div><dt>Modalità</dt><dd>{live.mode}{live.mode === "Silenziosa" ? ": ROSS non avvia nulla" : ""}</dd></div><div><dt>Le sue passioni</dt><dd>{live.interests.join(" · ")}</dd></div></dl>}
    {r.today && <p className="rm-today"><span>Oggi qui</span>{r.today}</p>}
    {res && <div className="rm-actions"><NavLink className="ui-button ui-button-default" to={`${BASE}/ospiti/${res.id}`}>Proponi uno spunto <ArrowRight size={15} /></NavLink><NavLink className="ui-button ui-button-outline" to={`${BASE}/ospiti/${res.id}?tab=sintesi`}>Vedi il ritratto</NavLink></div>}
    {r.state === "attivo" && r.kind === "alloggio" && <p className="rm-privacy">Si vede solo che ROSS è attivo: di cosa si parla resta tra ROSS e {res.first}.</p>}
  </div>;
}
