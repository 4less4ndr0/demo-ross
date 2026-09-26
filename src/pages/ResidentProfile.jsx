import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, CalendarPlus, Check, FileText, Link2, MessageCircle, MoreHorizontal, Paperclip, Pencil, Plus, Search, Sparkles, Users } from "lucide-react";
import { useDemo } from "../state/DemoContext";
import { Avatar, DataExplanation, EmptyState, InfoTip, Modal, ModeBadge, ProgressBar } from "../components/Common";
import { KnowledgeGraph } from "../components/KnowledgeGraph";

const tabs = [["sintesi", "Sintesi"], ["conversazioni", "Conversazioni ROSS"], ["memorie", "Memorie e storia"], ["relazioni", "Relazioni"], ["documenti", "Documenti"]];
const tabAliases = { panoramica: "sintesi", andamento: "sintesi", attivita: "sintesi", interazioni: "conversazioni", storia: "memorie" };
const normalizeTab = (value) => { const key = (value || "sintesi").toLowerCase(); const id = tabAliases[key] || key; return tabs.some(([t]) => t === id) ? id : "sintesi"; };

export function ResidentProfile() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { state, actions } = useDemo();
  const navigate = useNavigate();
  const resident = state.residents.find((r) => r.id === id) || state.residents[0];
  const tab = normalizeTab(params.get("tab"));
  const [eventOpen, setEventOpen] = useState(false);
  const [eventForm, setEventForm] = useState({ year: "", title: "", description: "", place: "", source: "Operatore", people: [] });
  const residentMemories = state.memories.filter((m) => m.residentId === resident.id);
  const residentInteractions = state.interactions.filter((i) => i.residentId === resident.id).slice(0, 12);
  const hasConfirmedRossMemory = state.memories.some((m) => m.id === "ross-cefalu-camera" && m.status === "Confermata");
  const residentDocuments = state.documents.filter((d) => d.residentId === resident.id);
  const setTab = (next) => setParams({ tab: next });

  if (!resident) return <EmptyState title="Ospite non trovato" />;

  return <div className="profile-screen screen-enter">
    <section className="profile-header">
      <div className="profile-person"><Avatar resident={resident} size="xl" /><div><span className="eyebrow">OSPITE · STANZA {resident.room}</span><h1>{resident.name}</h1><p>{resident.age} anni · {resident.daysWithRoss} giorni con ROSS · ultima interazione {resident.lastInteraction}</p></div></div>
      <div className="profile-actions"><select value={resident.mode} onChange={(e) => actions.setResidentMode(resident.id, e.target.value)} aria-label="Modalità ROSS"><option>Attiva</option><option>Reattiva</option><option>Silenziosa</option></select><button className="ghost-button" onClick={() => navigate(`/?ospite=${resident.id}`)}><Sparkles size={16} /> Chiedi su {resident.name.split(" ")[0]}</button><button className="primary-button" onClick={() => navigate(`/interazione/${resident.id}`)}><MessageCircle size={17} /> Avvia interazione</button></div>
    </section>
    <div className="profile-tabs">{tabs.map(([id, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}{id === "documenti" && residentDocuments.length > 0 && <small className="tab-count">{residentDocuments.length}</small>}</button>)}</div>
    {tab === "sintesi" && <><Overview resident={resident} memories={residentMemories} interactions={residentInteractions} navigate={navigate} journey={state.rossJourney} onAll={() => setTab("conversazioni")} /><Trend resident={resident} /></>}
    {tab === "conversazioni" && <InteractionList interactions={residentInteractions} />}
    {tab === "memorie" && <><MemoryLibrary memories={residentMemories} actions={actions} />{resident.id === "elena" && <Story events={state.biography} onAdd={() => setEventOpen(true)} />}</>}
    {tab === "relazioni" && <Relations resident={resident} hasConfirmedRossMemory={hasConfirmedRossMemory} />}
    {tab === "documenti" && <Documents resident={resident} documents={residentDocuments} actions={actions} navigate={navigate} />}
    <Modal open={eventOpen} title="Aggiungi evento alla storia" onClose={() => setEventOpen(false)}>
      <form className="form-grid" onSubmit={(e) => { e.preventDefault(); actions.addBiographyEvent(eventForm); setEventOpen(false); }}>
        <label>Anno<input required value={eventForm.year} onChange={(e) => setEventForm({ ...eventForm, year: e.target.value })} placeholder="es. 1989" /></label>
        <label>Titolo<input required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Titolo dell'evento" /></label>
        <label className="span-2">Descrizione<textarea required value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} /></label>
        <label>Luogo<input value={eventForm.place} onChange={(e) => setEventForm({ ...eventForm, place: e.target.value })} /></label>
        <label>Fonte<select value={eventForm.source} onChange={(e) => setEventForm({ ...eventForm, source: e.target.value })}><option>Operatore</option><option>Residente</option><option>Famiglia</option><option>Conversazioni</option></select></label>
        <div className="modal-actions span-2"><button type="button" className="ghost-button" onClick={() => setEventOpen(false)}>Annulla</button><button className="primary-button">Aggiungi evento</button></div>
      </form>
    </Modal>
  </div>;
}

