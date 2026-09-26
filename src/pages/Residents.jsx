import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Filter, MessageCircle, Minus, Search, Sparkles } from "lucide-react";
import { useDemo } from "../state/DemoContext";
import { attentionFor, attentionScore, presenceFor, relating, signalsFor, trendOf } from "../data/careInsights";
import { Button, Select } from "../components/ui";
import { Avatar, EmptyState, ModeBadge, SectionTitle } from "../components/Common";

function Trend({ resident }) {
  if (resident.participation == null) return <span className="trend-pill">Baseline in costruzione</span>;
  const { tone, label } = trendOf(resident);
  const Icon = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus }[tone];
  return <span className={`trend-pill trend-${tone}`}><Icon size={14} />Partecipazione {label}</span>;
}

export function Residents() {
  const { state } = useDemo();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("Tutte");
  const navigate = useNavigate();
  const filtered = useMemo(() => state.residents
    .filter((r) => (mode === "Tutte" || r.mode === mode) && `${r.name} ${r.room} ${r.interests.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
    .map((r) => ({ resident: r, attention: attentionFor(r.id) }))
    .sort((a, b) => attentionScore(b.resident.id) - attentionScore(a.resident.id)), [state.residents, query, mode]);
  return <div className="screen-enter">
    <SectionTitle eyebrow="Persone" title="Ospiti" description="Come sta ogni persona e come avvicinarla. Prima chi ha bisogno di più attenzione. L'anagrafica resta nel gestionale della struttura." action={<Button variant="outline" onClick={() => navigate("/")}><Sparkles size={16} /> Chiedi a ROSS</Button>} />
    <div className="filter-bar"><label><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca nome, stanza o interesse" /></label><div><Filter size={16} /><Select value={mode} onValueChange={setMode} label="Modalità" options={["Tutte", "Attiva", "Reattiva", "Silenziosa"].map((v) => ({ value: v, label: v === "Tutte" ? "Tutte le modalità" : v }))} /></div></div>
    {!filtered.length ? <EmptyState /> : <div className="residents-grid">{filtered.map(({ resident, attention }) => {
      const positive = signalsFor(resident.id).find((s) => s.positive);
      const absent = presenceFor(resident.id).some((p) => p.kind === "assenza");
      return <article key={resident.id} className="resident-card surface" onClick={() => navigate(`/ospiti/${resident.id}`)}>
        <header><Avatar resident={resident} size="lg" /><div><h3>{resident.name}</h3><p>{resident.age} anni · stanza {resident.room}</p></div><ModeBadge mode={resident.mode} /></header>
        <div className="resident-presence"><MessageCircle size={15} /><span>{absent ? <>Ultima conversazione con ROSS: <strong>{resident.lastInteraction}</strong></> : <>Ultima conversazione con ROSS: <strong>oggi alle {resident.lastInteraction}</strong></>}</span></div>
        <Trend resident={resident} />
        <div className="resident-attention">{attention.length ? attention.slice(0, 2).map((a) => <span key={a.text} className={`attention-chip attention-${a.tone}`}>{a.tone === "watch" ? "Da osservare" : "Bisogno"} · {a.text}</span>) : positive ? <span className="attention-chip attention-ok">{positive.signal.charAt(0).toUpperCase()}{positive.signal.slice(1)} espressa · {positive.trend}</span> : <span className="attention-chip attention-ok">Nessun segnale particolare</span>}{attention.length > 2 && <small>+{attention.length - 2}</small>}</div>
        <footer><div>{(relating[resident.id]?.interests || resident.interests.map((i) => [i])).slice(0, 3).map(([interest]) => <span key={interest}>{interest}</span>)}</div><ArrowRight size={18} /></footer>
      </article>;
    })}</div>}
  </div>;
}
