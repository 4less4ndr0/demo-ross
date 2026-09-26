import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Activity, AudioLines, BookOpen, Check, ChevronDown, Gauge, MessageSquareText, Minimize2, Pause, Play, Square, X } from "lucide-react";
import { useDemo } from "../state/DemoContext";
import { Dialog as Modal, Select } from "../components/ui";

export function LiveInteraction() {
  const { id } = useParams();
  const { state, actions } = useDemo();
  const resident = state.residents.find((r) => r.id === id) || state.residents[0];
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [transcript, setTranscript] = useState(false);
  const [complete, setComplete] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [style, setStyle] = useState({ speed: "Lenta", phrases: "Brevi", initiative: "Media", pauses: "Lunghe" });
  const navigate = useNavigate();
  useEffect(() => { if (paused || complete) return; const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000); return () => window.clearInterval(timer); }, [paused, complete]);
  const duration = useMemo(() => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`, [seconds]);
  const newMemory = { id: "new-vongole", residentId: resident.id, title: "Spaghetti alle vongole in Sicilia", category: "Cibo", description: "Durante il racconto Elena ha ricordato che Paolo ordinava sempre spaghetti alle vongole durante le vacanze in Sicilia.", source: "Interazione · 21 settembre", status: "Da verificare", confidence: 74, lastUsed: "Mai", tags: ["Sicilia", "Paolo", "cibo"], people: ["Paolo"] };
  const closeComplete = () => {
    actions.completeInteraction({ residentId: resident.id, resident: resident.name, time: "17:18", duration: Math.max(12, Math.ceil(seconds / 60)), type: "Conversazione", topic: "Vacanze in Sicilia", mode: "Attiva", participation: 89, memoriesUsed: 4, emerged: 1 });
    navigate(`/ospiti/${resident.id}?tab=memorie`);
  };
  return <div className="interaction-screen screen-enter">
    <header><div><span className="live-dot" /> Conversazione in corso</div><button onClick={() => navigate(`/ospiti/${resident.id}`)}><X size={18} /> Chiudi</button></header>
    <main>
      <section className="interaction-primary">
        <span className="eyebrow">ROSS CON {resident.name.toUpperCase()}</span><h1>Vacanze in Sicilia</h1><p>Ricordi guidati · Modalità attiva</p>
        <div className={`waveform ${paused ? "paused" : ""}`} aria-label="Forma d'onda animata">{Array.from({ length: 38 }, (_, i) => <i key={i} style={{ height: `${18 + ((i * 17) % 52)}px`, animationDelay: `${(i % 8) * .08}s` }} />)}</div>
        <strong className="interaction-time">{duration}</strong>
        <div className="interaction-controls"><button onClick={() => setPaused(!paused)}><span>{paused ? <Play /> : <Pause />}</span>{paused ? "Riprendi" : "Pausa"}</button><button><span><Activity /></span>Cambia attività</button><button><span><BookOpen /></span>Segna momento</button><button><span><Minimize2 /></span>Riduci stimoli</button><button className="end" onClick={() => setComplete(true)}><span><Square /></span>Termina</button></div>
        <button className="transcript-button" onClick={() => setTranscript(!transcript)}><MessageSquareText size={16} /> Trascrizione <ChevronDown size={15} /></button>
        {transcript && <div className="transcript-drawer"><p><strong>Elena</strong> A Palermo faceva molto caldo, ma la sera passeggiavamo vicino al mare.</p><p><strong>ROSS</strong> Hai qualche fotografia di quelle passeggiate?</p><p><strong>Elena</strong> Sì, Sofia le ha rimesse in ordine. Paolo prendeva sempre gli spaghetti alle vongole.</p></div>}
      </section>
      <aside className="interaction-context">
        <section><span className="eyebrow">CONTESTO IN USO</span><h3>Memorie utilizzate</h3>{["Palermo", "Viaggio del 1998", "Paolo", "Fotografia"].map((m) => <div className="context-memory" key={m}><span><BookOpen size={14} /></span><strong>{m}</strong><small>Confermata</small></div>)}</section>
        <section><span className="eyebrow">STILE INTERAZIONE</span>{Object.entries(style).map(([key, value]) => <label key={key}><span>{({ speed: "Velocità", phrases: "Frasi", initiative: "Iniziativa ROSS", pauses: "Pause" })[key]}</span><Select value={value} onValueChange={(next) => setStyle({ ...style, [key]: next })} label={key} options={{ speed: ["Lenta", "Normale"], phrases: ["Brevi", "Normali"], initiative: ["Bassa", "Media", "Alta"], pauses: ["Brevi", "Lunghe"] }[key]} /></label>)}</section>
        <div className="adaptive-note"><Gauge size={18} /><div><strong>Adattamento in corso</strong><p>ROSS sta mantenendo pause più lunghe e un solo stimolo alla volta.</p></div></div>
      </aside>
    </main>
    <Modal open={complete} title="Interazione completata" onClose={() => setComplete(false)} size="xl"><div className="completion-header"><span className="success-ring"><Check size={28} /></span><div><strong>12 min 42 sec</strong><p>Conversazione · Vacanze in Sicilia</p></div></div><div className="completion-grid"><section><span className="eyebrow">RIEPILOGO</span><h3>Un ricordo di viaggio si collega alla storia di Paolo.</h3><p>Elena ha raccontato le passeggiate serali a Palermo e ha ricordato un'abitudine condivisa con il marito durante le vacanze.</p><div className="tag-row"><span>Palermo</span><span>Paolo</span><span>Fotografia</span><span>Cibo</span></div><h4>Prossimo suggerimento</h4><div className="next-suggestion"><AudioLines size={18} /><div><strong>Riproporre fotografie della Sicilia</strong><small>Collega questo racconto alla memoria visiva.</small></div></div></section><section className="candidate-memory"><span className="eyebrow">POSSIBILE NUOVA MEMORIA</span><h3>{newMemory.title}</h3><p>{newMemory.description}</p><div><span>Fonte</span><strong>{newMemory.source}</strong></div><div><span>Stato</span><strong>{confirmed ? "Confermata" : "Da verificare"}</strong></div>{!confirmed ? <div className="candidate-actions"><button className="primary-button" onClick={() => { actions.confirmMemory(newMemory); setConfirmed(true); }}>Conferma memoria</button><button className="ghost-button">Modifica</button><button className="text-button">Ignora</button></div> : <div className="confirmed-message"><Check size={18} /> Memoria aggiunta al profilo e al grafo</div>}</section></div><div className="modal-actions"><button className="primary-button" onClick={closeComplete}>Apri profilo aggiornato <ChevronDown size={16} /></button></div></Modal>
  </div>;
}
