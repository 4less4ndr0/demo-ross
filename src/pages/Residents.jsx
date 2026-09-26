import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Filter, MessageCircle, Search, Sparkles } from "lucide-react";
import { useDemo } from "../state/DemoContext";
import { relating, signalsFor } from "../data/careInsights";
import { Button, Select } from "../components/ui";
import { Avatar, EmptyState, ModeBadge, ProgressBar, SectionTitle } from "../components/Common";

export function Residents() {
  const { state } = useDemo();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("Tutte");
  const navigate = useNavigate();
  const filtered = useMemo(() => state.residents.filter((r) => (mode === "Tutte" || r.mode === mode) && `${r.name} ${r.room} ${r.interests.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [state.residents, query, mode]);
  return <div className="screen-enter">
    <SectionTitle eyebrow="Persone" title="Ospiti" description="Cosa ROSS sa di ogni persona. L'anagrafica resta nel gestionale della struttura." action={<Button variant="outline" onClick={() => navigate("/")}><Sparkles size={16} /> Chiedi a ROSS</Button>} />
    <div className="filter-bar"><label><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca nome, stanza o interesse" /></label><div><Filter size={16} /><Select value={mode} onValueChange={setMode} label="Modalità" options={["Tutte", "Attiva", "Reattiva", "Silenziosa"].map((v) => ({ value: v, label: v === "Tutte" ? "Tutte le modalità" : v }))} /></div></div>
    {!filtered.length ? <EmptyState /> : <div className="residents-grid">{filtered.map((resident) => <article key={resident.id} className="resident-card surface" onClick={() => navigate(`/ospiti/${resident.id}`)}>
      <header><Avatar resident={resident} size="lg" /><div><h3>{resident.name}</h3><p>{resident.age} anni · stanza {resident.room}</p></div><ModeBadge mode={resident.mode} /></header>
      <div className="resident-current"><span className={`status-dot status-${resident.status.toLowerCase().replace(" ", "-")}`} /><div><small>Adesso</small><strong>{resident.current}</strong></div></div>
      <div className="resident-last-topic"><MessageCircle size={14} /><span>Ultima conversazione con ROSS: <strong>alle {resident.lastInteraction}</strong>{signalsFor(resident.id).some((x) => !x.positive) && <em className="resident-watch"> · da osservare</em>}</span></div><div className="participation"><div><span>Partecipazione recente</span>{resident.participation == null ? <strong>Baseline in costruzione</strong> : <strong>{resident.participation.toFixed(1)} / 10</strong>}</div>{resident.participation != null && <ProgressBar value={resident.participation * 10} tone={resident.color} />}</div>
      <footer><div>{(relating[resident.id]?.interests || resident.interests.map((i) => [i])).slice(0, 3).map(([interest]) => <span key={interest}>{interest}</span>)}</div><ArrowRight size={18} /></footer>
    </article>)}</div>}
  </div>;
}
