import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ArrowRight, Check, Moon, Power, Wrench, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "./Common";
import { Button, Sheet, Tabs, TabsContent, TabsList, TabsTrigger } from "./ui";
import { channelResident } from "../data/channel";
import { deviceNote, floorsPlan, legendLabel, roomState, startFloor, stateLabel, stateOrder } from "../data/residence";
import { useDemo } from "../state/DemoContext";

// «La residenza, adesso»: l'immagine d'apertura del canale. Una pianta vista dall'alto, un piano alla volta:
// a sinistra l'indice dei piani, al centro la pianta, a destra il dettaglio (solo se si tocca qualcosa).
// Mostra i ROSS e gli spazi, non le persone: lo stato del dispositivo, mai cosa si dice né da quanto.
// Su telefono l'indice diventa una fila di pillole e il dettaglio un foglio dal basso.
const BASE = "/struttura-2";
const W = 18, D = 6; // ogni piano è 18 × 6 (coordinate di floorsPlan)
const FIXED_KEY = "ross-residence-v1"; // gli alloggi segnati «Fatto, è ricollegato» (si azzera con «Ripristina la demo»)
const loadFixed = () => { try { return JSON.parse(localStorage.getItem(FIXED_KEY)) || []; } catch { return []; } };
const PHONE = "(max-width: 700px)";
const floorsTopDown = [...floorsPlan].reverse(); // come in un edificio: dal secondo piano al piano terra

function usePhone() {
  const [phone, setPhone] = useState(() => typeof window !== "undefined" && window.matchMedia(PHONE).matches);
  useEffect(() => { const m = window.matchMedia(PHONE); const on = () => setPhone(m.matches); m.addEventListener("change", on); return () => m.removeEventListener("change", on); }, []);
  return phone;
}

const roomName = (r) => {
  const res = r.residentId && channelResident(r.residentId);
  return res ? `Alloggio ${r.id}, ${res.first}` : r.kind === "alloggio" ? `Alloggio ${r.id}, senza ROSS` : r.name;
};
const tipOf = (r) => r.state ? (r.kind === "alloggio" ? `ROSS: ${stateLabel[r.state].toLowerCase()}` : `ROSS dello spazio: ${stateLabel[r.state].toLowerCase()}`) : r.kind === "alloggio" ? "Senza ROSS" : "Nessun ROSS in questo spazio";

export function ResidenceMap() {
  const { state } = useDemo();
  const phone = usePhone();
  const [fixed, setFixed] = useState(loadFixed);
  const rooms = useMemo(() => floorsPlan.flatMap((f) => f.rooms.map((r) => ({ ...r, floor: f, state: roomState(r, state.residents, fixed) }))), [state.residents, fixed]);
  const [floorId, setFloorId] = useState(() => startFloor(rooms));
  const [selected, setSelected] = useState(null);
  const sel = rooms.find((r) => r.id === selected);
  const now = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit" }).format(new Date());

  useEffect(() => { try { localStorage.setItem(FIXED_KEY, JSON.stringify(fixed)); } catch { /* ignora */ } }, [fixed]);
  // Esc chiude il dettaglio su desktop (su telefono lo fa già il foglio).
  useEffect(() => {
    if (!sel || phone) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, phone]);

  const reconnect = (room) => {
    const before = fixed;
    setFixed((list) => [...new Set([...list, room.id])]);
    const first = channelResident(room.residentId)?.first;
    toast(`Fatto: il ROSS di ${first} è di nuovo acceso`, { action: { label: "Annulla", onClick: () => setFixed(before) } });
  };
  const changeFloor = (id) => { setFloorId(id); setSelected(null); };
  const panel = sel && <RoomPanel room={sel} onClose={() => setSelected(null)} onReconnect={reconnect} inSheet={phone} />;

  return (
    <TooltipPrimitive.Provider delayDuration={120}>
      <Tabs value={floorId} onValueChange={changeFloor} orientation={phone ? "horizontal" : "vertical"} asChild>
        <section className={`rm${sel && !phone ? " has-panel" : ""}`} aria-labelledby="rm-title">
          <div className="rm-head">
            <span className="s2-eyebrow">La residenza, adesso · {now}</span>
            <h2 id="rm-title">Dove c'è ROSS nella Residenza Aurora</h2>
            <p>Ogni ospite sceglie se avere ROSS. Qui vedi solo lo stato dei dispositivi, mai di cosa si parla.</p>
          </div>
          <TabsList className="rm-floors" aria-label="Piani della residenza">
            {floorsTopDown.map((f) => <FloorTab key={f.id} floor={f} rooms={rooms.filter((r) => r.floor.id === f.id)} active={f.id === floorId} />)}
          </TabsList>
          {floorsPlan.map((f) => <TabsContent key={f.id} value={f.id} className="rm-stage">
            <Plan floor={f} rooms={rooms.filter((r) => r.floor.id === f.id)} selected={selected} onSelect={setSelected} />
          </TabsContent>)}
          <Legend />
          {!phone && sel && <aside className="rm-panel" aria-live="polite">{panel}</aside>}
          {phone && <Sheet open={Boolean(sel)} onOpenChange={(open) => { if (!open) setSelected(null); }} side="bottom" title={sel ? roomName(sel) : "Dettaglio"} className="rm-sheet">{panel}</Sheet>}
        </section>
      </Tabs>
    </TooltipPrimitive.Provider>
  );
}

