import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, CalendarPlus, Check, FileText, Link2, MessageCircle, MoreHorizontal, Paperclip, Pencil, Plus, Printer, Search, Sparkles, Users } from "lucide-react";
import { useDemo } from "../state/DemoContext";
import { Avatar, DataExplanation, EmptyState, InfoTip, ModeBadge, ProgressBar } from "../components/Common";
import { KnowledgeGraph } from "../components/KnowledgeGraph";
import { journeyInterest, needsFor, presenceFor, relating, signalsFor } from "../data/careInsights";
import { buildResidentReport } from "../data/reportNarrative";
import { Button, Dialog as Modal, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Select } from "../components/ui";

function PeriodSelect({ options }) {
  const [value, setValue] = useState(options[0]);
  return <Select value={value} onValueChange={setValue} label="Periodo" options={options.map((o) => ({ value: o, label: o }))} />;
}

const tabs = [["sintesi", "Sintesi"], ["conversazioni", "Conversazioni ROSS"], ["memorie", "Storia e interessi"], ["relazioni", "Relazioni"], ["documenti", "Documenti"]];
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
  const residentDocuments = state.documents.filter((d) => d.residentId === resident.id);
  const setTab = (next) => setParams({ tab: next });

  if (!resident) return <EmptyState title="Ospite non trovato" />;

  return <div className="profile-screen screen-enter">
    <section className="profile-header">
      <div className="profile-person"><Avatar resident={resident} size="xl" /><div><span className="eyebrow">OSPITE · STANZA {resident.room}</span><h1>{resident.name}</h1><p>{resident.age} anni · {resident.daysWithRoss} giorni con ROSS · ultima interazione {resident.lastInteraction}</p></div></div>
      <div className="profile-actions"><Select value={resident.mode} onValueChange={(mode) => actions.setResidentMode(resident.id, mode)} label="Modalità ROSS" options={["Attiva", "Reattiva", "Silenziosa"].map((v) => ({ value: v, label: `Modalità ${v.toLowerCase()}` }))} /><Button variant="outline" onClick={() => navigate(`/?ospite=${resident.id}`)}><Sparkles size={16} /> Chiedi su {resident.name.split(" ")[0]}</Button><Button onClick={() => navigate(`/interazione/${resident.id}`)}><MessageCircle size={16} /> Avvia interazione</Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="Altre azioni"><MoreHorizontal size={17} /></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem icon={Printer} onSelect={() => navigate(`/report?ospite=${resident.id}&stampa=1`)}>Stampa report</DropdownMenuItem><DropdownMenuItem icon={FileText} onSelect={() => navigate(`/report?ospite=${resident.id}`)}>Apri report</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem icon={Paperclip} onSelect={() => navigate(`/?ospite=${resident.id}`)}>Allega documento in chat</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
    </section>
    <div className="profile-tabs">{tabs.map(([id, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}{id === "documenti" && residentDocuments.length > 0 && <small className="tab-count">{residentDocuments.length}</small>}</button>)}</div>
    {tab === "sintesi" && <><Overview resident={resident} interactions={residentInteractions} navigate={navigate} journey={state.rossJourney} onAll={() => setTab("conversazioni")} /><Trend resident={resident} /></>}
    {tab === "conversazioni" && <InteractionList interactions={residentInteractions} />}
    {tab === "memorie" && <><Interests resident={resident} journey={state.rossJourney} /><FamilyContributions memories={residentMemories.filter((m) => m.familyContributionId)} actions={actions} />{resident.id === "elena" ? <Story events={state.biography.filter((e) => !/macchina fotografica/i.test(e.title))} onAdd={() => setEventOpen(true)} /> : <section className="content-section"><EmptyState title="Biografia d'ingresso non ancora compilata" description="La compilano famiglia e struttura all'ingresso. ROSS non aggiunge ricordi emersi nelle conversazioni." icon={CalendarPlus} /></section>}</>}
    {tab === "relazioni" && <Relations resident={resident} />}
    {tab === "documenti" && <Documents resident={resident} documents={residentDocuments} navigate={navigate} />}
    <Modal open={eventOpen} title="Aggiungi evento alla storia" onClose={() => setEventOpen(false)}>
      <form className="form-grid" onSubmit={(e) => { e.preventDefault(); actions.addBiographyEvent(eventForm); setEventOpen(false); }}>
        <label>Anno<input required value={eventForm.year} onChange={(e) => setEventForm({ ...eventForm, year: e.target.value })} placeholder="es. 1989" /></label>
        <label>Titolo<input required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Titolo dell'evento" /></label>
        <label className="span-2">Descrizione<textarea required value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} /></label>
        <label>Luogo<input value={eventForm.place} onChange={(e) => setEventForm({ ...eventForm, place: e.target.value })} /></label>
        <label>Fonte<Select value={eventForm.source} onValueChange={(source) => setEventForm({ ...eventForm, source })} label="Fonte" options={["Operatore", "Residente", "Famiglia"]} /></label>
        <div className="modal-actions span-2"><button type="button" className="ghost-button" onClick={() => setEventOpen(false)}>Annulla</button><button className="primary-button">Aggiungi evento</button></div>
      </form>
    </Modal>
  </div>;
}