function Overview({ resident, memories, interactions, navigate, journey, onAll }) {
  return <div className="profile-overview">
    <div className="overview-main">
      <article className="narrative-card surface"><span className="eyebrow">OGGI</span><h2>{journey.completedAt ? "Musica, Cefalù e un nuovo dettaglio da custodire." : "Una giornata ricca di musica e ricordi."}</h2><p>{journey.completedAt ? `${resident.name.split(" ")[0]} ha ripreso con ROSS il viaggio del 1998. Nel racconto è emerso un dettaglio sulla macchina fotografica rossa di Paolo, registrato con fonte e stato di verifica.` : `${resident.name.split(" ")[0]} ha svolto due interazioni per 27 minuti complessivi. Ha partecipato volentieri all'attività musicale e ha parlato spontaneamente della nipote Sofia.`}</p><div className="narrative-stats"><div><strong>{journey.completedAt ? "41 min" : "27 min"}</strong><span>tempo insieme</span></div><div><strong>{journey.completedAt ? "3" : "2"}</strong><span>interazioni</span></div><div><strong>{journey.completedAt ? "1" : "+0.7"}</strong><span>{journey.completedAt ? "nuovo ricordo" : "vs baseline"}</span></div></div></article>
      <section className="continuity-card surface"><div><span className="eyebrow">CONTINUA DA QUI</span><h3>Fotografie e vacanze in Sicilia</h3><p>Riprendi il racconto da Palermo e collega le fotografie di Sofia.</p></div><button className="primary-button" onClick={() => navigate(`/interazione/${resident.id}`)}>Avvia <ArrowRight size={16} /></button></section>
      <section className="recent-list surface"><header><h3>Interazioni recenti</h3><button onClick={onAll}>Vedi tutte</button></header>{interactions.slice(0, 4).map((item) => <div key={item.id}><span className="activity-icon"><MessageCircle size={16} /></span><div><strong>{item.type} · {item.topic}</strong><small>{item.date} alle {item.time}</small></div><span>{item.duration} min</span></div>)}</section>
    </div>
    <aside className="overview-side">
      <section className="surface compact-section"><h3>Interessi principali</h3><div className="tag-cloud">{resident.interests.map((i) => <span key={i}>{i}</span>)}</div></section>
      <section className="surface compact-section"><h3>Persone importanti</h3>{["Sofia · nipote", "Anna · figlia", "Paolo · marito"].map((p) => <div className="relation-mini" key={p}><span>{p[0]}</span><strong>{p}</strong><ArrowRight size={14} /></div>)}</section>
      <section className="surface compact-section"><h3>Ultimi ricordi</h3>{memories.slice(0, 3).map((m) => <div className="memory-mini" key={m.id}><span className={`memory-status ${m.status === "Confermata" ? "confirmed" : "pending"}`} /><div><strong>{m.title}</strong><small>{m.status}</small></div></div>)}</section>
    </aside>
  </div>;
}

function Story({ events, onAdd }) {
  return <section className="content-section"><div className="content-toolbar"><div><h2>Storia di Elena</h2><p>Eventi confermati e fonti sempre visibili.</p></div><button className="primary-button" onClick={onAdd}><CalendarPlus size={16} /> Aggiungi evento</button></div><div className="biography-timeline">{events.map((event) => <article key={`${event.year}-${event.title}`}><span className="bio-year">{event.year}</span><i /><div className="surface"><div className="bio-meta"><span>{event.place}</span><span>Fonte: {event.source}</span></div><h3>{event.title}</h3><p>{event.description}</p><div>{event.people.map((p) => <span className="person-chip" key={p}>{p}</span>)}</div><button className="more-button"><MoreHorizontal size={18} /></button></div></article>)}</div></section>;
}