// Una voce dell'indice: il nome del piano e un pallino per ogni ROSS, nel colore del suo stato. Niente numeri.
function FloorTab({ floor, rooms, active }) {
  const states = rooms.map((r) => r.state).filter(Boolean).sort((a, b) => stateOrder.indexOf(a) - stateOrder.indexOf(b));
  const words = [...new Set(states)].map((s) => legendLabel[s].toLowerCase());
  return <TabsTrigger value={floor.id} active={active} className="rm-floor-tab">
    <span className="rm-floor-name">{floor.label}</span>
    <span className="rm-floor-dots" aria-hidden="true">{states.length ? states.map((s, i) => <i key={i} className={`rm-dot is-${s}`} />) : <i className="rm-dot is-none" />}</span>
    <span className="ui-sr-only">{words.length ? `: ROSS ${words.join(", ")}` : ": nessun ROSS"}</span>
  </TabsTrigger>;
}

// La pianta del piano vista dall'alto: stesse proporzioni di floorsPlan (18 × 6), alloggi e spazi come rettangoli.
function Plan({ floor, rooms, selected, onSelect }) {
  return <div className="rm-plan" role="group" aria-label={`Pianta: ${floor.label.toLowerCase()}`}>
    {rooms.map((r) => {
      const res = r.residentId && channelResident(r.residentId);
      const style = { left: `${(r.x0 / W) * 100}%`, top: `${(r.y0 / D) * 100}%`, width: `${((r.x1 - r.x0) / W) * 100}%`, height: `${((r.y1 - r.y0) / D) * 100}%` };
      return <TooltipPrimitive.Root key={r.id}>
        <TooltipPrimitive.Trigger asChild>
          <button type="button" style={style} aria-pressed={selected === r.id} aria-label={`${roomName(r)}. ${tipOf(r)}`}
            className={`rm-room is-${r.kind}${r.state ? ` has-${r.state}` : r.kind === "alloggio" ? " is-empty" : ""}${selected === r.id ? " is-selected" : ""}`}
            onClick={() => onSelect(selected === r.id ? null : r.id)}>
            <strong>{r.kind === "alloggio" ? r.id : r.name}</strong>
            <small>{res ? res.first : r.kind === "alloggio" ? "senza ROSS" : ""}</small>
            {r.state && <Pin state={r.state} />}
          </button>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className="ui-tooltip rm-tip" side="top" sideOffset={6} collisionPadding={12}>{tipOf(r)}</TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>;
    })}
  </div>;
}

// Il pallino dello stato, nell'angolo: verde che pulsa se attivo, grigio con la luna se in pausa, rosso con «!» se da sistemare.
function Pin({ state }) {
  return <span className={`rm-pin is-${state}`} aria-hidden="true">
    {state === "pausa" && <Moon size={8} strokeWidth={3} />}
    {state === "da_sistemare" && "!"}
  </span>;
}

function Legend() {
  return <ul className="rm-legend" aria-label="Legenda">
    {stateOrder.map((s) => <li key={s}><Pin state={s} />{legendLabel[s]}</li>)}
    <li><i className="rm-swatch" />Alloggio senza ROSS</li>
  </ul>;
}

function RoomPanel({ room: r, onClose, onReconnect, inSheet }) {
  const res = r.residentId && channelResident(r.residentId);
  const { state } = useDemo();
  const live = res && state.residents.find((x) => x.id === res.id);
  const Icon = r.state === "pausa" ? Moon : r.state === "da_sistemare" ? Wrench : Power;
  return <div className="rm-card">
    {!inSheet && <button type="button" className="rm-close" onClick={onClose} aria-label="Chiudi il dettaglio"><X size={15} /></button>}
    {res ? <header><Avatar resident={res} size="md" /><div><h3>{res.name}</h3><small>Alloggio {r.id} · {r.floor.label.toLowerCase()}</small></div></header>
      : <header><div><h3>{r.kind === "alloggio" ? `Alloggio ${r.id}` : r.name}</h3><small>{r.floor.label}</small></div></header>}
    {r.state ? <p className={`rm-state is-${r.state}`}><Icon size={15} />{r.kind === "alloggio" ? "ROSS: " : "ROSS dello spazio: "}{stateLabel[r.state].toLowerCase()}</p>
      : <p className="rm-state is-none">{r.kind === "alloggio" ? "In questo alloggio non c'è ROSS: l'ospite non l'ha scelto, o è libero." : "In questo spazio non c'è un ROSS."}</p>}
    {r.state === "da_sistemare" && <div className="rm-fix">
      {deviceNote[r.residentId] && <p>{deviceNote[r.residentId]}</p>}
      <Button size="sm" variant="outline" onClick={() => onReconnect(r)}><Check size={14} />Fatto, è ricollegato</Button>
    </div>}
    {r.state === "pausa" && r.kind === "alloggio" && <p className="rm-privacy">È una scelta di {res.first}: ROSS resta in silenzio finché non lo chiama.</p>}
    {live && <dl className="rm-facts-list"><div><dt>Modalità</dt><dd>{live.mode}{live.mode === "Silenziosa" ? ": ROSS non avvia nulla" : ""}</dd></div><div><dt>Le sue passioni</dt><dd>{live.interests.join(" · ")}</dd></div></dl>}
    {r.today && <p className="rm-today"><span>Oggi qui</span>{r.today}</p>}
    {res && <div className="rm-actions"><NavLink className="ui-button ui-button-default ui-button-sm" to={`${BASE}/ospiti/${res.id}`}>Proponi uno spunto <ArrowRight size={14} /></NavLink><NavLink className="ui-button ui-button-outline ui-button-sm" to={`${BASE}/ospiti/${res.id}?tab=sintesi`}>Vedi il ritratto</NavLink></div>}
    {r.state === "attivo" && r.kind === "alloggio" && <p className="rm-privacy">Si vede solo che ROSS è attivo: di cosa si parla resta tra ROSS e {res.first}.</p>}
  </div>;
}
