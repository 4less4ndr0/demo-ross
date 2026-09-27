import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Filter, Leaf, MessageCircle, Search, Sparkles } from "lucide-react";
import { useDemo } from "../state/DemoContext";
import { attentionScore, highlightFor, highlightLabels, presenceFor } from "../data/careInsights";
import { Button, Select } from "../components/ui";
import { EmptyState, ModeBadge, residentPhoto, SectionTitle } from "../components/Common";

export function Residents() {
  const { state } = useDemo();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("Tutte");
  const navigate = useNavigate();
  const filtered = useMemo(() => state.residents
    .filter((r) => (mode === "Tutte" || r.mode === mode) && `${r.name} ${r.room} ${r.interests.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => attentionScore(b.id) - attentionScore(a.id)), [state.residents, query, mode]);
  return <div className="screen-enter">
    <SectionTitle eyebrow="Persone" title="Ospiti" description="Come sta ogni persona e come avvicinarla. Prima chi ha bisogno di più attenzione. L'anagrafica resta nel gestionale della struttura." action={<Button variant="outline" onClick={() => navigate("/")}><Sparkles size={16} /> Chiedi a ROSS</Button>} />
    <div className="filter-bar"><label><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca nome, stanza o interesse" /></label><div><Filter size={16} /><Select value={mode} onValueChange={setMode} label="Modalità" options={["Tutte", "Attiva", "Reattiva", "Silenziosa"].map((v) => ({ value: v, label: v === "Tutte" ? "Tutte le modalità" : v }))} /></div></div>
    {!filtered.length ? <EmptyState /> : <div className="residents-grid">{filtered.map((resident) => {
      // In copertina solo chi è, quando ha parlato con ROSS e uno spunto (non un avviso):
      // un interesse emerso o una condizione del periodo. Come sta, bisogni e interessi sono nel ritratto.
      const highlight = highlightFor(resident.id, state);
      const absent = presenceFor(resident.id).some((p) => p.kind === "assenza");
      const photo = residentPhoto(resident);
      return <article key={resident.id} className="resident-card surface" onClick={() => navigate(`/ospiti/${resident.id}`)} onKeyDown={(e) => e.key === "Enter" && navigate(`/ospiti/${resident.id}`)} tabIndex={0} aria-label={`Apri il ritratto di ${resident.name}`}>
        <div className="resident-photo">{photo ? <img src={photo} alt="" loading="lazy" /> : <span className={`avatar-${resident.color || "mint"}`}>{resident.initials}</span>}<ModeBadge mode={resident.mode} /></div>
        <div className="resident-body">
          <header><div><h3>{resident.name}</h3><p>{resident.age} anni · stanza {resident.room}</p></div><ArrowRight size={18} /></header>
          <div className="resident-presence"><MessageCircle size={15} /><span>Ultima conversazione con ROSS: <strong>{absent ? resident.lastInteraction : `oggi alle ${resident.lastInteraction}`}</strong></span></div>
          {highlight && <p className={`resident-highlight highlight-${highlight.kind}`}>{highlight.kind === "emerso" ? <Sparkles size={15} /> : <Leaf size={15} />}<span><small>{highlightLabels[highlight.kind]}</small>{highlight.text}</span></p>}
        </div>
      </article>;
    })}</div>}
  </div>;
}