function MemoryLibrary({ memories, actions }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Tutte");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ title: "", description: "", category: "Ricordi", source: "Operatore", status: "Da verificare" });
  const filtered = useMemo(() => memories.filter((m) => (status === "Tutte" || m.status === status) && `${m.title} ${m.description} ${m.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [memories, query, status]);
  const openNew = () => { setDraft({ title: "", description: "", category: "Ricordi", source: "Operatore", status: "Da verificare" }); setEditing("new"); };
  const openEdit = (memory) => { setDraft({ title: memory.title, description: memory.description, category: memory.category, source: memory.source, status: memory.status }); setEditing(memory.id); };
  const save = (event) => { event.preventDefault(); editing === "new" ? actions.addMemory(draft) : actions.updateMemory(editing, draft); setEditing(null); };
  return <section className="content-section"><div className="content-toolbar"><div><h2>Memory Library</h2><p>Ricordi strutturati, verificabili e riutilizzabili nelle interazioni.</p></div><button className="primary-button" onClick={openNew}><Plus size={16} /> Nuova memoria</button></div><div className="filter-bar"><label><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca nelle memorie" /></label><select value={status} onChange={(e) => setStatus(e.target.value)}><option>Tutte</option><option>Confermata</option><option>Da verificare</option><option>Suggerita</option></select></div><div className="memory-grid">{filtered.map((memory) => <article className={`memory-card surface ${memory.id === "ross-cefalu-camera" || memory.familyContributionId ? "memory-card-new" : ""}`} key={memory.id} onDoubleClick={() => setSelected(memory)}>{memory.familyContributionId && <span className="new-memory-flag"><Users size={13} /> Contributo famiglia</span>}{memory.id === "ross-cefalu-camera" && <span className="new-memory-flag"><Sparkles size={13} /> Emersa dalla demo ROSS</span>}<header><span>{memory.category}</span><span className={`status-pill status-${memory.status.toLowerCase().replaceAll(" ", "-")}`}>{memory.status}</span></header><button className="memory-open" onClick={() => setSelected(memory)}><h3>{memory.title}</h3><p>{memory.description}</p></button><div className="memory-source"><strong>Fonte</strong><span>{memory.source}</span><strong>Confidenza</strong><span>{memory.confidence}%</span></div><div className="tag-row">{memory.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><footer><small>Ultimo utilizzo: {memory.lastUsed}</small><div>{memory.status !== "Confermata" && <button onClick={() => actions.confirmMemory(memory)} title="Conferma memoria"><Check size={16} /></button>}<button title="Apri collegamenti" onClick={() => setSelected(memory)}><Link2 size={16} /></button><button title="Modifica" onClick={() => openEdit(memory)}><Pencil size={16} /></button></div></footer></article>)}</div>
    <Modal open={Boolean(selected)} title={selected?.title || "Memoria"} onClose={() => setSelected(null)} size="lg">{selected && <div className="operator-memory-detail"><header><span className={`status-pill status-${selected.status.toLowerCase().replaceAll(" ", "-")}`}>{selected.status}</span><small>{selected.source}</small></header>{selected.image && <img src={selected.image} alt={`Immagine collegata a ${selected.title}`} />}<p>{selected.description}</p><dl><div><dt>Persone</dt><dd>{selected.people?.join(", ") || "—"}</dd></div><div><dt>Luogo / periodo</dt><dd>{[selected.place, selected.period].filter(Boolean).join(" · ") || selected.tags.join(" · ")}</dd></div><div><dt>Riutilizzo</dt><dd>{selected.status === "Confermata" ? "Disponibile a ROSS e famiglia" : "Bloccato fino alla verifica"}</dd></div></dl><div className="modal-actions">{selected.status !== "Confermata" && <button className="primary-button" onClick={() => { actions.confirmMemory(selected); setSelected(null); }}><Check size={16} /> Conferma e collega</button>}<button className="ghost-button" onClick={() => { setSelected(null); openEdit(selected); }}><Pencil size={16} /> Modifica</button></div></div>}</Modal>
    <Modal open={Boolean(editing)} title={editing === "new" ? "Nuova memoria" : "Modifica memoria"} onClose={() => setEditing(null)}><form className="form-grid" onSubmit={save}><label>Titolo<input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label><label>Categoria<select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}><option>Ricordi</option><option>Persone</option><option>Luoghi</option><option>Musica</option><option>Routine</option></select></label><label className="span-2">Descrizione<textarea required value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label><label>Fonte<select value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })}><option>Operatore</option><option>Residente</option><option>Famiglia</option><option>Conversazioni</option></select></label><label>Stato<select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}><option>Da verificare</option><option>Suggerita</option><option>Confermata</option></select></label><div className="modal-actions span-2"><button className="ghost-button" type="button" onClick={() => setEditing(null)}>Annulla</button><button className="primary-button">Salva memoria</button></div></form></Modal>
  </section>;
}

function Relations({ resident, hasConfirmedRossMemory }) {
  return <section className="content-section"><div className="content-toolbar"><div><h2>Relazioni e contesti</h2><p>Il grafo mostra frequenza, ricorrenza e associazioni. Non misura la qualità affettiva.</p></div><select><option>Ultimi 30 giorni</option><option>Ultimi 90 giorni</option><option>Tutto il periodo</option></select></div><KnowledgeGraph addedMemory={hasConfirmedRossMemory} /><div className="relation-summary-grid"><article className="surface social-score"><span>Indice di socialità <InfoTip label="Indice di socialità" text="Combina frequenza, iniziativa, partecipazione e varietà dei contesti osservati da ROSS. Non è una valutazione clinica." /></span><strong>{resident.participation || "—"} <small>/ 10</small></strong><p>+0.6 rispetto alla baseline personale</p><ProgressBar value={(resident.participation || 0) * 10} tone="mint" /></article><article className="surface"><h3>Contesti osservati</h3><div className="distribution-bars"><div><span>Attività di gruppo</span><i style={{ width: "72%" }} /></div><div><span>Conversazioni individuali</span><i style={{ width: "88%" }} /></div><div><span>Famiglia</span><i style={{ width: "51%" }} /></div></div></article><article className="surface"><h3>Connessioni ricorrenti</h3><p>{hasConfirmedRossMemory ? "Paolo, Cefalù e fotografia sono ora collegati da un ricordo confermato." : "Sofia, fotografia e Sicilia compaiono insieme in 6 interazioni recenti."}</p><DataExplanation>ROSS segnala l'associazione; l'operatore decide se usarla.</DataExplanation></article></div></section>;
}

function InteractionList({ interactions }) { return <section className="content-section"><div className="content-toolbar"><div><h2>Conversazioni con ROSS</h2><p>Temi, durata, modalità e memorie utilizzate in ogni sessione.</p></div></div><div className="table-wrap surface"><table><thead><tr><th>Data</th><th>Tipologia</th><th>Tema</th><th>Durata</th><th>Modalità</th><th>Memorie</th></tr></thead><tbody>{interactions.map((i) => <tr key={i.id}><td>{i.date}<small>{i.time}</small></td><td>{i.type}</td><td>{i.topic}</td><td>{i.duration} min</td><td><ModeBadge mode={i.mode} /></td><td>{i.memoriesUsed}</td></tr>)}</tbody></table></div></section>; }

function Trend({ resident }) { return <section className="content-section"><div className="content-toolbar"><div><h2>Andamento personale</h2><p>Confronti sempre riferiti alla baseline di {resident.name.split(" ")[0]}.</p></div><select><option>Ultimi 30 giorni</option><option>Ultimi 90 giorni</option></select></div><div className="trend-grid">{[["Partecipazione", 76, "+6%"], ["Iniziativa conversazionale", 64, "−2%"], ["Varietà dei contesti", 82, "+9%"], ["Continuità", 71, "+3%"]].map(([label, value, delta]) => <article className="surface" key={label}><span>{label}</span><strong>{value}%</strong><ProgressBar value={value} tone="mint" /><small>{delta} rispetto alla baseline</small></article>)}</div><DataExplanation>Questi indicatori descrivono solo ciò che accade durante le interazioni con ROSS e non rappresentano valutazioni cliniche.</DataExplanation></section>; }

function Documents({ resident, documents, actions, navigate }) {
  const fileRef = useRef(null);
  const upload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const name = file.name.toLowerCase();
    const kind = /fisio|riabilit|motori/.test(name) ? "Fisioterapia" : /sangue|analisi|esami|lab/.test(name) ? "Esami del sangue" : "Documento";
    actions.addDocument({ residentId: resident.id, kind, title: file.name.replace(/\.[^.]+$/, ""), summary: "Caricato ora. ROSS lo userà come fonte nelle risposte, citandolo." });
  };
  return <section className="content-section"><div className="content-toolbar"><div><h2>Documenti</h2><p>Referti e relazioni che ROSS può citare quando lo staff fa una domanda. La cartella clinica ufficiale resta nel gestionale.</p></div><button className="primary-button" onClick={() => fileRef.current?.click()}><Paperclip size={16} /> Carica documento</button><input ref={fileRef} type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt" onChange={upload} /></div>
    {!documents.length ? <EmptyState title="Nessun documento" description="Carica una relazione di fisioterapia o un referto: ROSS lo userà come fonte." icon={FileText} /> : <div className="document-list">{documents.map((doc) => <article className="document-card surface" key={doc.id}><span className="document-icon"><FileText size={20} /></span><div><small>{doc.kind} · {doc.date}</small><h3>{doc.title}</h3><p>{doc.summary}</p><span className="document-meta">{doc.author} · {doc.pages} {doc.pages === 1 ? "pagina" : "pagine"}</span></div><button className="ghost-button" onClick={() => navigate(`/?ospite=${resident.id}&q=${encodeURIComponent(`Cosa dice ${doc.kind.toLowerCase()} di ${resident.name.split(" ")[0]}?`)}`)}><Sparkles size={15} /> Chiedi a ROSS</button></article>)}</div>}
    <DataExplanation>ROSS legge i documenti per rispondere alle domande dello staff e li cita come fonte. Non interpreta valori clinici e non sostituisce il gestionale.</DataExplanation>
  </section>;
}
