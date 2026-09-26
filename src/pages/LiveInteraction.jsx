import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Activity, AudioLines, BookOpen, Check, ChevronDown, Gauge, Minimize2, Pause, Play, Square, X } from "lucide-react";
import { useDemo } from "../state/DemoContext";
import { Dialog as Modal, Select } from "../components/ui";

export function LiveInteraction() {
  const { id } = useParams();
  const { state, actions } = useDemo();
  const resident = state.residents.find((r) => r.id === id) || state.residents[0];
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const [style, setStyle] = useState({ speed: "Lenta", phrases: "Brevi", initiative: "Media", pauses: "Lunghe" });
  const navigate = useNavigate();
  useEffect(() => { if (paused || complete) return; const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000); return () => window.clearInterval(timer); }, [paused, complete]);
  const duration = useMemo(() => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`, [seconds]);
  const closeComplete = () => {
    actions.completeInteraction({ residentId: resident.id, resident: resident.name, time: "17:18", duration: Math.max(12, Math.ceil(seconds / 60)), type: "Conversazione", topic: "Ricordi guidati", mode: "Attiva", participation: 89, memoriesUsed: 4, emerged: 1 });
    navigate(`/ospiti/${resident.id}`);
  };
  return <div className="interaction-screen screen-enter">
    <header><div><span className="live-dot" /> Conversazione in corso</div><button onClick={() => navigate(`/ospiti/${resident.id}`)}><X size={18} /> Chiudi</button></header>
    <main>
      <section className="interaction-primary">
        <span className="eyebrow">ROSS CON {resident.name.toUpperCase()}</span><h1>Ricordi guidati</h1><p>Modalità attiva · il contenuto resta tra ROSS e {resident.name.split(" ")[0]}</p>
        <div className={`waveform ${paused ? "paused" : ""}`} aria-label="Forma d'onda animata">{Array.from({ length: 38 }, (_, i) => <i key={i} style={{ height: `${18 + ((i * 17) % 52)}px`, animationDelay: `${(i % 8) * .08}s` }} />)}</div>
        <strong className="interaction-time">{duration}</strong>
        <div className="interaction-controls"><button onClick={() => setPaused(!paused)}><span>{paused ? <Play /> : <Pause />}</span>{paused ? "Riprendi" : "Pausa"}</button><button><span><Activity /></span>Cambia attività</button><button><span><BookOpen /></span>Segna momento</button><button><span><Minimize2 /></span>Riduci stimoli</button><button className="end" onClick={() => setComplete(true)}><span><Square /></span>Termina</button></div>
      </section>
      <aside className="interaction-context">
        <section><span className="eyebrow">CONTESTO IN USO</span><h3>Interessi in uso</h3>{["Viaggi", "Fotografia", "Musica italiana"].map((m) => <div className="context-memory" key={m}><span><BookOpen size={14} /></span><strong>{m}</strong><small>Categoria</small></div>)}</section>
        <section><span className="eyebrow">STILE INTERAZIONE</span>{Object.entries(style).map(([key, value]) => <label key={key}><span>{({ speed: "Velocità", phrases: "Frasi", initiative: "Iniziativa ROSS", pauses: "Pause" })[key]}</span><Select value={value} onValueChange={(next) => setStyle({ ...style, [key]: next })} label={key} options={{ speed: ["Lenta", "Normale"], phrases: ["Brevi", "Normali"], initiative: ["Bassa", "Media", "Alta"], pauses: ["Brevi", "Lunghe"] }[key]} /></label>)}</section>
        <div className="adaptive-note"><Gauge size={18} /><div><strong>Adattamento in corso</strong><p>ROSS sta mantenendo pause più lunghe e un solo stimolo alla volta.</p></div></div>
      </aside>
    </main>
    <Modal open={complete} title="Interazione completata" onClose={() => setComplete(false)} size="xl"><div className="completion-header"><span className="success-ring"><Check size={28} /></span><div><strong>12 min 42 sec</strong><p>Conversazione · ricordi guidati</p></div></div><div className="completion-grid"><section><span className="eyebrow">ESITO DELLA SESSIONE</span><h3>Partecipazione alta, serenità espressa.</h3><p>{resident.name.split(" ")[0]} ha partecipato per tutta la sessione, con risposte ricche e tempi distesi. Il contenuto della conversazione resta tra ROSS e {resident.name.split(" ")[0]}.</p><div className="tag-row"><span>Partecipazione 89%</span><span>Nessuna difficoltà</span><span>Modalità attiva</span></div><h4>Spunto per lo staff</h4><div className="next-suggestion"><AudioLines size={18} /><div><strong>Proporre un'attività con la cucina</strong><small>Nuovo interesse emerso: può aiutare a coinvolgerla nei prossimi giorni.</small></div></div></section><section className="candidate-memory"><span className="eyebrow">NUOVO INTERESSE EMERSO</span><h3>Cucina</h3><p>Emerso nella conversazione come categoria. I ricordi e i racconti restano a ROSS, che li userà con {resident.name.split(" ")[0]}.</p><div><span>Fonte</span><strong>Dati ROSS · oggi</strong></div><div><span>Visibile alla struttura</span><strong>Solo la categoria</strong></div><div className="confirmed-message"><Check size={18} /> Lo staff vede solo la categoria</div></section></div><div className="modal-actions"><button className="primary-button" onClick={closeComplete}>Torna alla cartella <ChevronDown size={16} /></button></div></Modal>
  </div>;
}