function Overview({ resident, interactions, navigate, journey, onAll }) {
  const own = signalsFor(resident.id);
  const ownNeeds = needsFor(resident.id);
  const presence = presenceFor(resident.id);
  const r = relating[resident.id];
  const name = resident.name.split(" ")[0];
  const newInterest = journey.completedAt && resident.id === journeyInterest.residentId;
  const summary = buildResidentReport(useDemo().state, resident, "7");
  return <div className="profile-overview">
    <div className="overview-main">
      <article className="narrative-card surface"><span className="eyebrow">QUESTA SETTIMANA</span><h2>{summary.headline}</h2><p>{summary.paragraphs.join(" ")}</p><div className="narrative-stats">{summary.kpis.slice(0, 3).map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></article>
      <section className="continuity-card surface"><div><span className="eyebrow">COME COINVOLGERE {name.toUpperCase()}</span><h3>{r ? `${r.bestTime.charAt(0).toUpperCase()}${r.bestTime.slice(1)} · ${r.duration}` : "Indicazioni in costruzione"}</h3><p>{newInterest ? journeyInterest.how : r ? `Funziona: ${r.works.join(", ").toLowerCase()}. ${r.avoid}.` : ""}</p></div><button className="primary-button" onClick={() => navigate(`/interazione/${resident.id}`)}>Avvia <ArrowRight size={16} /></button></section>
      <section className="recent-list surface"><header><h3>Conversazioni recenti</h3><button onClick={onAll}>Vedi tutte</button></header>{interactions.slice(0, 4).map((item) => <div key={item.id}><span className="activity-icon"><MessageCircle size={16} /></span><div><strong>{item.type} · partecipazione {item.participation >= 80 ? "alta" : item.participation >= 65 ? "media" : "bassa"}</strong><small>{item.date} alle {item.time}</small></div><span>{item.duration} min</span></div>)}</section>
    </div>
    <aside className="overview-side">
      <section className="surface compact-section"><h3>Da osservare</h3>{own.filter((x) => !x.positive).length ? own.filter((x) => !x.positive).map((x) => <div className="memory-mini" key={x.signal}><span className="memory-status pending" /><div><strong>{x.signal.charAt(0).toUpperCase() + x.signal.slice(1)}</strong><small>{x.note || `${x.count} conversazioni su ${x.of} · di solito ${x.usual}`}</small></div></div>) : <p className="compact-empty">Nessun segnale particolare rispetto alla sua media.</p>}{own.filter((x) => x.positive).map((x) => <div className="memory-mini" key={x.signal}><span className="memory-status confirmed" /><div><strong>{x.signal.charAt(0).toUpperCase() + x.signal.slice(1)}</strong><small>{x.count} conversazioni su {x.of} · di solito {x.usual}</small></div></div>)}</section>
      <section className="surface compact-section"><h3>Bisogni espressi</h3>{ownNeeds.length ? ownNeeds.map((n) => <div className="memory-mini" key={n.text}><span className="memory-status pending" /><div><strong>{n.text}</strong><small>{n.times > 1 ? `${n.times} volte questa settimana` : "questa settimana"}</small></div></div>) : <p className="compact-empty">Nessun bisogno particolare espresso.</p>}{presence.map((p) => <div className="memory-mini" key={p.text}><span className="memory-status pending" /><div><strong>{p.kind === "assenza" ? "Assenza insolita" : "Momenti di difficoltà"}</strong><small>{p.text}</small></div></div>)}</section>
      <section className="surface compact-section"><h3>Interessi</h3><div className="tag-cloud">{(r?.interests || resident.interests.map((i) => [i])).map(([label]) => <span key={label}>{label}</span>)}{newInterest && <span className="tag-new">{journeyInterest.label} · nuovo</span>}</div></section>
    </aside>
  </div>;
}

function Story({ events, onAdd }) {
  return <section className="content-section"><div className="content-toolbar"><div><h2>Storia di Elena</h2><p>Eventi confermati e fonti sempre visibili.</p></div><button className="primary-button" onClick={onAdd}><CalendarPlus size={16} /> Aggiungi evento</button></div><div className="biography-timeline">{events.map((event) => <article key={`${event.year}-${event.title}`}><span className="bio-year">{event.year}</span><i /><div className="surface"><div className="bio-meta"><span>{event.place}</span><span>Fonte: {event.source}</span></div><h3>{event.title}</h3><p>{event.description}</p><div>{event.people.map((p) => <span className="person-chip" key={p}>{p}</span>)}</div><button className="more-button"><MoreHorizontal size={18} /></button></div></article>)}</div></section>;
}

function Interests({ resident, journey }) {
  const r = relating[resident.id];
  const newInterest = journey.completedAt && resident.id === journeyInterest.residentId;
  const list = [...(r?.interests || []), ...(newInterest ? [[journeyInterest.label, "Emerso con ROSS", true]] : [])];
  return <section className="content-section"><div className="content-toolbar"><div><h2>Interessi</h2><p>Dalla biografia d'ingresso e, per categoria, da ciò che emerge con ROSS. I ricordi e i racconti restano tra ROSS e {resident.name.split(" ")[0]}.</p></div></div>
    <div className="interest-grid">{list.map(([label, source, isNew]) => <article className={`interest-card surface ${isNew ? "interest-new" : ""}`} key={label}><small>{source}{isNew ? " · nuovo" : ""}</small><h3>{label}</h3><p>{isNew ? journeyInterest.how : source === "Emerso con ROSS" ? "Emerso nelle conversazioni: utile come spunto per attività e incontri." : "Indicato all'ingresso da famiglia o struttura."}</p></article>)}</div>
    {r && <div className="relating-strip surface"><div><span>Come rivolgersi</span><strong>{r.address}</strong></div><div><span>Momento migliore</span><strong>{r.bestTime}</strong></div><div><span>Durata ideale</span><strong>{r.duration}</strong></div><div><span>Attenzione</span><strong>{r.avoid}</strong></div></div>}
  </section>;
}

function FamilyContributions({ memories, actions }) {
  if (!memories.length) return null;
  return <section className="content-section"><div className="content-toolbar"><div><h2>Contributi della famiglia</h2><p>Ricordi e fotografie inviati dalla famiglia. Una volta verificati entrano nella biografia e ROSS può usarli.</p></div></div>
    <div className="interest-grid">{memories.map((m) => <article className="interest-card surface" key={m.id}><small>{m.source} · {m.status}</small><h3>{m.title}</h3><p>{m.description}</p>{m.status !== "Confermata" && <button className="ghost-button" onClick={() => actions.confirmMemory(m)}><Check size={15} /> Verifica e aggiungi alla biografia</button>}</article>)}</div>
  </section>;
}

function Relations({ resident }) {
  return <section className="content-section"><div className="content-toolbar"><div><h2>Relazioni e contesti</h2><p>Persone, luoghi e interessi dalla biografia d'ingresso. ROSS non aggiunge al grafo ciò che emerge nelle conversazioni.</p></div></div><KnowledgeGraph addedMemory={false} /><div className="relation-summary-grid"><article className="surface social-score"><span>Indice di socialità <InfoTip label="Indice di socialità" text="Combina frequenza, iniziativa, partecipazione e varietà dei contesti osservati da ROSS. Non è una valutazione clinica." /></span><strong>{resident.participation || "—"} <small>/ 10</small></strong><p>Rispetto alla baseline personale</p><ProgressBar value={(resident.participation || 0) * 10} tone="mint" /></article><article className="surface"><h3>Contesti osservati</h3><div className="distribution-bars"><div><span>Attività di gruppo</span><i style={{ width: "72%" }} /></div><div><span>Conversazioni individuali</span><i style={{ width: "88%" }} /></div><div><span>Chiamate con la famiglia</span><i style={{ width: "51%" }} /></div></div></article><article className="surface"><h3>Fonte del grafo</h3><p>Biografia d'ingresso compilata con la famiglia e contributi verificati dalla struttura.</p><DataExplanation>Il grafo non contiene argomenti o ricordi emersi nelle conversazioni con ROSS.</DataExplanation></article></div></section>;
}

function InteractionList({ interactions }) { return <section className="content-section"><div className="content-toolbar"><div><h2>Conversazioni con ROSS</h2><p>Quando, quanto e com'è andata. Il contenuto resta tra ROSS e l'ospite.</p></div></div><div className="table-wrap surface"><table><thead><tr><th>Data</th><th>Tipologia</th><th>Durata</th><th>Partecipazione</th><th>Modalità</th></tr></thead><tbody>{interactions.map((i) => <tr key={i.id}><td>{i.date}<small>{i.time}</small></td><td>{i.type}</td><td>{i.duration} min</td><td>{i.participation >= 80 ? "Alta" : i.participation >= 65 ? "Media" : "Bassa"}<small>{i.participation}%</small></td><td><ModeBadge mode={i.mode} /></td></tr>)}</tbody></table></div><DataExplanation>Nessuna trascrizione, nessun argomento: dal dispositivo escono solo dati aggregati.</DataExplanation></section>; }

function Trend({ resident }) { return <section className="content-section"><div className="content-toolbar"><div><h2>Andamento personale</h2><p>Confronti sempre riferiti alla baseline di {resident.name.split(" ")[0]}.</p></div><PeriodSelect options={["Ultimi 30 giorni", "Ultimi 90 giorni"]} /></div><div className="trend-grid">{[["Partecipazione", 76, "+6%"], ["Iniziativa conversazionale", 64, "−2%"], ["Varietà dei contesti", 82, "+9%"], ["Continuità", 71, "+3%"]].map(([label, value, delta]) => <article className="surface" key={label}><span>{label}</span><strong>{value}%</strong><ProgressBar value={value} tone="mint" /><small>{delta} rispetto alla baseline</small></article>)}</div><DataExplanation>Questi indicatori descrivono solo ciò che accade durante le interazioni con ROSS e non rappresentano valutazioni cliniche.</DataExplanation></section>; }

function Documents({ resident, documents, navigate }) {
  const toChat = () => navigate(`/?ospite=${resident.id}`);
  return <section className="content-section"><div className="content-toolbar"><div><h2>Documenti</h2><p>Referti e relazioni allegati in chat, che ROSS può citare come fonte. La cartella clinica ufficiale resta nel gestionale.</p></div><button className="ghost-button" onClick={toChat}><Paperclip size={16} /> Allega dalla chat</button></div>
    {!documents.length ? <EmptyState title="Nessun documento" description="Allega referti e relazioni dalla chat: ROSS li userà come fonte." icon={FileText} /> : <div className="document-list">{documents.map((doc) => <article className="document-card surface" key={doc.id}><span className="document-icon"><FileText size={20} /></span><div><small>{doc.kind} · {doc.date}</small><h3>{doc.title}</h3><p>{doc.summary}</p><span className="document-meta">{doc.author} · {doc.pages} {doc.pages === 1 ? "pagina" : "pagine"}</span></div><button className="ghost-button" onClick={() => navigate(`/?ospite=${resident.id}&q=${encodeURIComponent(`Cosa dice ${doc.kind.toLowerCase()} di ${resident.name.split(" ")[0]}?`)}`)}><Sparkles size={15} /> Chiedi a ROSS</button></article>)}</div>}
    <DataExplanation>ROSS legge i documenti per rispondere alle domande dello staff e li cita come fonte. Non interpreta valori clinici e non sostituisce il gestionale.</DataExplanation>
  </section>;
}
